import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies, request }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('oauth_google_state');
	if (!state || !storedState || state !== storedState) {
		console.error('Ungültiger Google OAuth State');
		throw redirect(302, '/login');
	}

	cookies.delete('oauth_google_state', { path: '/' });

	if (!code) {
		console.error('Kein Code von Google erhalten');
		throw redirect(302, '/login');
	}

	const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
	const clientSecret = env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
	const redirectUri =
		env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || `${url.origin}/auth/google/callback`;

	if (!clientId || !clientSecret) {
		console.error('Google OAuth Konfiguration unvollständig');
		throw redirect(302, '/login');
	}

	try {
		// Code gegen Token tauschen
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code'
			})
		});

		if (!tokenResponse.ok) {
			console.error('Fehler beim Token-Austausch mit Google', await tokenResponse.text());
			throw redirect(302, '/login');
		}

		const tokenJson = (await tokenResponse.json()) as {
			access_token: string;
			id_token?: string;
		};

		// Userinfo laden
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {
				Authorization: `Bearer ${tokenJson.access_token}`
			}
		});

		if (!userInfoResponse.ok) {
			console.error('Fehler beim Laden der Google Userinfo', await userInfoResponse.text());
			throw redirect(302, '/login');
		}

		const profile = (await userInfoResponse.json()) as {
			sub: string;
			email: string;
			email_verified: boolean;
			given_name?: string;
			family_name?: string;
			name?: string;
			picture?: string;
		};

		// Account / User in der DB anlegen oder finden
		const provider = 'google';
		const providerAccountId = profile.sub;

		// Gibt es bereits einen Account für dieses Google-Konto?
		let account = await prisma.account.findUnique({
			where: {
				provider_providerAccountId: {
					provider,
					providerAccountId
				}
			}
		});

		let userId: string;

		if (account) {
			userId = account.userId;
		} else {
			// Gibt es bereits einen User mit dieser Email?
			const existingUser = await prisma.user.findUnique({
				where: { email: profile.email }
			});

			let user;
			if (existingUser) {
				user = existingUser;
			} else {
				// neuen User anlegen (ohne Passwort, mit verifizierter Email)
				user = await prisma.user.create({
					data: {
						email: profile.email,
						firstName: profile.given_name || profile.name || 'Google',
						lastName: profile.family_name || '',
						password: '',
						image: profile.picture,
						emailVerified: profile.email_verified ?? false
					}
				});
			}

			userId = user.id;

			// OAuth Account verknüpfen
			account = await prisma.account.create({
				data: {
					userId,
					type: 'oauth',
					provider,
					providerAccountId,
					access_token: tokenJson.access_token,
					id_token: tokenJson.id_token ?? null
				}
			});
		}

		// Session erstellen
		const sessionToken = await createSession(userId);

		const ipAddress =
			request.headers.get('x-forwarded-for') ??
			request.headers.get('x-real-ip') ??
			request.headers.get('cf-connecting-ip') ??
			'unknown';

		const userAgent = request.headers.get('user-agent');

		// Login-Aktivität loggen
		try {
			await prisma.loginActivity.create({
				data: {
					userId,
					ipAddress,
					userAgent,
					status: 'success'
				}
			});
		} catch (e) {
			console.error('Fehler beim Loggen der Login-Aktivität für Google OAuth:', e);
		}

		// Session-Cookie setzen (30 Tage für Social Login)
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30
		});

		throw redirect(303, '/dashboard');
	} catch (error) {
		console.error('Google OAuth Fehler:', error);
		throw redirect(302, '/login');
	}
};

