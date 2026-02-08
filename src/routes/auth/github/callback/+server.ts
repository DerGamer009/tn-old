import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies, request }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('oauth_github_state');
	if (!state || !storedState || state !== storedState) {
		console.error('Ungültiger GitHub OAuth State');
		throw redirect(302, '/login');
	}

	cookies.delete('oauth_github_state', { path: '/' });

	if (!code) {
		console.error('Kein Code von GitHub erhalten');
		throw redirect(302, '/login');
	}

	const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
	const clientSecret = env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;
	const redirectUri =
		env.GITHUB_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI || `${url.origin}/auth/github/callback`;

	if (!clientId || !clientSecret) {
		console.error('GitHub OAuth Konfiguration unvollständig');
		throw redirect(302, '/login');
	}

	try {
		// Code gegen Token tauschen
		const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			},
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri
			})
		});

		if (!tokenResponse.ok) {
			console.error('Fehler beim Token-Austausch mit GitHub', await tokenResponse.text());
			throw redirect(302, '/login');
		}

		const tokenJson = (await tokenResponse.json()) as {
			access_token: string;
			token_type?: string;
		};

		const accessToken = tokenJson.access_token;

		// Userinfo laden
		const userResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: 'application/vnd.github+json'
			}
		});

		if (!userResponse.ok) {
			console.error('Fehler beim Laden der GitHub Userinfo', await userResponse.text());
			throw redirect(302, '/login');
		}

		const profile = (await userResponse.json()) as {
			id: number;
			login: string;
			name?: string;
			email?: string;
			avatar_url?: string;
		};

		// Emails laden (für primäre/verifizierte Adresse)
		let primaryEmail: string | null = profile.email ?? null;
		if (!primaryEmail) {
			const emailsResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/vnd.github+json'
				}
			});

			if (emailsResponse.ok) {
				const emails = (await emailsResponse.json()) as Array<{
					email: string;
					primary: boolean;
					verified: boolean;
				}>;

				const primary = emails.find((e) => e.primary && e.verified) ?? emails[0];
				if (primary) {
					primaryEmail = primary.email;
				}
			}
		}

		if (!primaryEmail) {
			console.error('GitHub liefert keine E-Mail-Adresse zurück');
			throw redirect(302, '/login');
		}

		const provider = 'github';
		const providerAccountId = String(profile.id);

		// Gibt es bereits einen Account für dieses GitHub-Konto?
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
				where: { email: primaryEmail }
			});

			let user;
			if (existingUser) {
				user = existingUser;
			} else {
				const fullName = profile.name ?? profile.login ?? 'GitHub User';
				const [firstName, ...rest] = fullName.split(' ');
				const lastName = rest.join(' ') || '';

				user = await prisma.user.create({
					data: {
						email: primaryEmail,
						firstName: firstName || 'GitHub',
						lastName: lastName,
						password: '',
						image: profile.avatar_url,
						emailVerified: true
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
					access_token: accessToken
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
			console.error('Fehler beim Loggen der Login-Aktivität für GitHub OAuth:', e);
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
		console.error('GitHub OAuth Fehler:', error);
		throw redirect(302, '/login');
	}
};

