import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();

	const orderId = url.searchParams.get('orderId');
	const token = url.searchParams.get('token');
	const PayerID = url.searchParams.get('PayerID');

	if (!orderId) {
		throw redirect(302, '/gameserver');
	}

	// Hole Order mit Metadata
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: {
			servers: {
				where: { type: 'GAMESERVER' },
				take: 1
			}
		}
	}) as any;

	if (!order || order.userId !== user!.id) {
		throw redirect(302, '/gameserver');
	}

	// Parse Metadata
	let metadata: any = {};
	try {
		if (order.metadata) {
			metadata = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : order.metadata;
		}
	} catch (e) {
		console.error('Fehler beim Parsen der Order-Metadata:', e);
	}

	// PayPal Payment capturen (wenn token vorhanden)
	if (token && PayerID && order.paymentMethod === 'PAYPAL' && order.paymentStatus === 'PENDING') {
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

			// Erstelle Gameserver nach erfolgreicher Zahlung
			if (metadata.type === 'gameserver') {
				try {
					const { createGameserver } = await import('$lib/server/gameserver');
					await createGameserver({
						userId: user!.id,
						name: metadata.name || 'Mein Gameserver',
						cpu: metadata.cpu || 2,
						ram: metadata.ram || 4,
						storage: metadata.storage || 20,
						priceMonthly: order.total * 100, // In Cent
						eggId: metadata.eggId || 16,
						nestId: metadata.nestId ?? 6,
						game: metadata.game || 'minecraft-java',
						slots: metadata.slots || 10,
						locationId: metadata.locationId || parseInt(process.env.PTERODACTYL_LOCATION_ID || '2', 10),
						dockerImage: metadata.dockerImage,
						orderId: order.id
					});
				} catch (error) {
					console.error('Fehler beim Erstellen des Gameservers:', error);
				}
			}
		} catch (error) {
			console.error('Error capturing PayPal payment:', error);
		}
	}

	// Lade Order erneut nach möglichen Updates
	const updatedOrder = await prisma.order.findUnique({
		where: { id: orderId },
		include: {
			servers: {
				where: { type: 'GAMESERVER' },
				take: 1
			}
		}
	}) as any;

	return {
		order: updatedOrder || order,
		server: updatedOrder?.servers?.[0] || order?.servers?.[0] || null,
		metadata
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
