import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyEmail } from '$lib/server/verification';
import { sendWelcomeEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token } = await request.json();

		if (!token) {
			return json({ success: false, error: 'Token fehlt' }, { status: 400 });
		}

		const result = await verifyEmail(token);

		if (result.success && result.user) {
			// Sende Willkommens-Email
			await sendWelcomeEmail(
				result.user.email,
				`${result.user.firstName} ${result.user.lastName}`
			);

			return json({ success: true });
		} else {
			return json({ success: false, error: result.error }, { status: 400 });
		}
	} catch (error) {
		console.error('Error verifying email:', error);
		return json({ success: false, error: 'Interner Fehler' }, { status: 500 });
	}
};

