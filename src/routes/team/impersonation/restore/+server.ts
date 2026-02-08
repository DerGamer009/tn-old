import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const originalSession = cookies.get('team_session');

	if (!originalSession) {
		// Keine ursprüngliche Team-Session vorhanden – zurück zum Team-Login
		throw redirect(302, '/team/login');
	}

	// Ursprüngliche Team-Session wiederherstellen
	cookies.set('session', originalSession, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 8 // 8 Stunden
	});

	// Impersonation-Cookie entfernen
	cookies.delete('team_session', { path: '/' });

	throw redirect(303, '/team');
};

