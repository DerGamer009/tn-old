import type { PageServerLoad } from './$types';
import type { LayoutServerLoad } from '../+layout.server';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const layoutData = await parent();
	const server = layoutData.server;
	
	if (!server) {
		throw new Error('Server nicht gefunden');
	}

	// Hole Allocations von der API
	let allocationsData = null;
	try {
		const response = await fetch(`/api/gameserver/${server.id}/network/allocations`);
		if (response.ok) {
			allocationsData = await response.json();
		}
	} catch (error) {
		console.warn('Konnte Allocations nicht laden:', error);
	}

	return {
		server,
		allocations: allocationsData?.allocations || [],
		allocationLimit: allocationsData?.limit || 0,
		allocationUsed: allocationsData?.used || 0
	};
};
