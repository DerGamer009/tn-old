import type { PageServerLoad } from './$types';
import { getPterodactylServerFromAdmin } from '$lib/server/pterodactyl';

export const load: PageServerLoad = async ({ parent }) => {
	// Hole Server-Daten vom Layout
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Versuche Server-Details von Pterodactyl zu holen (Admin API)
	let pterodactylServer = null;
	const serverAny = server as any;
	if (serverAny.pterodactylServerId) {
		try {
			pterodactylServer = await getPterodactylServerFromAdmin(serverAny.pterodactylServerId);
		} catch (error) {
			console.warn('Konnte Pterodactyl Server-Details nicht abrufen:', error);
		}
	}

	return {
		server,
		pterodactylServer
	};
};
