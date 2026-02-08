import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
	const redirectUri =
		env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || `${url.origin}/auth/google/callback`;

	if (!clientId) {
		console.error('GOOGLE_CLIENT_ID fehlt in den Umgebungsvariablen');
		throw redirect(302, '/login');
	}

	// CSRF-Schutz via State
	const state = crypto.randomUUID();
	cookies.set('oauth_google_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 10
	});

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'online',
		prompt: 'select_account',
		state
	});

	throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

