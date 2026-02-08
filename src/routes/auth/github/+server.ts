import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
	const redirectUri =
		env.GITHUB_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI || `${url.origin}/auth/github/callback`;

	if (!clientId) {
		console.error('GITHUB_CLIENT_ID fehlt in den Umgebungsvariablen');
		throw redirect(302, '/login');
	}

	// CSRF-Schutz via State
	const state = crypto.randomUUID();
	cookies.set('oauth_github_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 10
	});

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: 'read:user user:email',
		state
	});

	throw redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
};

