import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Server nicht gefunden');
	}

	const { file, path = '/', contents } = await request.json();

	if (!file || contents === undefined) {
		throw error(400, 'Dateiname oder Inhalt fehlt');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		const filePath = path === '/' ? file : path.endsWith('/') ? `${path}${file}` : `${path}/${file}`;

		// Schreibe Datei zu Pterodactyl Client API
		const url = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/write`);
		url.searchParams.set('file', filePath);

		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({ contents })
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			throw new Error(`Pterodactyl API Fehler: ${response.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		return json({ success: true });
	} catch (err) {
		console.error('Datei schreiben Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Datei nicht schreiben');
	}
};
