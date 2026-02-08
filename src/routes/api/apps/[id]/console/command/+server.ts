import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import WebSocket from 'ws';

// Endpoint zum Senden von Befehlen über WebSocket
export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const { id: serverId } = params;
	const { command } = await request.json() as { command: string };

	if (!command || typeof command !== 'string') {
		throw error(400, 'Befehl fehlt');
	}

	try {
		const server = await prisma.server.findUnique({
			where: { id: serverId, userId: locals.user.id, type: 'APP_HOSTING' }
		}) as any;

		if (!server || !server.pterodactylServerId) {
			throw error(404, 'Server nicht gefunden');
		}

		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
		const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';

		// Hole Server Identifier
		let serverIdentifier = server.pterodactylServerId;
		try {
			const serverResponse = await fetch(
				`${PTERODACTYL_API_BASE}/api/application/servers/${server.pterodactylServerId}`,
				{
					headers: {
						'Authorization': `Bearer ${PTERODACTYL_ADMIN_KEY}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}
			);

			if (serverResponse.ok) {
				const serverData = await serverResponse.json();
				serverIdentifier = serverData.attributes?.identifier || serverData.identifier || server.pterodactylServerId;
			}
		} catch (e) {
			console.warn('Konnte Server Identifier nicht abrufen:', e);
		}

		// Hole WebSocket Token
		const websocketResponse = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/websocket`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		if (!websocketResponse.ok) {
			throw error(500, 'Konnte WebSocket-Token nicht abrufen');
		}

		const websocketData = await websocketResponse.json();
		const wsData = websocketData.data || websocketData;
		const token = wsData.token;
		const socketUrl = wsData.socket;

		if (!token || !socketUrl) {
			throw error(500, 'WebSocket-Daten unvollständig');
		}

		// Verbinde mit Pterodactyl WebSocket und sende Befehl
		const wsUrlWithToken = `${socketUrl}?token=${encodeURIComponent(token)}`;
		let baseUrl = PTERODACTYL_API_BASE.trim();
		if (baseUrl.endsWith('/')) {
			baseUrl = baseUrl.slice(0, -1);
		}

		return new Promise((resolve) => {
			const ws = new WebSocket(wsUrlWithToken, {
				headers: {
					'Origin': baseUrl,
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				},
				rejectUnauthorized: false
			});

			let authenticated = false;
			let commandSent = false;

			const timeout = setTimeout(() => {
				if (!commandSent) {
					ws.close();
					resolve(json({ success: false, error: 'Timeout beim Senden des Befehls' }, { status: 500 }));
				}
			}, 10000); // 10 Sekunden Timeout

			ws.on('open', () => {
				// Authentifiziere
				ws.send(JSON.stringify({
					event: 'auth',
					args: [token]
				}));
			});

			ws.on('message', (data: WebSocket.Data) => {
				try {
					const message = JSON.parse(data.toString());
					
					if (message.event === 'auth success') {
						authenticated = true;
						// Sende Befehl
						ws.send(JSON.stringify({
							event: 'send command',
							args: [command]
						}));
						commandSent = true;
						clearTimeout(timeout);
						ws.close();
						resolve(json({ success: true }));
					} else if (message.event === 'auth failure' || message.event === 'auth error') {
						clearTimeout(timeout);
						ws.close();
						resolve(json({ success: false, error: 'Authentifizierung fehlgeschlagen' }, { status: 401 }));
					}
				} catch (e) {
					console.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', e);
				}
			});

			ws.on('error', (err) => {
				clearTimeout(timeout);
				console.error('WebSocket-Fehler:', err);
				resolve(json({ success: false, error: 'WebSocket-Fehler' }, { status: 500 }));
			});

			ws.on('close', () => {
				if (!commandSent) {
					clearTimeout(timeout);
					resolve(json({ success: false, error: 'Verbindung geschlossen' }, { status: 500 }));
				}
			});
		});
	} catch (err) {
		console.error('Fehler beim Senden des Befehls:', err);
		const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
		throw error(500, errorMessage);
	}
};

