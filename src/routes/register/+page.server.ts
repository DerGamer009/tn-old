import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createUser } from '$lib/server/auth';
import { logLoginActivity } from '$lib/server/activity';
import { prisma } from '$lib/server/prisma';
import { createVerificationToken } from '$lib/server/verification';
import { sendVerificationEmail } from '$lib/server/email';

// Redirect wenn bereits eingeloggt
export const load: PageServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get('session');
	if (sessionToken) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

// Hilfsfunktion um IP-Adresse zu extrahieren
function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');
	const cfConnectingIp = request.headers.get('cf-connecting-ip');

	if (cfConnectingIp) return cfConnectingIp;
	if (realIp) return realIp;
	if (forwardedFor) return forwardedFor.split(',')[0].trim();

	return 'unknown';
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const firstName = data.get('firstName') as string;
		const lastName = data.get('lastName') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;
		const acceptTerms = data.get('acceptTerms') === 'on';

		// IP-Adresse und User-Agent extrahieren
		const ipAddress = getClientIp(request);
		const userAgent = request.headers.get('user-agent');

		// Validierung
		if (!firstName || firstName.length < 2) {
			return fail(400, {
				error: 'Vorname muss mindestens 2 Zeichen lang sein',
				firstName,
				lastName,
				email
			});
		}

		if (!lastName || lastName.length < 2) {
			return fail(400, {
				error: 'Nachname muss mindestens 2 Zeichen lang sein',
				firstName,
				lastName,
				email
			});
		}

		if (!email || !email.includes('@')) {
			return fail(400, {
				error: 'Bitte gib eine gültige E-Mail-Adresse ein',
				firstName,
				lastName,
				email
			});
		}

		if (!password || password.length < 8) {
			return fail(400, {
				error: 'Passwort muss mindestens 8 Zeichen lang sein',
				firstName,
				lastName,
				email
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwörter stimmen nicht überein',
				firstName,
				lastName,
				email
			});
		}

		if (!acceptTerms) {
			return fail(400, {
				error: 'Bitte akzeptiere die AGB',
				firstName,
				lastName,
				email
			});
		}

		// Prüfe ob E-Mail bereits existiert
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return fail(400, {
				error: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits',
				firstName,
				lastName,
				email
			});
		}

		try {
			// User erstellen (emailVerified = false per default)
			const user = await createUser({
				email,
				firstName,
				lastName,
				password
			});

			// Erste Login-Aktivität loggen (Registrierung)
			await logLoginActivity(user.id, ipAddress, userAgent, 'success');

			// Verification Token erstellen
			const verificationToken = await createVerificationToken(user.id);

			// Verification Email senden (Fehler blockieren nicht die Registrierung)
			try {
				const emailResult = await sendVerificationEmail(email, verificationToken, `${firstName} ${lastName}`);
				if (!emailResult.success) {
					console.error('Email-Versendung fehlgeschlagen:', emailResult.error);
					// User wurde erstellt, aber Email konnte nicht gesendet werden
					// Das ist nicht kritisch, da der User die Email später erneut anfordern kann
				}
			} catch (emailError) {
				console.error('Fehler beim Senden der Verification Email:', emailError);
				// User wurde erstellt, aber Email konnte nicht gesendet werden
				// Das ist nicht kritisch, da der User die Email später erneut anfordern kann
			}

			// Redirect zur Success-Seite mit Email als Parameter (für Resend-Funktion)
			throw redirect(303, `/register/success?email=${encodeURIComponent(email)}`);
		} catch (error) {
			// Redirect-Exceptions weiterwerfen
			if (isRedirect(error)) {
				throw error;
			}
			
			console.error('Registrierungsfehler:', error);
			
			// Spezifische Fehlermeldungen basierend auf Fehlertyp
			if (error instanceof Error) {
				return fail(500, {
					error: error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
					firstName,
					lastName,
					email
				});
			}
			
			return fail(500, {
				error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
				firstName,
				lastName,
				email
			});
		}
	}
} satisfies Actions;

