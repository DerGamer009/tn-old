import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Server-Settings von der API
	let settingsData = null;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/settings`);
		if (response.ok) {
			settingsData = await response.json();
		}
	} catch (error) {
		console.warn('Konnte Server-Settings nicht laden:', error);
	}

	return {
		server,
		settings: settingsData
	};
};
