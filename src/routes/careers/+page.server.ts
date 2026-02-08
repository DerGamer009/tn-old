import type { PageServerLoad } from './$types';
import { jobs } from '$lib/careers';

export const load: PageServerLoad = async () => {
	return { jobs };
};
