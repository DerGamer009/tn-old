import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();
	if (!user) throw redirect(302, '/login');

	// Hole Konfigurationsdaten aus URL-Parametern
	const name = url.searchParams.get('name');
	const cpu = url.searchParams.get('cpu');
	const ram = url.searchParams.get('ram');
	const storage = url.searchParams.get('storage');
	const app = url.searchParams.get('app');
	const eggId = url.searchParams.get('eggId');
	const price = url.searchParams.get('price');

	if (!name || !cpu || !ram || !storage || !app || !eggId || !price) {
		throw redirect(302, '/apps/konfigurator');
	}

	const priceNum = parseFloat(price);
	if (isNaN(priceNum) || priceNum <= 0) {
		throw redirect(302, '/apps/konfigurator');
	}

	// Lade User mit Credits
	const userWithCredits = await prisma.user.findUnique({
		where: { id: user.id }
	});

	return {
		name,
		cpu: parseInt(cpu, 10),
		ram: parseInt(ram, 10),
		storage: parseInt(storage, 10),
		app,
		eggId: parseInt(eggId, 10),
		price: priceNum,
		credits: ((userWithCredits as any)?.credits as number) || 0.00
	};
};

export const actions = {
	processPayment: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const data = await request.formData();
		const paymentMethod = data.get('paymentMethod') as string;
		const name = data.get('name') as string;
		const cpu = data.get('cpu') as string;
		const ram = data.get('ram') as string;
		const storage = data.get('storage') as string;
		const app = data.get('app') as string;
		const eggId = data.get('eggId') as string;
		const price = data.get('price') as string;

		if (!paymentMethod || !name || !cpu || !ram || !storage || !app || !eggId || !price) {
			return fail(400, { error: 'Fehlende Daten' });
		}

		const priceNum = parseFloat(price);
		if (isNaN(priceNum) || priceNum <= 0) {
			return fail(400, { error: 'Ungültiger Preis' });
		}

		try {
			if (paymentMethod === 'paypal') {
				// PayPal Checkout erstellen
				const orderId = `app-${Date.now()}-${locals.user!.id}`;
				
				const paypalUrl = await createPayPalOrder(priceNum, orderId, locals.user!.id, 'App Hosting');
				
				// Order in DB speichern
				await prisma.order.create({
					data: {
						id: orderId,
						orderNumber: orderId,
						status: 'PENDING',
						total: priceNum,
						paymentMethod: 'PAYPAL',
						paymentStatus: 'PENDING',
						userId: locals.user!.id,
					metadata: JSON.stringify({
						type: 'app',
						name,
						cpu: parseInt(cpu, 10),
						ram: parseInt(ram, 10),
						storage: parseInt(storage, 10),
						app,
						eggId: parseInt(eggId, 10)
					})
				}
			});

				throw redirect(302, paypalUrl);
			} else if (paymentMethod === 'klarna') {
				// Klarna Checkout erstellen
				const orderId = `app-${Date.now()}-${locals.user!.id}`;
				
				const klarnaSession = await createKlarnaSession(priceNum, orderId, locals.user!, 'App Hosting');
				
				// Order in DB speichern
				await prisma.order.create({
					data: {
						id: orderId,
						orderNumber: orderId,
						status: 'PENDING',
						total: priceNum,
						paymentMethod: 'KLARNA',
						paymentStatus: 'PENDING',
						userId: locals.user!.id,
					metadata: JSON.stringify({
						type: 'app',
						name,
						cpu: parseInt(cpu, 10),
						ram: parseInt(ram, 10),
						storage: parseInt(storage, 10),
						app,
						eggId: parseInt(eggId, 10)
					})
				}
			});

				return {
					success: true,
					klarnaSessionId: klarnaSession.sessionId,
					klarnaClientToken: klarnaSession.clientToken
				};
			} else if (paymentMethod === 'credits') {
				// Credits-Zahlung
				const userWithCredits = await prisma.user.findUnique({
					where: { id: locals.user!.id }
				}) as any;

				const userCredits = (userWithCredits?.credits as number) || 0;
				if (userCredits < priceNum) {
					return fail(400, { error: 'Nicht genügend Credits' });
				}

				const orderId = `app-${Date.now()}-${locals.user!.id}`;

				// Erstelle Order und Server in Transaktion
				await prisma.$transaction(async (tx) => {
					// Order erstellen
					await tx.order.create({
						data: {
							id: orderId,
							orderNumber: orderId,
							status: 'COMPLETED',
							total: priceNum,
							paymentMethod: 'CREDITS',
							paymentStatus: 'PAID',
							userId: locals.user!.id,
					metadata: JSON.stringify({
						type: 'app',
						name,
						cpu: parseInt(cpu, 10),
						ram: parseInt(ram, 10),
						storage: parseInt(storage, 10),
						app,
						eggId: parseInt(eggId, 10)
					})
				}
			});

					// Credits abziehen
					await tx.user.update({
						where: { id: locals.user!.id },
						data: {
							credits: { decrement: priceNum }
						} as any
					});
				});

				// Erstelle App Hosting Server
				const { createAppHostingServer } = await import('$lib/server/app-hosting');
				await createAppHostingServer({
					userId: locals.user!.id,
					name,
					cpu: parseInt(cpu, 10),
					ram: parseInt(ram, 10),
					storage: parseInt(storage, 10),
					priceMonthly: priceNum * 100, // In Cent
					eggId: parseInt(eggId, 10),
					orderId
				});

				throw redirect(302, `/apps/checkout/success?orderId=${orderId}`);
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
async function createPayPalOrder(amount: number, orderId: string, userId: string, productType: string): Promise<string> {
	const paypalClientId = process.env.PAYPAL_CLIENT_ID;
	const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
	const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

	if (!paypalClientId || !paypalClientSecret) {
		throw new Error('PayPal credentials not configured');
	}

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
						description: `${productType} Bestellung ${amount.toFixed(2)}€`,
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
					return_url: `${process.env.PUBLIC_APP_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/apps/checkout/success?orderId=${orderId}`,
					cancel_url: `${process.env.PUBLIC_APP_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/apps/checkout/cancel`
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
	const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
	if (!approvalUrl) {
		throw new Error('PayPal approval URL not found');
	}

	return approvalUrl;
}

// Klarna Session erstellen
async function createKlarnaSession(amount: number, orderId: string, user: any, productType: string) {
	const klarnaUsername = process.env.KLARNA_USERNAME;
	const klarnaPassword = process.env.KLARNA_PASSWORD;
	const klarnaMode = process.env.KLARNA_MODE || 'test';

	if (!klarnaUsername || !klarnaPassword) {
		throw new Error('Klarna credentials not configured');
	}

	const baseUrl = klarnaMode === 'test' 
		? 'https://api.playground.klarna.com'
		: 'https://api.klarna.com';

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
			order_amount: Math.round(amount * 100),
			order_tax_amount: 0,
			order_lines: [
				{
					name: `${productType} Bestellung ${amount.toFixed(2)}€`,
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
