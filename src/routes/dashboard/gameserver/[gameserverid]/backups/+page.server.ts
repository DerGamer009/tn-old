import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Backups von der API
	let backups = [];
	let backupLimit = 0;
	let backupUsed = 0;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/backups`);
		if (response.ok) {
			const data = await response.json();
			backups = data.backups || [];
			backupLimit = data.limit || 0;
			backupUsed = data.used || 0;
		}
	} catch (error) {
		console.warn('Konnte Backups nicht laden:', error);
	}

	return {
		server,
		backups,
		backupLimit,
		backupUsed
	};
};
