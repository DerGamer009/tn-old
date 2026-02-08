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

	const { name, description } = await request.json();

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw error(400, 'Server-Name ist erforderlich');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Benenne Server um über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/settings/rename`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({ 
					name: name.trim(),
					...(description !== undefined && { description: description?.trim() || '' })
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			throw new Error(`Pterodactyl API Fehler: ${response.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		// Aktualisiere auch in der lokalen Datenbank
		await prisma.server.update({
			where: { id: server.id },
			data: { name: name.trim() }
		});

		// Log Activity
		const { logServerActivity, getClientIp } = await import('$lib/server/server-activity');
		await logServerActivity(
			server.id,
			locals.user.id,
			'rename',
			getClientIp(request),
			`Server umbenannt von "${server.name}" zu "${name.trim()}"`
		);

		return json({ success: true });
	} catch (err) {
		console.error('Server umbenennen Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Server nicht umbenennen');
	}
};
