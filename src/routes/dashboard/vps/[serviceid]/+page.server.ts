import type { PageServerLoad, Actions } from './$types';
import { getUserVpsServers, extendVpsServer } from '$lib/server/vps';
import { redirect, error, fail } from '@sveltejs/kit';
import { getDatalixServiceDetails, getDatalixVpsByServiceId } from '$lib/server/datalix';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const servers = await getUserVpsServers(locals.user.id);
	
	// Finde den Server anhand der ServiceID
	// @ts-ignore - datalixVpsId might not be in generated client yet
	const server = servers.find((s) => s.datalixVpsId === params.serviceid || s.id === params.serviceid);

	if (!server) {
		throw error(404, 'VPS nicht gefunden');
	}

	// Lade User mit Credits
	const userWithCredits = await prisma.user.findUnique({
		where: { id: locals.user.id }
	});

	// Versuche, vollständige Service-Daten von Datalix zu holen (inkl. IP, Passwort, etc.)
	let serviceDetails = null;
	let datalixVps = null;
	try {
		// @ts-ignore
		if (server.datalixVpsId) {
			// @ts-ignore
			const serviceId = server.datalixVpsId;
			
			// Versuche direkt /service/{serviceId} (der funktionierende Endpunkt)
			try {
				serviceDetails = await getDatalixServiceDetails(serviceId);
			} catch (error) {
				console.warn('Konnte Service-Details nicht abrufen:', error);
				// Versuche alternativen Endpunkt als Fallback
				try {
					datalixVps = await getDatalixVpsByServiceId(serviceId);
				} catch (fallbackError) {
					console.warn('Konnte auch VPS-Daten nicht abrufen:', fallbackError);
				}
			}
		}
	} catch (error) {
		console.warn('Konnte VPS-Daten von Datalix nicht abrufen:', error);
	}

	return {
		server,
		datalixVps,
		serviceDetails, // Vollständige Service-Details mit allen Informationen
		credits: ((userWithCredits as any)?.credits as number) || 0.00
	};
};

export const actions = {
	extend: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

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
			// Prüfe, ob der Server dem User gehört
			const server = await prisma.server.findUnique({
				where: { id: serverId },
				select: { userId: true }
			});

			if (!server || server.userId !== locals.user.id) {
				return fail(403, { error: 'Zugriff verweigert' });
			}

			await extendVpsServer(serverId, months, useCredits);
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

