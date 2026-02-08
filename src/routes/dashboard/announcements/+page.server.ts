import type { PageServerLoad } from './$types';
import { getAnnouncements } from '$lib/server/announcements';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const announcements = await getAnnouncements();
	return { announcements };
};

