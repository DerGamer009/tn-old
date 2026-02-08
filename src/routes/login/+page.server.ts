import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authenticateUser, createSession } from '$lib/server/auth';
import { logLoginActivity } from '$lib/server/activity';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

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
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const rememberMe = data.get('rememberMe') === 'on';

		// Validierung
		if (!email || !email.includes('@')) {
			return fail(400, {
				error: 'Bitte gib eine gültige E-Mail-Adresse ein',
				email
			});
		}

		if (!password) {
			return fail(400, {
				error: 'Bitte gib dein Passwort ein',
				email
			});
		}

		try {
			// User authentifizieren
			const user = await authenticateUser(email, password);

			if (!user) {
				// Fehlgeschlagenen Login loggen (falls User existiert)
				// Hier könnten wir auch failed logins tracken
				return fail(400, {
					error: 'E-Mail oder Passwort ist falsch',
					email
				});
			}

			// Prüfe ob User aktiv ist
			if (!user.isActive) {
				return fail(403, {
					error: 'Dein Account wurde deaktiviert',
					email
				});
			}

			// Zwei-Faktor-Status aus DB lesen
			const dbUser = (await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					twoFactorEnabled: true
				} as any
			})) as any;

			// Wenn 2FA aktiv ist → auf /login/2fa umleiten und temporären Cookie setzen
			if (dbUser?.twoFactorEnabled) {
				const payload = JSON.stringify({
					userId: user.id,
					rememberMe
				});

				cookies.set('pending_2fa', payload, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 10 // 10 Minuten gültig
				});

				throw redirect(303, '/login/2fa');
			}

			// IP-Adresse und User-Agent extrahieren
			const ipAddress = getClientIp(request);
			const userAgent = request.headers.get('user-agent');

			// Erfolgreichen Login loggen (ohne 2FA)
			await logLoginActivity(user.id, ipAddress, userAgent, 'success');

			// Session erstellen
			const sessionToken = await createSession(user.id);

			// Cookie-Optionen
			const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 Tage oder 1 Tag

			// Cookie setzen
			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge
			});

			// Redirect zum Dashboard
			throw redirect(303, '/dashboard');
		} catch (error) {
			// Redirect-Exceptions weiterwerfen
			if (isRedirect(error)) {
				throw error;
			}
			
			console.error('Login-Fehler:', error);
			
			// Spezifische Fehlermeldungen basierend auf Fehlertyp
			if (error instanceof Error) {
				return fail(500, {
					error: error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
					email
				});
			}
			
			return fail(500, {
				error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
				email
			});
		}
	}
} satisfies Actions;

