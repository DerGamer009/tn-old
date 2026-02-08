import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();

	const amount = url.searchParams.get('amount');
	const paymentMethod = url.searchParams.get('paymentMethod') || 'paypal';

	if (!amount) {
		throw redirect(302, '/dashboard/credits');
	}

	const amountNum = parseFloat(amount);
	if (isNaN(amountNum) || amountNum < 5) {
		throw redirect(302, '/dashboard/credits');
	}

	// Lade User mit Credits
	const userWithCredits = await prisma.user.findUnique({
		where: { id: user.id }
	});

	return {
		amount: amountNum,
		paymentMethod,
		credits: ((userWithCredits as any)?.credits as number) || 0.00
	};
};

export const actions = {
	processPayment: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const data = await request.formData();
		const amountStr = data.get('amount') as string;
		const paymentMethod = data.get('paymentMethod') as string;

		if (!amountStr || !paymentMethod) {
			return fail(400, { error: 'Fehlende Daten' });
		}

		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount < 5) {
			return fail(400, { error: 'Ungültiger Betrag' });
		}

		try {
			if (paymentMethod === 'paypal') {
				// PayPal Checkout erstellen
				const orderId = `credit-${Date.now()}-${locals.user.id}`;
				
				// Hier würde die PayPal API aufgerufen werden
				// Für jetzt simulieren wir die Weiterleitung zu PayPal
				const paypalUrl = await createPayPalOrder(amount, orderId, locals.user.id);
				
				// Order in DB speichern
				await prisma.order.create({
					data: {
						id: orderId,
						orderNumber: orderId,
						status: 'PENDING',
						total: amount,
						paymentMethod: 'PAYPAL',
						paymentStatus: 'PENDING',
						userId: locals.user.id
					} as any
				});

				throw redirect(302, paypalUrl);
			} else if (paymentMethod === 'klarna') {
				// Klarna Checkout erstellen
				const orderId = `credit-${Date.now()}-${locals.user.id}`;
				
				// Hier würde die Klarna API aufgerufen werden
				const klarnaSession = await createKlarnaSession(amount, orderId, locals.user);
				
				// Order in DB speichern
				await prisma.order.create({
					data: {
						id: orderId,
						orderNumber: orderId,
						status: 'PENDING',
						total: amount,
						paymentMethod: 'KLARNA',
						paymentStatus: 'PENDING',
						userId: locals.user.id
					} as any
				});

				return {
					success: true,
					klarnaSessionId: klarnaSession.sessionId,
					klarnaClientToken: klarnaSession.clientToken
				};
			}

			return fail(400, { error: 'Ungültige Zahlungsmethode' });
		} catch (error: any) {
			if (error.status === 302) {
				throw error; // Redirect weiterwerfen
			}
			console.error('Error processing payment:', error);
			return fail(500, { error: 'Fehler bei der Zahlungsverarbeitung' });
		}
	}
} satisfies Actions;

// PayPal Order erstellen
async function createPayPalOrder(amount: number, orderId: string, userId: string): Promise<string> {
	const paypalClientId = process.env.PAYPAL_CLIENT_ID;
	const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
	const paypalMode = process.env.PAYPAL_MODE || 'sandbox'; // sandbox oder live

	if (!paypalClientId || !paypalClientSecret) {
		throw new Error('PayPal credentials not configured');
	}

	// PayPal Access Token holen
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

	// PayPal Order erstellen
	const orderResponse = await fetch(
		`https://api-m.${paypalMode === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access_token}`,
				'PayPal-Request-Id': orderId
			},
			body: JSON.stringify({
				intent: 'CAPTURE',
				purchase_units: [
					{
						reference_id: orderId,
						description: `Guthaben-Aufladung ${amount.toFixed(2)}€`,
						amount: {
							currency_code: 'EUR',
							value: amount.toFixed(2)
						}
					}
				],
				application_context: {
					brand_name: 'TitanNode',
					landing_page: 'BILLING',
					user_action: 'PAY_NOW',
					return_url: `${process.env.PUBLIC_APP_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/dashboard/credits/checkout/success?orderId=${orderId}`,
					cancel_url: `${process.env.PUBLIC_APP_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/dashboard/credits/checkout/cancel`
				}
			})
		}
	);

	if (!orderResponse.ok) {
		const error = await orderResponse.json();
		console.error('PayPal order creation error:', error);
		throw new Error('Failed to create PayPal order');
	}

	const order = await orderResponse.json();

	// Approval URL finden
	const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
	if (!approvalUrl) {
		throw new Error('PayPal approval URL not found');
	}

	return approvalUrl;
}

// Klarna Session erstellen
async function createKlarnaSession(amount: number, orderId: string, user: any) {
	const klarnaUsername = process.env.KLARNA_USERNAME;
	const klarnaPassword = process.env.KLARNA_PASSWORD;
	const klarnaMode = process.env.KLARNA_MODE || 'test'; // test oder live

	if (!klarnaUsername || !klarnaPassword) {
		throw new Error('Klarna credentials not configured');
	}

	const baseUrl = klarnaMode === 'test' 
		? 'https://api.playground.klarna.com'
		: 'https://api.klarna.com';

	// Klarna Session erstellen
	const sessionResponse = await fetch(`${baseUrl}/payments/v1/sessions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${Buffer.from(`${klarnaUsername}:${klarnaPassword}`).toString('base64')}`
		},
		body: JSON.stringify({
			purchase_country: 'DE',
			purchase_currency: 'EUR',
			locale: 'de-DE',
			order_amount: Math.round(amount * 100), // in Cents
			order_tax_amount: 0,
			order_lines: [
				{
					name: `Guthaben-Aufladung ${amount.toFixed(2)}€`,
					quantity: 1,
					unit_price: Math.round(amount * 100),
					tax_rate: 0,
					total_amount: Math.round(amount * 100),
					total_tax_amount: 0
				}
			],
			billing_address: {
				given_name: user.firstName,
				family_name: user.lastName,
				email: user.email
			}
		})
	});

	if (!sessionResponse.ok) {
		const error = await sessionResponse.json();
		console.error('Klarna session creation error:', error);
		throw new Error('Failed to create Klarna session');
	}

	const session = await sessionResponse.json();

	return {
		sessionId: session.session_id,
		clientToken: session.client_token
	};
}

