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

		// Hole Server-Details von Pterodactyl User API
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

		// Extrahiere aktuelle Version-Informationen
		const container = serverData.container || {};
		const environment = container.environment || {};
		
		// Versuche die aktuelle Server-Version zu ermitteln
		// Pterodactyl speichert die Version oft in Environment-Variablen
		const currentVersion = environment.VERSION || environment.MC_VERSION || '';
		const dockerImage = container.image || '';

		return json({ 
			currentVersion,
			dockerImage,
			environment
		});
	} catch (err) {
		console.error('Server-Version laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Server-Version nicht laden');
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

	const { serverVersion, version } = await request.json();

	if (!serverVersion || typeof serverVersion !== 'string') {
		throw error(400, 'Server-Version ist erforderlich');
	}

	// Validiere Server-Version
	const validVersions = ['paper', 'velocity', 'purpur', 'folia', 'neoforge', 'fabric', 'forge', 'waterfall'];
	if (!validVersions.includes(serverVersion.toLowerCase())) {
		throw error(400, 'Ungültige Server-Version');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
		const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole aktuelle Server-Details
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

		if (!serverResponse.ok) {
			throw error(500, 'Konnte Server-Details nicht laden');
		}

		const serverData = await serverResponse.json();
		const serverAttrs = serverData.attributes || serverData.data?.attributes || serverData;
		const currentEnvironment = serverAttrs.container?.environment || {};

		// Aktualisiere Environment-Variablen für die neue Version
		const updatedEnvironment = { ...currentEnvironment };
		
		// Setze die Version basierend auf der Server-Version
		if (version) {
			updatedEnvironment.VERSION = version;
			updatedEnvironment.MC_VERSION = version;
		}

		// Setze Server-spezifische Variablen
		switch (serverVersion.toLowerCase()) {
			case 'paper':
				updatedEnvironment.SERVER_JARFILE = 'server.jar';
				break;
			case 'velocity':
				updatedEnvironment.SERVER_JARFILE = 'velocity.jar';
				break;
			case 'purpur':
				updatedEnvironment.SERVER_JARFILE = 'purpur.jar';
				break;
			case 'folia':
				updatedEnvironment.SERVER_JARFILE = 'folia.jar';
				break;
			case 'neoforge':
				updatedEnvironment.SERVER_JARFILE = 'neoforge.jar';
				break;
			case 'fabric':
				updatedEnvironment.SERVER_JARFILE = 'fabric.jar';
				break;
			case 'forge':
				updatedEnvironment.SERVER_JARFILE = 'forge.jar';
				break;
			case 'waterfall':
				updatedEnvironment.SERVER_JARFILE = 'waterfall.jar';
				break;
		}

		// Aktualisiere über Admin API (nur Admin API kann Docker-Image ändern)
		// Für User API können wir nur Environment-Variablen ändern
		const adminResponse = await fetch(
			`${PTERODACTYL_API_BASE}/api/application/servers/${server.pterodactylServerId}/startup`,
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_ADMIN_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					environment: updatedEnvironment
				})
			}
		);

		if (!adminResponse.ok) {
			const errorData = await adminResponse.json().catch(() => ({}));
			console.error('Pterodactyl Admin API Fehler:', adminResponse.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(adminResponse.status, errorMessage);
		}

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'server_version_update',
			getClientIp(request),
			`Server-Version zu ${serverVersion}${version ? ` (${version})` : ''} geändert`
		);

		return json({ success: true });
	} catch (err) {
		console.error('Server-Version aktualisieren Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Server-Version nicht aktualisieren');
	}
};
