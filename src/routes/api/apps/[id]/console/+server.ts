import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/prisma";

// Console-Logs abrufen
export const GET: RequestHandler = async ({ params, request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: "Nicht autorisiert" }, { status: 401 });
		}

		const { id: serverId } = params;
		const url = new URL(request.url);
		const lines = url.searchParams.get('lines') || '100';

		// Hole Server aus Datenbank
		const server = await prisma.server.findUnique({
			where: { id: serverId, userId: locals.user.id, type: 'APP_HOSTING' }
		}) as any;

		if (!server || !server.pterodactylServerId) {
			return json({ 
				error: "Server nicht gefunden" 
			}, { status: 404 });
		}

		// Hole Pterodactyl User ID vom User
		const user = await prisma.user.findUnique({
			where: { id: locals.user.id },
			select: { pterodactylUserId: true }
		});

		if (!user?.pterodactylUserId) {
			return json({ 
				error: "Kein Pterodactyl-Account gefunden" 
			}, { status: 404 });
		}

		// Lade Pterodactyl-Konfiguration aus Umgebungsvariablen
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
		const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';

		if (!PTERODACTYL_USER_KEY) {
			return json({ 
				error: "Pterodactyl-Konfiguration nicht vollständig" 
			}, { status: 500 });
		}

		// Normalisiere die API URL
		let baseUrl = PTERODACTYL_API_BASE.trim();
		if (baseUrl.endsWith('/')) {
			baseUrl = baseUrl.slice(0, -1);
		}
		const apiBaseUrl = `${baseUrl}/api`;

		// Hole Server Identifier (Client API benötigt Identifier statt ID)
		let serverIdentifier = server.pterodactylServerId;
		try {
			const serverResponse = await fetch(
				`${apiBaseUrl}/application/servers/${server.pterodactylServerId}`,
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

		// Pterodactyl hat keinen direkten Console-Logs REST-Endpoint
		// Die Console-Ausgabe wird über WebSockets gestreamt
		// Wir versuchen, die WebSocket-Details zu holen und dann eine WebSocket-Verbindung aufzubauen
		// Für jetzt geben wir leere Logs zurück, da die Logs nur über WebSockets verfügbar sind
		
		// Hole WebSocket-Details von Pterodactyl
		try {
			const websocketResponse = await fetch(`${apiBaseUrl}/client/servers/${serverIdentifier}/websocket`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${PTERODACTYL_USER_KEY}`,
					"Content-Type": "application/json",
					"Accept": "application/json"
				}
			});

			if (websocketResponse.ok) {
				const websocketData = await websocketResponse.json();
				// Pterodactyl gibt die WebSocket-Daten in data.data oder direkt zurück
				const wsData = websocketData.data || websocketData;
				
				// Debug-Logging (nur einmal, nicht bei jedem Polling)
				// Entfernt, um Log-Spam zu vermeiden
				
				// WebSocket-Details verfügbar, aber Logs müssen über WebSocket-Verbindung gestreamt werden
				return json({ 
					success: true,
					logs: [], // Logs werden über WebSockets gestreamt, nicht über REST API
					websocket: wsData // WebSocket-Details (token und socket URL)
				});
			}
		} catch (wsError) {
			console.error("Fehler beim Abrufen der WebSocket-Details:", wsError);
		}
		
		// Wenn WebSocket-Endpoint nicht verfügbar ist, geben wir leere Logs zurück
		// Die Console-Ausgabe wird dann durch das Senden von Befehlen generiert
		return json({ 
			success: true,
			logs: [] // Keine Logs verfügbar über REST API
		});
	} catch (error: any) {
		console.error("Fehler beim Abrufen der Console-Logs:", error);
		return json({ 
			error: "Fehler beim Abrufen der Console-Logs",
			details: error.message,
			logs: []
		}, { status: 500 });
	}
};
