import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/prisma";
import WebSocket from "ws";

// Server-Sent Events (SSE) Endpoint für Console-Logs
export const GET: RequestHandler = async ({ params, request, locals }) => {
	try {
		if (!locals.user) {
			return new Response("Nicht autorisiert", { status: 401 });
		}

		const { id: serverId } = params;

		// Hole Server aus Datenbank
		const server = await prisma.server.findUnique({
			where: { id: serverId, userId: locals.user.id, type: 'APP_HOSTING' }
		}) as any;

		if (!server || !server.pterodactylServerId) {
			return new Response("Server nicht gefunden", { status: 404 });
		}

		// Hole Pterodactyl User ID vom User
		const user = await prisma.user.findUnique({
			where: { id: locals.user.id }
		}) as any;

		if (!user?.pterodactylUserId) {
			return new Response("Kein Pterodactyl-Account gefunden", { status: 404 });
		}

		// Lade Pterodactyl-Konfiguration aus Umgebungsvariablen
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
		const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';

		if (!PTERODACTYL_USER_KEY) {
			return new Response("Pterodactyl-Konfiguration nicht vollständig", { status: 500 });
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

		// Hole WebSocket-Details von Pterodactyl
		const websocketResponse = await fetch(`${apiBaseUrl}/client/servers/${serverIdentifier}/websocket`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${PTERODACTYL_USER_KEY}`,
				"Content-Type": "application/json",
				"Accept": "application/json"
			}
		});

		if (!websocketResponse.ok) {
			return new Response("Fehler beim Abrufen der WebSocket-Details", { status: 500 });
		}

		const websocketData = await websocketResponse.json();
		const wsData = websocketData.data || websocketData;
		const token = wsData.token;
		const socketUrl = wsData.socket;

		if (!token || !socketUrl) {
			return new Response("WebSocket-Daten unvollständig", { status: 500 });
		}

		// Hilfsfunktion zum Abrufen eines neuen WebSocket-Tokens
		const getNewWebSocketToken = async () => {
			try {
				const tokenResponse = await fetch(`${apiBaseUrl}/client/servers/${serverIdentifier}/websocket`, {
					method: "GET",
					headers: {
						"Authorization": `Bearer ${PTERODACTYL_USER_KEY}`,
						"Content-Type": "application/json",
						"Accept": "application/json"
					}
				});

				if (!tokenResponse.ok) {
					throw new Error("Fehler beim Abrufen des neuen WebSocket-Tokens");
				}

				const tokenData = await tokenResponse.json();
				const wsTokenData = tokenData.data || tokenData;
				return wsTokenData.token;
			} catch (error) {
				console.error("Fehler beim Abrufen des neuen Tokens:", error);
				return null;
			}
		};

		// Erstelle SSE-Stream
		const stream = new ReadableStream({
			start(controller) {
				let ws: WebSocket | null = null;
				let isClosed = false;
				let currentToken = token;
				let reconnectAttempts = 0;
				const maxReconnectAttempts = 3;
				
				// Hilfsfunktion zum sicheren Schließen des Controllers
				const safeClose = () => {
					if (!isClosed) {
						isClosed = true;
						try {
							controller.close();
						} catch (err) {
							// Controller bereits geschlossen - ignorieren
							console.log("Controller bereits geschlossen");
						}
					}
				};
				
				// Hilfsfunktion zum sicheren Enqueuen
				const safeEnqueue = (data: Uint8Array) => {
					if (!isClosed) {
						try {
							controller.enqueue(data);
						} catch (err) {
							console.error("Fehler beim Enqueuen:", err);
							safeClose();
						}
					}
				};
				
				// Funktion zum Erstellen der WebSocket-Verbindung
				const connectWebSocket = async (tokenToUse: string) => {
					console.log("Versuche WebSocket-Verbindung zu Pterodactyl:", socketUrl);
					
					// Parse die WebSocket-URL
					const urlObj = new URL(socketUrl);
					
					// Token als Query-Parameter in der URL
					const wsUrlWithToken = `${socketUrl}?token=${encodeURIComponent(tokenToUse)}`;
					
					// Origin-Header mit der Pterodactyl-Panel-URL
					const panelOrigin = baseUrl;
					
					console.log("WebSocket-URL mit Token:", wsUrlWithToken.substring(0, 100) + '...');
					
					// Erstelle WebSocket-Verbindung zu Pterodactyl
					ws = new WebSocket(wsUrlWithToken, {
						headers: {
							'Origin': panelOrigin,
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
						},
						rejectUnauthorized: false // Erlaube selbstsignierte Zertifikate (für Entwicklung)
					});

					ws.on('open', () => {
						console.log("WebSocket zu Pterodactyl verbunden");
						const connectedData = `data: ${JSON.stringify({ type: 'connected', data: 'Verbunden' })}\n\n`;
						safeEnqueue(new TextEncoder().encode(connectedData));
						
						// Authentifiziere mit Token
						if (ws && ws.readyState === WebSocket.OPEN) {
							ws.send(JSON.stringify({
								event: 'auth',
								args: [currentToken]
							}));
						}
					});

					ws.on('message', async (data: WebSocket.Data) => {
						try {
							const message = JSON.parse(data.toString());
							
							// Debug: Logge alle Events (außer stats/status und jwt error)
							if (message.event !== 'stats' && message.event !== 'status' && message.event !== 'jwt error') {
								console.log("Pterodactyl WebSocket Event:", message.event);
							}
							
							// Sende alle Console-Ausgaben an Client über SSE
							if (message.event === 'console output' && message.args && message.args.length > 0) {
								const output = message.args[0];
								if (typeof output === 'string') {
									const sseData = `data: ${JSON.stringify({ type: 'console', data: output })}\n\n`;
									safeEnqueue(new TextEncoder().encode(sseData));
								}
							} else if (message.event === 'install output' && message.args && message.args.length > 0) {
								// Install-Ausgaben
								const output = message.args[0];
								if (typeof output === 'string') {
									const sseData = `data: ${JSON.stringify({ type: 'console', data: output })}\n\n`;
									safeEnqueue(new TextEncoder().encode(sseData));
								}
							} else if (message.event === 'daemon message' && message.args && message.args.length > 0) {
								// Daemon-Nachrichten
								const output = message.args[0];
								if (typeof output === 'string') {
									const sseData = `data: ${JSON.stringify({ type: 'console', data: output })}\n\n`;
									safeEnqueue(new TextEncoder().encode(sseData));
								}
							} else if (message.event === 'token expiring' || message.event === 'jwt error') {
								// Token läuft ab oder JWT-Fehler - hole neuen Token und authentifiziere erneut
								console.log(`Token-Problem erkannt (${message.event}), hole neuen Token...`);
								
								if (reconnectAttempts >= maxReconnectAttempts) {
									console.error("Maximale Anzahl von Reconnect-Versuchen erreicht");
									const errorData = `data: ${JSON.stringify({ type: 'error', data: 'Token-Erneuerung fehlgeschlagen' })}\n\n`;
									safeEnqueue(new TextEncoder().encode(errorData));
									return;
								}
								
								reconnectAttempts++;
								const newToken = await getNewWebSocketToken();
								
								if (newToken) {
									currentToken = newToken;
									console.log("Neuer Token erhalten, authentifiziere erneut...");
									
									// Wenn WebSocket noch verbunden ist, authentifiziere mit neuem Token
									if (ws && ws.readyState === WebSocket.OPEN) {
										ws.send(JSON.stringify({
											event: 'auth',
											args: [newToken]
										}));
									} else {
										// WebSocket ist nicht verbunden, schließe und verbinde neu
										if (ws) {
											ws.removeAllListeners();
											ws.close();
										}
										await connectWebSocket(newToken);
									}
								} else {
									console.error("Konnte keinen neuen Token abrufen");
									const errorData = `data: ${JSON.stringify({ type: 'error', data: 'Token-Erneuerung fehlgeschlagen' })}\n\n`;
									safeEnqueue(new TextEncoder().encode(errorData));
								}
							} else if (message.event === 'auth success') {
								console.log("WebSocket-Authentifizierung erfolgreich");
								reconnectAttempts = 0; // Reset bei erfolgreicher Authentifizierung
								const authData = `data: ${JSON.stringify({ type: 'auth', data: 'Authentifiziert' })}\n\n`;
								safeEnqueue(new TextEncoder().encode(authData));
							} else if (message.event === 'auth failure') {
								console.error("WebSocket-Authentifizierung fehlgeschlagen");
								const errorData = `data: ${JSON.stringify({ type: 'error', data: 'Authentifizierung fehlgeschlagen' })}\n\n`;
								safeEnqueue(new TextEncoder().encode(errorData));
							}
						} catch (err) {
							console.error("Fehler beim Verarbeiten der WebSocket-Nachricht:", err);
							const errorData = `data: ${JSON.stringify({ type: 'error', data: 'Fehler beim Verarbeiten der Nachricht' })}\n\n`;
							safeEnqueue(new TextEncoder().encode(errorData));
						}
					});

					ws.on('error', (error: any) => {
						console.error("WebSocket-Fehler:", error);
						console.error("Fehler-Details:", {
							message: error.message,
							code: error.code,
							stack: error.stack
						});
						if (!isClosed) {
							let errorMessage = 'WebSocket-Fehler';
							if (error.message) {
								errorMessage = error.message;
							} else if (error.code) {
								errorMessage = `WebSocket-Fehler (Code: ${error.code})`;
							}
							const errorData = `data: ${JSON.stringify({ type: 'error', data: errorMessage })}\n\n`;
							safeEnqueue(new TextEncoder().encode(errorData));
						}
					});

					ws.on('close', (code: number, reason: Buffer) => {
						console.log("WebSocket-Verbindung geschlossen:", code, reason.toString());
						if (!isClosed) {
							const closeData = `data: ${JSON.stringify({ type: 'close', data: `Verbindung geschlossen (Code: ${code})` })}\n\n`;
							safeEnqueue(new TextEncoder().encode(closeData));
						}
						safeClose();
					});

					// Cleanup bei Stream-Abbruch
					request.signal.addEventListener('abort', () => {
						console.log("SSE-Stream abgebrochen");
						if (ws) {
							ws.removeAllListeners();
							ws.close();
						}
						safeClose();
					});
				};
				
				// Starte initiale Verbindung
				connectWebSocket(currentToken).catch((err) => {
					console.error("Fehler beim Erstellen der WebSocket-Verbindung:", err);
					const errorData = `data: ${JSON.stringify({ type: 'error', data: `Fehler beim Verbinden: ${err.message || 'Unbekannter Fehler'}` })}\n\n`;
					safeEnqueue(new TextEncoder().encode(errorData));
					safeClose();
				});
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'X-Accel-Buffering': 'no' // Nginx-Buffering deaktivieren
			}
		});
	} catch (error: any) {
		console.error("Fehler beim Erstellen des SSE-Streams:", error);
		return new Response("Fehler beim Erstellen des Streams", { status: 500 });
	}
};
