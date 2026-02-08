import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/roles';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Prüfe ob User eingeloggt ist
	if (!locals.user) {
		throw redirect(302, '/login?redirect=/admin');
	}

	// Prüfe ob User Admin-Rechte hat (Management oder Founder)
	if (!isAdmin(locals.user.role)) {
		throw redirect(302, '/dashboard');
	}

	return {
		user: locals.user
	};
};

