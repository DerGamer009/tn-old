import type { PageServerLoad } from './$types';
import { getPterodactylNodes } from '$lib/server/pterodactyl';

export const load: PageServerLoad = async () => {
	try {
		const nodes = await getPterodactylNodes();
		return { nodes, error: null };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Pterodactyl-Nodes konnten nicht geladen werden.';
		return { nodes: [], error: message };
	}
};
