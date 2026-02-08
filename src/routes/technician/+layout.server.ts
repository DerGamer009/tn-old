import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isTechnician } from '$lib/server/roles';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login?redirect=/technician');
	}

	if (!isTechnician(locals.user.role)) {
		throw redirect(302, '/dashboard');
	}

	return {
		user: locals.user
	};
};
