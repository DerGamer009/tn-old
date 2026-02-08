import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Server nicht gefunden');
	}

	const path = url.searchParams.get('path') || '/';

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole Dateien von Pterodactyl Client API
		const filesUrl = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/list`);
		filesUrl.searchParams.set('directory', path);

		const response = await fetch(filesUrl.toString(), {
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, {
				url: filesUrl.toString(),
				serverId: server.pterodactylServerId,
				serverIdentifier,
				error: errorData
			});
			throw new Error(`Pterodactyl API Fehler: ${response.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		const data = await response.json();
		
		// Pterodactyl gibt Dateien in einem "data" Array zurück
		let files: any[] = [];
		if (Array.isArray(data.data)) {
			files = data.data.map((item: any) => item.attributes || item);
		} else if (Array.isArray(data)) {
			files = data.map((item: any) => item.attributes || item);
		} else if (data.data && typeof data.data === 'object') {
			// Falls es ein einzelnes Objekt ist
			files = [data.data.attributes || data.data];
		}

		return json({ data: files });
	} catch (err) {
		console.error('Dateien laden Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Dateien nicht laden');
	}
};
