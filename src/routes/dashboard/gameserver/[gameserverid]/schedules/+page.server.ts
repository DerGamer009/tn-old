import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Schedules von der API
	let schedules = [];
	try {
		const response = await fetch(`/api/gameserver/${server.id}/schedules`);
		if (response.ok) {
			const data = await response.json();
			schedules = data.schedules || [];
		}
	} catch (error) {
		console.warn('Konnte Schedules nicht laden:', error);
	}

	return {
		server,
		schedules
	};
};
