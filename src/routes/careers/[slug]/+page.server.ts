import type { PageServerLoad } from './$types';
import { getJobBySlug } from '$lib/careers';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const job = getJobBySlug(params.slug);
	if (!job) {
		throw error(404, 'Stelle nicht gefunden');
	}
	return { job };
};
