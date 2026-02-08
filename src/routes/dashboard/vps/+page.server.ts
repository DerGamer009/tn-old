import type { PageServerLoad } from './$types';
import { getUserVpsServers } from '$lib/server/vps';
import { getDatalixServiceIp } from '$lib/server/datalix';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const servers = await getUserVpsServers(locals.user.id);

	// Hole IPv4-Adressen für alle Server von der Datalix API
	const serversWithIp = await Promise.all(
		servers.map(async (server) => {
			// @ts-ignore - datalixVpsId might not be in generated client yet
			const datalixVpsId = server.datalixVpsId;
			
			if (datalixVpsId) {
				try {
					const ipData = await getDatalixServiceIp(datalixVpsId);
					// Extrahiere IPv4-Adresse aus dem Array
					const ipv4 = ipData.ipv4?.[0]?.ip || server.ipAddress || null;
					
					return {
						...server,
						ipAddress: ipv4
					};
				} catch (error) {
					// Wenn IP nicht geholt werden kann, verwende die gespeicherte IP
					console.warn(`Konnte IP für Server ${server.id} nicht abrufen:`, error);
					return server;
				}
			}
			
			return server;
		})
	);

	return {
		servers: serversWithIp
	};
};

