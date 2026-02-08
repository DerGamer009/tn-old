import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Server-Version von der API
	let versionData = null;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/server-version`);
		if (response.ok) {
			versionData = await response.json();
		}
	} catch (error) {
		console.warn('Konnte Server-Version nicht laden:', error);
	}

	return {
		server,
		currentVersion: versionData?.currentVersion || '',
		dockerImage: versionData?.dockerImage || '',
		environment: versionData?.environment || {}
	};
};
