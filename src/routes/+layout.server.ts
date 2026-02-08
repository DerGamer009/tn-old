import type { LayoutServerLoad } from './$types';
import { getSiteBanner } from '$lib/server/site-banner';

export const load: LayoutServerLoad = async ({ locals }) => {
	const banner = await getSiteBanner();
	return {
		user: locals.user || null,
		banner: banner && banner.enabled && banner.text.trim() ? banner : null
	};
};

