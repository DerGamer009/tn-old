import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Startup von der API
	let startup = null;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/startup`);
		if (response.ok) {
			const data = await response.json();
			startup = data.startup;
		}
	} catch (error) {
		console.warn('Konnte Startup nicht laden:', error);
	}

	return {
		server,
		startup
	};
};
