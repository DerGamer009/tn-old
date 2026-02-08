import type { PageServerLoad } from './$types';
import { getUserGameserverServersFromPterodactyl } from '$lib/server/pterodactyl';
import { syncGameserverServersToDatabase } from '$lib/server/app-hosting';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Hole Pterodactyl User ID vom eingeloggten User aus der Datenbank (bei Service-User-Modus optional)
	const { prisma } = await import('$lib/server/prisma');
	const user = await prisma.user.findUnique({
		where: { id: locals.user.id },
		select: { pterodactylUserId: true }
	}) as any;

	const serviceUserId = process.env.PTERODACTYL_SERVICE_USER_ID
		? parseInt(process.env.PTERODACTYL_SERVICE_USER_ID, 1)
		: undefined;
	const useServiceUser = serviceUserId != null;

	if (!useServiceUser && !user?.pterodactylUserId) {
		// Ohne Service-User: User hat noch keine Pterodactyl User ID
		return {
			servers: []
		};
	}

	try {
		// Lade Gameserver vom Pterodactyl Panel (bei Service-User nach external_id = TitanNode User-ID)
		const pterodactylServers = await getUserGameserverServersFromPterodactyl(
			useServiceUser ? serviceUserId! : user.pterodactylUserId,
			useServiceUser ? locals.user.id : undefined
		);
		
		console.log(`[DEBUG] Gefundene Pterodactyl Gameserver: ${pterodactylServers.length}`);

		// Synchronisiere die Server in die Datenbank (als Services)
		if (pterodactylServers.length > 0) {
			const syncedCount = await syncGameserverServersToDatabase(locals.user.id, pterodactylServers);
			console.log(`[DEBUG] ${syncedCount} Gameserver in Datenbank synchronisiert`);
		}

		// Lade Server aus der Datenbank (als Services)
		const dbServers = await prisma.server.findMany({
			where: {
				userId: locals.user.id,
				type: 'GAMESERVER'
			} as any,
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Konvertiere zu dem Format, das die Frontend-Komponente erwartet
		const servers = dbServers.map((server: any) => ({
			id: server.id,
			name: server.name,
			type: server.type,
			status: server.status,
			cpu: server.cpu,
			ram: server.ram,
			storage: server.storage,
			bandwidth: server.bandwidth || 1,
			priceMonthly: server.priceMonthly || 0,
			ipAddress: server.ipAddress || undefined,
			port: server.port || undefined,
			pterodactylServerId: server.pterodactylServerId || undefined,
			eggId: server.eggId || undefined,
			createdAt: server.createdAt,
			updatedAt: server.updatedAt,
			expiresAt: server.expiresAt || null
		}));

		console.log(`[DEBUG] ${servers.length} Gameserver aus Datenbank geladen`);

		return {
			servers: servers || []
		};
	} catch (error) {
		console.error('Fehler beim Abrufen der Pterodactyl Gameserver:', error);
		return {
			servers: []
		};
	}
};

