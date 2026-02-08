import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../../../+layout.server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, params, url }) => {
	// Hole Server-Daten vom Layout
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw error(404, 'Server nicht gefunden');
	}

	const filename = decodeURIComponent(params.filename);
	const filePath = url.searchParams.get('path') || '/';

	return {
		server,
		filename,
		filePath
	};
};
