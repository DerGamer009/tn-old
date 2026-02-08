import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	// Redirect zu Login wenn nicht eingeloggt
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const isImpersonating = Boolean(cookies.get('team_session'));

	return {
		user: locals.user,
		isImpersonating
	};
};

