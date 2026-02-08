import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Databases von der API
	let databasesData = null;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/databases`);
		if (response.ok) {
			databasesData = await response.json();
		}
	} catch (error) {
		console.warn('Konnte Databases nicht laden:', error);
	}

	return {
		server,
		databases: databasesData?.databases || [],
		databaseLimit: databasesData?.limit || 0,
		databaseUsed: databasesData?.used || 0
	};
};
