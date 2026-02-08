import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isTeamMember, isTechnician } from '$lib/server/roles';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Prüfe ob User eingeloggt ist
	if (!locals.user) {
		throw redirect(302, '/team/login');
	}

	// Prüfe ob User Team-Mitglied ist
	if (!isTeamMember(locals.user.role)) {
		throw redirect(302, '/dashboard');
	}

	return {
		user: locals.user,
		canAccessTechnician: isTechnician(locals.user.role)
	};
};

