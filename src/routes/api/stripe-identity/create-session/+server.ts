import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStripe } from '$lib/server/stripe';
import { saveStripeIdentitySession } from '$lib/server/verification';

export const POST: RequestHandler = async ({ locals }) => {
	const stripe = getStripe();
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Email muss verifiziert sein
	if (!locals.user.emailVerified) {
		return json({ error: 'Email muss zuerst verifiziert werden' }, { status: 403 });
	}

	// Bereits verifiziert?
	if (locals.user.identityVerified) {
		return json({ error: 'Identität bereits verifiziert' }, { status: 400 });
	}

	try {
		// Erstelle Stripe Identity Verification Session
		const verificationSession = await stripe.identity.verificationSessions.create({
			type: 'document',
			metadata: {
				userId: locals.user.id
			},
			options: {
				document: {
					require_live_capture: true,
					require_matching_selfie: true
				}
			},
			return_url: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/dashboard?identity_verified=true`
		});

		// Speichere Session ID in der DB
		await saveStripeIdentitySession(locals.user.id, verificationSession.id);

		return json({
			success: true,
			sessionId: verificationSession.id,
			clientSecret: verificationSession.client_secret,
			url: verificationSession.url
		});
	} catch (error) {
		console.error('Error creating Stripe Identity session:', error);
		return json({ error: 'Fehler beim Erstellen der Verifizierungssession' }, { status: 500 });
	}
};

