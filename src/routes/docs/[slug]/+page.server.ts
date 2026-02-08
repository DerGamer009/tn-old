import type { PageServerLoad } from './$types';
import { getArticleBySlug } from '$lib/docs';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const article = getArticleBySlug(params.slug);
	if (!article) {
		throw error(404, 'Artikel nicht gefunden');
	}
	return { article };
};
