import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { getStripe } from '$lib/server/stripe';
import { markIdentityVerified } from '$lib/server/verification';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	const stripe = getStripe();
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json({ error: 'Missing signature' }, { status: 400 });
	}

	try {
		const body = await request.text();
		const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

		// Verarbeite Event
		if (event.type === 'identity.verification_session.verified') {
			const session = event.data.object as Stripe.Identity.VerificationSession;
			const userId = session.metadata?.userId;

			if (userId) {
				// Markiere User als verifiziert
				await markIdentityVerified(userId);
				console.log(`✅ Identity verified for user ${userId}`);
			}
		} else if (event.type === 'identity.verification_session.requires_input') {
			const session = event.data.object as Stripe.Identity.VerificationSession;
			console.log(`⚠️ Identity verification requires input:`, session.last_error);
		}

		return json({ received: true });
	} catch (error) {
		console.error('Webhook error:', error);
		return json({ error: 'Webhook error' }, { status: 400 });
	}
};

