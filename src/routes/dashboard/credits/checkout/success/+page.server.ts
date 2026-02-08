import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, url, locals }) => {
	const { user } = await parent();
	const orderId = url.searchParams.get('orderId');
	const token = url.searchParams.get('token');
	const PayerID = url.searchParams.get('PayerID');

	if (!orderId) {
		throw redirect(302, '/dashboard/credits');
	}

	// Order aus DB laden
	const order = await prisma.order.findUnique({
		where: { orderNumber: orderId }
	});

	if (!order || order.userId !== user.id) {
		throw redirect(302, '/dashboard/credits');
	}

	// PayPal Payment capturen (wenn token vorhanden)
	if (token && PayerID && order.paymentMethod === 'PAYPAL') {
		try {
			await capturePayPalPayment(token, orderId);
			
			// Order als bezahlt markieren
			await prisma.order.update({
				where: { id: order.id },
				data: {
					status: 'COMPLETED',
					paymentStatus: 'PAID'
				} as any
			});

			// Credits zum User hinzufügen
			const userWithCredits = await prisma.user.findUnique({
				where: { id: user.id }
			});

			if (userWithCredits) {
				const currentCredits = (userWithCredits as any).credits || 0;
				await prisma.user.update({
					where: { id: user.id },
					data: {
						credits: currentCredits + order.total
					} as any
				});
			}

			// Erstelle Rechnung für Guthaben-Aufladung
			const { createInvoiceForCredits } = await import('$lib/server/invoice-helper');
			await createInvoiceForCredits(user.id, order.total, order.id);
		} catch (error) {
			console.error('Error capturing PayPal payment:', error);
		}
	}

	return {
		order,
		success: true
	};
};

async function capturePayPalPayment(token: string, orderId: string) {
	const paypalClientId = process.env.PAYPAL_CLIENT_ID;
	const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
	const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

	if (!paypalClientId || !paypalClientSecret) {
		throw new Error('PayPal credentials not configured');
	}

	// Access Token holen
	const tokenResponse = await fetch(
		`https://api-m.${paypalMode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v1/oauth2/token`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`
			},
			body: 'grant_type=client_credentials'
		}
	);

	if (!tokenResponse.ok) {
		throw new Error('Failed to get PayPal access token');
	}

	const { access_token } = await tokenResponse.json();

	// Payment capturen
	const captureResponse = await fetch(
		`https://api-m.${paypalMode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders/${token}/capture`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access_token}`
			}
		}
	);

	if (!captureResponse.ok) {
		const error = await captureResponse.json();
		console.error('PayPal capture error:', error);
		throw new Error('Failed to capture PayPal payment');
	}

	return await captureResponse.json();
}

