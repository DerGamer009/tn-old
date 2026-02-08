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

		// Hole Server-Details von Pterodactyl User API (enthält Startup-Informationen)
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}`,
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
		const serverData = data.attributes || data.data?.attributes || data;

		// Extrahiere Startup-Informationen
		// Pterodactyl speichert Environment-Variablen als Record<string, string>
		const containerEnv = serverData.container?.environment || {};
		const environment: Record<string, string> = {};
		
		// Konvertiere Environment-Variablen zu einem einfachen Record
		if (typeof containerEnv === 'object' && containerEnv !== null) {
			for (const [key, value] of Object.entries(containerEnv)) {
				environment[key] = String(value);
			}
		}

		const startup = {
			startup_command: serverData.container?.startup_command || serverData.startup || '',
			image: serverData.container?.image || '',
			environment
		};

		return json({ startup });
	} catch (err) {
		console.error('Startup laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Startup nicht laden');
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

	const { startup_command, environment } = await request.json();

	if (!startup_command || typeof startup_command !== 'string') {
		throw error(400, 'Startup-Command ist erforderlich');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Aktualisiere Startup über Pterodactyl User API
		// Pterodactyl verwendet PATCH für Startup-Updates
		// Environment-Variablen müssen als Record<string, string> gesendet werden
		const requestBody: any = {
			startup: startup_command.trim()
		};

		// Füge Environment-Variablen hinzu, falls vorhanden
		if (environment && typeof environment === 'object') {
			requestBody.environment = environment;
		}

		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/startup`,
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify(requestBody)
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'startup_update',
			getClientIp(request),
			'Startup-Konfiguration aktualisiert'
		);

		return json({ success: true });
	} catch (err) {
		console.error('Startup aktualisieren Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Startup nicht aktualisieren');
	}
};
