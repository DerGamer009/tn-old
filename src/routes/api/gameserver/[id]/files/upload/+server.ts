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

	const directory = url.searchParams.get('directory') || '/';

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole signierte Upload-URL von Pterodactyl Client API
		const uploadUrl = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/upload`);
		uploadUrl.searchParams.set('directory', directory);

		const response = await fetch(uploadUrl.toString(), {
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Accept': 'Application/vnd.pterodactyl.v1+json',
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			throw new Error(`Pterodactyl API Fehler: ${response.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		const data = await response.json();
		
		// Pterodactyl gibt die signierte URL in attributes.url zurück
		const signedUrl = data.attributes?.url || data.url;

		if (!signedUrl) {
			throw new Error('Keine signierte URL erhalten');
		}

		return json({ url: signedUrl });
	} catch (err) {
		console.error('Upload URL Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Upload-URL nicht abrufen');
	}
};
