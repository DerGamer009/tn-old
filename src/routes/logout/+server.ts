import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionToken = cookies.get('session');

	if (sessionToken) {
		try {
			await deleteSession(sessionToken);
		} catch (error) {
			console.error('Fehler beim Löschen der Session:', error);
		}
	}

	// Cookie löschen
	cookies.delete('session', { path: '/' });

	// Redirect zur Homepage
	throw redirect(303, '/');
};

