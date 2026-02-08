import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';
import { logLoginActivity } from '$lib/server/activity';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

// IP-Helfer wie auf der Login-Seite
function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');
	const cfConnectingIp = request.headers.get('cf-connecting-ip');

	if (cfConnectingIp) return cfConnectingIp;
	if (realIp) return realIp;
	if (forwardedFor) return forwardedFor.split(',')[0].trim();

	return 'unknown';
}

export const load: PageServerLoad = async ({ cookies }) => {
	const pending = cookies.get('pending_2fa');
	if (!pending) {
		throw redirect(302, '/login');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const pending = cookies.get('pending_2fa');
		if (!pending) {
			throw redirect(302, '/login');
		}

		let parsed: { userId: string; rememberMe: boolean };
		try {
			parsed = JSON.parse(pending);
		} catch {
			cookies.delete('pending_2fa', { path: '/' });
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const code = (formData.get('code') as string | null)?.trim() || '';
		const mode = (formData.get('mode') as string | null) || 'totp';

		if (!code) {
			return fail(400, { error: 'Bitte gib deinen Code ein.' });
		}

		// Einfache Rate-Limit-Logik pro Browser (Cookie-basiert)
		const attemptsCookie = cookies.get('twofa_attempts');
		let attempts = { count: 0, firstAt: Date.now() };
		if (attemptsCookie) {
			try {
				attempts = JSON.parse(attemptsCookie);
			} catch {
				attempts = { count: 0, firstAt: Date.now() };
			}
		}

		const windowMs = 10 * 60 * 1000; // 10 Minuten
		if (Date.now() - attempts.firstAt > windowMs) {
			attempts = { count: 0, firstAt: Date.now() };
		}

		if (attempts.count >= 10) {
			return fail(429, {
				error: 'Zu viele 2FA-Versuche. Bitte warte ein paar Minuten und versuche es erneut.'
			});
		}

		attempts.count += 1;
		cookies.set('twofa_attempts', JSON.stringify(attempts), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 // 1 Stunde
		});

		try {
			const dbUser = (await prisma.user.findUnique({
				where: { id: parsed.userId }
			})) as any;

			if (!dbUser || !dbUser.twoFactorEnabled) {
				cookies.delete('pending_2fa', { path: '/' });
				throw redirect(302, '/login');
			}

			let validSecondFactor = false;

			// TOTP (Authenticator-App)
			if (mode === 'totp') {
				if (!dbUser.twoFactorSecret) {
					return fail(400, { error: '2FA ist für diesen Account nicht korrekt eingerichtet.' });
				}

				const okTotp = authenticator.verify({
					token: code,
					secret: dbUser.twoFactorSecret as string
				});

				if (!okTotp) {
					return fail(400, { error: 'Der eingegebene Code ist ungültig.' });
				}

				validSecondFactor = true;
			}

			// Backup-Code
			if (!validSecondFactor && mode === 'backup') {
				const codes = (dbUser.twoFactorBackupCodes ?? []) as string[];
				let matchIndex = -1;

				for (let i = 0; i < codes.length; i++) {
					const ok = await bcrypt.compare(code, codes[i]);
					if (ok) {
						matchIndex = i;
						break;
					}
				}

				if (matchIndex === -1) {
					return fail(400, {
						error: 'Der angegebene Backup-Code ist ungültig oder wurde bereits verwendet.'
					});
				}

				// verwendeten Code entfernen
				codes.splice(matchIndex, 1);

				await prisma.user.update({
					where: { id: parsed.userId },
					data: {
						twoFactorBackupCodes: codes
					} as any
				});

				validSecondFactor = true;
			}

			if (!validSecondFactor) {
				return fail(400, { error: 'Der angegebene Code ist ungültig.' });
			}

			// 2FA bestanden -> Pending-Cookie & Attempt-Cookie löschen, Session erstellen
			cookies.delete('pending_2fa', { path: '/' });
			cookies.delete('twofa_attempts', { path: '/' });

			const sessionToken = await createSession(parsed.userId);

			const ipAddress = getClientIp(request);
			const userAgent = request.headers.get('user-agent');
			await logLoginActivity(parsed.userId, ipAddress, userAgent, 'success');

			const maxAge = parsed.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge
			});

			throw redirect(303, '/dashboard');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			console.error('2FA-Login-Fehler:', error);
			return fail(500, {
				error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
			});
		}
	}
} satisfies Actions;

