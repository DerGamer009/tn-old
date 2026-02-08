import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Activity-Logs von der API
	let activities = [];
	try {
		const response = await fetch(`/api/gameserver/${server.id}/activity?limit=100`);
		if (response.ok) {
			const data = await response.json();
			activities = data.activities || [];
		}
	} catch (error) {
		console.warn('Konnte Activity-Logs nicht laden:', error);
	}

	return {
		server,
		activities
	};
};
