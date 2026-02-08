import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Gameserver nicht gefunden');
	}

	const { source, pluginId } = await request.json();

	if (!source || !pluginId) {
		throw error(400, 'Source und Plugin-ID sind erforderlich');
	}

	try {
		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Lade Plugin-Download-URL basierend auf Quelle
		let downloadUrl: string;
		let pluginName: string;
		let pluginVersion: string = '';

		switch (source) {
			case 'spigotmc':
				// Hole Plugin-Details von SpigotMC
				const spigotInfo = await fetch(`https://api.spiget.org/v2/resources/${pluginId}`);
				if (!spigotInfo.ok) {
					throw new Error('Plugin nicht gefunden');
				}
				const spigotData = await spigotInfo.json();
				pluginName = spigotData.name || 'Unbekannt';
				pluginVersion = spigotData.version?.name || spigotData.latestVersion?.name || '';
				downloadUrl = `https://api.spiget.org/v2/resources/${pluginId}/download`;
				break;

			case 'papermc':
				// PaperMC Hangar - Plugin-ID ist im Format "owner/plugin"
				const hangarInfo = await fetch(`https://hangar.papermc.io/api/v1/projects/${pluginId}`);
				if (!hangarInfo.ok) {
					throw new Error('Plugin nicht gefunden');
				}
				const hangarData = await hangarInfo.json();
				pluginName = hangarData.name || 'Unbekannt';
				// Hole neueste Version
				const hangarVersionInfo = await fetch(`https://hangar.papermc.io/api/v1/projects/${pluginId}/versions/latest`);
				if (hangarVersionInfo.ok) {
					const hangarVersionData = await hangarVersionInfo.json();
					// Prüfe verschiedene mögliche Felder für die Version
					pluginVersion = hangarVersionData.name || 
					                hangarVersionData.version || 
					                hangarVersionData.versionString ||
					                hangarVersionData.tag ||
					                '';
				} else {
					// Fallback: Versuche alle Versionen zu holen
					try {
						const allVersionsResponse = await fetch(`https://hangar.papermc.io/api/v1/projects/${pluginId}/versions`);
						if (allVersionsResponse.ok) {
							const allVersions = await allVersionsResponse.json();
							if (Array.isArray(allVersions) && allVersions.length > 0) {
								const latest = allVersions[0];
								pluginVersion = latest.name || latest.version || latest.versionString || latest.tag || '';
							}
						}
					} catch (e) {
						// Ignoriere Fehler, pluginVersion bleibt leer
					}
				}
				downloadUrl = `https://hangar.papermc.io/api/v1/projects/${pluginId}/versions/latest/download`;
				break;

			case 'modrinth':
				// Modrinth - hole neueste Version
				const modrinthVersionsResponse = await fetch(`https://api.modrinth.com/v2/project/${pluginId}/version`, {
					headers: {
						'User-Agent': 'TitanNode/1.0 (contact@titannode.com)'
					}
				});
				if (!modrinthVersionsResponse.ok) {
					throw new Error('Plugin nicht gefunden');
				}
				const modrinthVersions = await modrinthVersionsResponse.json();
				if (!modrinthVersions || modrinthVersions.length === 0) {
					throw new Error('Keine Versionen gefunden');
				}
				// Sortiere nach Datum (neueste zuerst) und nimm die erste
				const sortedVersions = modrinthVersions.sort((a: any, b: any) => 
					new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
				);
				const latestVersion = sortedVersions[0];
				pluginName = latestVersion.name || pluginId;
				pluginVersion = latestVersion.version_number || latestVersion.name || '';
				// Modrinth gibt direkte Download-URLs in files
				const primaryFile = latestVersion.files?.find((f: any) => f.primary) || latestVersion.files?.[0];
				if (!primaryFile?.url) {
					throw new Error('Download-URL nicht gefunden');
				}
				downloadUrl = primaryFile.url;
				break;

			case 'curseforge':
				// CurseForge - benötigt API Key
				throw new Error('CurseForge wird derzeit nicht unterstützt. Coming Soon!');
				break;

			case 'craftingstudiopro':
				// CraftingStudioPro
				// pluginId kann numerische ID oder Slug sein
				// Wenn es eine numerische ID ist, verwende sie direkt
				// Wenn es ein Slug ist, suche zuerst nach dem Plugin
				const isNumericId = /^\d+$/.test(pluginId.toString());
				let projectId: string;
				let pluginNameFromSearch: string = '';
				let pluginVersionFromSearch: string = '';
				
				if (isNumericId) {
					// Direkte ID - verwende sie direkt
					projectId = pluginId.toString();
					
					// Versuche Plugin-Details zu holen (optional, für Name/Version)
					try {
						const cspInfoResponse = await fetch(`https://www.craftingstudiopro.de/api/plugins?q=${encodeURIComponent(pluginId)}`);
						if (cspInfoResponse.ok) {
							const cspInfoData = await cspInfoResponse.json();
							if (cspInfoData.success && Array.isArray(cspInfoData.data)) {
								const foundPlugin = cspInfoData.data.find((p: any) => p.id?.toString() === pluginId.toString());
								if (foundPlugin) {
									pluginNameFromSearch = foundPlugin.title || foundPlugin.name || '';
									pluginVersionFromSearch = foundPlugin.version || '';
								}
							}
						}
					} catch (e) {
						// Ignoriere Fehler, verwende Standardwerte
					}
				} else {
					// Slug - suche nach dem Plugin
					const cspSearchResponse = await fetch(`https://www.craftingstudiopro.de/api/plugins?q=${encodeURIComponent(pluginId)}`);
					if (!cspSearchResponse.ok) {
						throw new Error(`Plugin nicht gefunden (Status: ${cspSearchResponse.status})`);
					}
					
					const cspSearchData = await cspSearchResponse.json();
					if (!cspSearchData.success || !Array.isArray(cspSearchData.data)) {
						throw new Error('Plugin nicht gefunden - API-Antwort ungültig');
					}
					
					// Finde Plugin mit passender ID oder Slug
					const plugin = cspSearchData.data.find((p: any) => 
						p.id?.toString() === pluginId || 
						p.slug === pluginId ||
						p.id?.toString() === pluginId.toString()
					);
					
					if (!plugin) {
						console.error('CraftingStudioPro Plugin-Suche:', {
							searchQuery: pluginId,
							foundPlugins: cspSearchData.data.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title }))
						});
						throw new Error(`Plugin nicht gefunden. Gesucht: ${pluginId}, Gefunden: ${cspSearchData.data.length} Plugins`);
					}
					
					projectId = plugin.id?.toString() || plugin.slug || pluginId;
					pluginNameFromSearch = plugin.title || plugin.name || '';
					pluginVersionFromSearch = plugin.version || '';
				}
				
				pluginName = pluginNameFromSearch || 'Unbekannt';
				pluginVersion = pluginVersionFromSearch;
				
				// Der Download-Endpoint leitet weiter (redirect 303)
				// projectId kann ID oder Slug sein
				const downloadEndpoint = `https://www.craftingstudiopro.de/api/plugins/project/${projectId}/versions/latest/download`;
				
				// Der Endpoint macht einen Redirect zur tatsächlichen Download-URL
				// fetch folgt Redirects automatisch, wir verwenden die finale URL
				// Verwende direkt den Endpoint - fetch folgt dem Redirect automatisch
				downloadUrl = downloadEndpoint;
				break;

			default:
				throw new Error('Unbekannte Quelle');
		}

		// Lade Plugin herunter
		const pluginResponse = await fetch(downloadUrl);
		if (!pluginResponse.ok) {
			throw new Error('Konnte Plugin nicht herunterladen');
		}

		// Konvertiere zu Base64 (für Pterodactyl)
		const pluginBuffer = await pluginResponse.arrayBuffer();
		const pluginBase64 = Buffer.from(pluginBuffer).toString('base64');

		// Bestimme Dateiname (aus URL oder Plugin-Name)
		const urlParts = downloadUrl.split('/');
		let fileName = urlParts[urlParts.length - 1];
		// Entferne Query-Parameter vom Dateinamen
		if (fileName.includes('?')) {
			fileName = fileName.split('?')[0];
		}
		
		// Wenn Dateiname nicht mit .jar endet oder keine Version enthält, erstelle einen mit Version
		if (!fileName.endsWith('.jar')) {
			const cleanName = pluginName.replace(/[^a-zA-Z0-9]/g, '_');
			if (pluginVersion) {
				fileName = `${cleanName}-${pluginVersion}.jar`;
			} else {
				fileName = `${cleanName}.jar`;
			}
		} else if (pluginVersion && !fileName.includes(pluginVersion)) {
			// Füge Version zum Dateinamen hinzu, falls noch nicht vorhanden
			const nameWithoutExt = fileName.replace(/\.jar$/i, '');
			fileName = `${nameWithoutExt}-${pluginVersion}.jar`;
		}

		// Stelle sicher, dass plugins-Ordner existiert (optional - Pterodactyl erstellt ihn automatisch)
		// Schreibe Plugin in plugins-Ordner
		const filePath = `/plugins/${fileName}`;
		const writeUrl = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/write`);
		writeUrl.searchParams.set('file', filePath);

		const writeResponse = await fetch(writeUrl.toString(), {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({ contents: pluginBase64 })
		});

		if (!writeResponse.ok) {
			const errorData = await writeResponse.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', writeResponse.status, errorData);
			throw new Error(`Konnte Plugin nicht installieren: ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		return json({ success: true, message: `Plugin "${pluginName}" erfolgreich installiert` });
	} catch (err) {
		console.error('Plugin-Installation Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Plugin nicht installieren');
	}
};
