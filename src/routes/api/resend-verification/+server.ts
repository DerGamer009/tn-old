import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { createVerificationToken } from '$lib/server/verification';
import { sendVerificationEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ locals, request }) => {
	// Check ob User eingeloggt ist
	if (!locals.user) {
		// Wenn nicht eingeloggt, Email aus Request Body nehmen
		const { email } = await request.json();
		
		if (!email) {
			return json({ success: false, error: 'Email fehlt' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			// Aus Sicherheitsgründen nicht verraten, ob User existiert
			return json({ success: true, message: 'Falls ein Account existiert, wurde eine Email gesendet' });
		}

		// Bereits verifiziert?
		if (user.emailVerified) {
			return json({ success: false, error: 'Email bereits verifiziert' }, { status: 400 });
		}

		// Neuen Token erstellen
		const verificationToken = await createVerificationToken(user.id);

		// Email senden
		await sendVerificationEmail(
			user.email,
			verificationToken,
			`${user.firstName} ${user.lastName}`
		);

		return json({ success: true, message: 'Bestätigungs-Email wurde erneut gesendet' });
	}

	// User ist eingeloggt
	if (locals.user.emailVerified) {
		return json({ success: false, error: 'Email bereits verifiziert' }, { status: 400 });
	}

	// User aus DB holen für vollständige Daten
	const user = await prisma.user.findUnique({
		where: { id: locals.user.id }
	});

	if (!user) {
		return json({ success: false, error: 'User nicht gefunden' }, { status: 404 });
	}

	try {
		// Neuen Token erstellen
		const verificationToken = await createVerificationToken(user.id);

		// Email senden
		await sendVerificationEmail(
			user.email,
			verificationToken,
			`${user.firstName} ${user.lastName}`
		);

		return json({ success: true, message: 'Bestätigungs-Email wurde erneut gesendet' });
	} catch (error) {
		console.error('Error resending verification email:', error);
		return json({ success: false, error: 'Fehler beim Senden der Email' }, { status: 500 });
	}
};

