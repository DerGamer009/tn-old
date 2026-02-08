import type { LayoutServerLoad } from './$types';
export type { LayoutServerLoad };
import { redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Finde den Gameserver anhand der ID
	const server = await prisma.server.findFirst({
		where: {
			id: params.gameserverid,
			userId: locals.user.id,
			type: 'GAMESERVER'
		} as any
	});

	if (!server) {
		throw error(404, 'Gameserver nicht gefunden');
	}

	return {
		server: {
			id: server.id,
			name: server.name,
			type: server.type,
			status: server.status,
			cpu: server.cpu,
			ram: server.ram,
			storage: server.storage,
			bandwidth: server.bandwidth || 1,
			priceMonthly: server.priceMonthly || 0,
			ipAddress: (server as any).ipAddress || undefined,
			port: (server as any).port || undefined,
			pterodactylServerId: (server as any).pterodactylServerId || undefined,
			eggId: (server as any).eggId || undefined,
			createdAt: server.createdAt,
			updatedAt: server.updatedAt,
			expiresAt: (server as any).expiresAt || null
		}
	};
};
