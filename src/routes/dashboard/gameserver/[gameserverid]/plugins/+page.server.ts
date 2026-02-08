import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Hole Server-Daten vom Layout
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	return {
		server
	};
};
