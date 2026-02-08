import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

export const DELETE: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Gameserver nicht gefunden');
	}

	const { fileName } = await request.json();

	if (!fileName) {
		throw error(400, 'Dateiname ist erforderlich');
	}

	try {
		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Stelle sicher, dass der Dateiname mit .jar endet
		const pluginFileName = fileName.endsWith('.jar') ? fileName : `${fileName}.jar`;

		// Lösche Plugin-Datei bei Pterodactyl
		// Pterodactyl API erfordert: root (Verzeichnis) und files (nur Dateinamen, keine Pfade)
		const deleteUrl = `${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/delete`;
		
		const response = await fetch(deleteUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({ 
				root: '/plugins',
				files: [pluginFileName]
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			throw new Error(`Konnte Plugin nicht deinstallieren: ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		return json({ success: true, message: `Plugin "${fileName}" erfolgreich deinstalliert` });
	} catch (err) {
		console.error('Plugin-Deinstallation Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Plugin nicht deinstallieren');
	}
};
