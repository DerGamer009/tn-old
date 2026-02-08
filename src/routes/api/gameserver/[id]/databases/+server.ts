import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';
import { logServerActivity, getClientIp } from '$lib/server/server-activity';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Server nicht gefunden');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole Server-Details für Limits
		const serverResponse = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		let databaseLimit = 0;
		if (serverResponse.ok) {
			const serverData = await serverResponse.json();
			const serverAttrs = serverData.attributes || serverData.data?.attributes || serverData;
			databaseLimit = serverAttrs.feature_limits?.databases || 0;
		}

		// Hole Databases von Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/databases`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const data = await response.json();
		const databases = data.data || [];

		return json({ 
			databases,
			limit: databaseLimit,
			used: databases.length
		});
	} catch (err) {
		console.error('Databases laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Databases nicht laden');
	}
};

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

	const { database, remote } = await request.json();

	if (!database || typeof database !== 'string' || database.trim().length === 0) {
		throw error(400, 'Database-Name ist erforderlich');
	}

	if (!remote || typeof remote !== 'string') {
		throw error(400, 'Remote-Zugriffsmuster ist erforderlich');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Erstelle Database über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/databases`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					database: database.trim(),
					remote: remote.trim()
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const dbData = await response.json();
		const createdDatabase = dbData.attributes || dbData.data?.attributes || dbData;

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'database_create',
			getClientIp(request),
			`Database "${createdDatabase.name || createdDatabase.id}" erstellt`
		);

		return json({ database: createdDatabase });
	} catch (err) {
		console.error('Database erstellen Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Database nicht erstellen');
	}
};
