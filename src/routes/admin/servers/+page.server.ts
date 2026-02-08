import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { extendVpsServer } from '$lib/server/vps';
import { extendServerLaufzeit } from '$lib/server/app-hosting';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const servers = await prisma.server.findMany({
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					credits: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	return { servers };
};

export const actions = {
	extend: async ({ request }) => {
		const data = await request.formData();
		const serverId = data.get('serverId') as string;
		const monthsStr = data.get('months') as string;
		const useCreditsStr = data.get('useCredits') as string;

		if (!serverId) {
			return fail(400, { error: 'Server-ID fehlt' });
		}

		const months = parseInt(monthsStr || '1', 10);
		if (isNaN(months) || months < 1 || months > 24) {
			return fail(400, { error: 'Ungültige Anzahl Monate (1-24)' });
		}

		const useCredits = useCreditsStr === 'true';

		try {
			const server = await prisma.server.findUnique({
				where: { id: serverId },
				select: { type: true }
			});
			if (!server) {
				return fail(404, { error: 'Server nicht gefunden', serverId });
			}
			if (server.type === 'VPS') {
				await extendVpsServer(serverId, months, useCredits);
			} else if (server.type === 'GAMESERVER' || server.type === 'APP_HOSTING') {
				await extendServerLaufzeit(serverId, months, useCredits);
			} else {
				return fail(400, { error: 'Verlängerung für diesen Servertyp nicht möglich', serverId });
			}
			return { success: true, message: `Server erfolgreich um ${months} Monat${months > 1 ? 'e' : ''} verlängert`, serverId };
		} catch (error) {
			console.error('Error extending server:', error);
			return fail(500, { 
				error: error instanceof Error ? error.message : 'Fehler beim Verlängern des Servers',
				serverId 
			});
		}
	}
} satisfies Actions;

