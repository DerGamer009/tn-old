import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'APP_HOSTING' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Server nicht gefunden');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
		const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';

		// Hole Server Identifier (Client API benötigt Identifier statt ID)
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

		// Hole WebSocket Token von Pterodactyl Client API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/websocket`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			let errorData: any = {};
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { message: errorText };
			}
			console.error('Pterodactyl WebSocket API Fehler:', {
				status: response.status,
				statusText: response.statusText,
				url: `${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/websocket`,
				serverIdentifier,
				error: errorData
			});
			throw new Error(`Pterodactyl API Fehler: ${response.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		const responseText = await response.text();
		let data: any = {};
		try {
			data = JSON.parse(responseText);
		} catch (e) {
			console.error('Konnte WebSocket-Response nicht parsen:', responseText);
			throw new Error('Ungültige Antwort von Pterodactyl API');
		}

		console.log('Pterodactyl WebSocket Response:', JSON.stringify(data, null, 2));

		// Pterodactyl gibt die WebSocket-Informationen in verschiedenen Formaten zurück
		const token = data.data?.token || data.attributes?.token || data.token;
		let socket = data.data?.socket || data.attributes?.socket;
		
		console.log('Extracted from Pterodactyl response:', {
			hasToken: !!token,
			hasSocket: !!socket,
			socketValue: socket,
			serverIdentifier,
			pterodactylServerId: server.pterodactylServerId
		});
		
		// WICHTIG: Die WebSocket-URL muss die vollständige Server-UUID enthalten, NICHT den kurzen Identifier!
		// Pterodactyl gibt die Socket-URL mit der UUID zurück, und das ist korrekt.
		// Wir sollten die Socket-URL NICHT ändern, da sie bereits die richtige UUID enthält.
		
		// Falls Socket nicht in der Response ist, konstruiere es
		if (!socket) {
			// Hole Socket-URL aus der Node-Information oder verwende Standard-Format
			const nodeFqdn = data.data?.node_fqdn || data.attributes?.node_fqdn;
			const nodePort = data.data?.node_port || data.attributes?.node_port || '8080';
			
			// Hole die vollständige Server-UUID (nicht den Identifier)
			let serverUuid = server.pterodactylServerId;
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
					// Verwende die UUID aus attributes.uuid oder identifier (UUID)
					serverUuid = serverData.attributes?.uuid || serverData.attributes?.identifier || server.pterodactylServerId;
				}
			} catch (e) {
				console.warn('Konnte Server UUID nicht abrufen:', e);
			}
			
			if (nodeFqdn) {
				socket = `wss://${nodeFqdn}:${nodePort}/api/servers/${serverUuid}/ws`;
				console.log('Constructed socket URL from node info:', socket);
			} else {
				// Fallback: Verwende die Base URL
				socket = `${PTERODACTYL_API_BASE.replace('https://', 'wss://').replace('http://', 'ws://')}/api/servers/${serverUuid}/ws`;
				console.log('Constructed socket URL from base URL:', socket);
			}
		} else {
			// Die Socket-URL von Pterodactyl ist bereits korrekt und enthält die UUID
			// Verwende die URL so, wie Pterodactyl sie zurückgibt (meistens wss://)
			// WICHTIG: Der Server auf Port 8080 muss SSL/TLS unterstützen, damit wss:// funktioniert
			// Wenn die Seite über HTTPS läuft, blockiert der Browser ws:// Verbindungen (Mixed Content)
			console.log('Using socket URL from Pterodactyl response:', socket);
		}

		// Validiere, dass beide Werte gesetzt sind
		if (!token || typeof token !== 'string') {
			console.error('Token fehlt oder ist ungültig:', { token, data });
			throw new Error('WebSocket-Token fehlt in der Pterodactyl API-Antwort');
		}

		if (!socket || typeof socket !== 'string') {
			console.error('Socket URL fehlt oder ist ungültig:', { socket, data });
			throw new Error('WebSocket-Socket-URL fehlt in der Pterodactyl API-Antwort');
		}

		console.log('Returning WebSocket data:', { 
			tokenLength: token?.length, 
			socketLength: socket?.length,
			socket: socket?.substring(0, 100),
			tokenPreview: token?.substring(0, 20) + '...'
		});

		return json({ token, socket });
	} catch (err) {
		console.error('WebSocket Token Fehler:', {
			error: err,
			message: err instanceof Error ? err.message : 'Unknown error',
			stack: err instanceof Error ? err.stack : undefined,
			serverId: params.id,
			userId: locals.user?.id
		});
		
		const errorMessage = err instanceof Error ? err.message : 'Konnte WebSocket-Token nicht abrufen';
		throw error(500, errorMessage);
	}
};

