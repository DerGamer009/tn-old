import { getPterodactylLocations } from '$lib/server/pterodactyl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const defaultLocationId = parseInt(process.env.PTERODACTYL_LOCATION_ID || '2', 10);
	try {
		// Lade verfügbare Standorte von Pterodactyl (eine Location → keine Auswahl nötig)
		const locations = await getPterodactylLocations();

		return {
			locations: locations.map((loc: { id: number; short: string; long?: string }) => ({
				id: loc.id,
				short: loc.short,
				long: loc.long || ''
			})),
			defaultLocationId
		};
	} catch (error) {
		console.error('Fehler beim Laden der Standorte:', error);
		return {
			locations: [],
			defaultLocationId
		};
	}
};
