import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Users von der API
	let users = [];
	try {
		const response = await fetch(`/api/gameserver/${server.id}/users`);
		if (response.ok) {
			const data = await response.json();
			users = data.users || [];
		}
	} catch (error) {
		console.warn('Konnte Users nicht laden:', error);
	}

	return {
		server,
		users
	};
};
