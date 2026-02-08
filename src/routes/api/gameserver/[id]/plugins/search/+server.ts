import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Gameserver nicht gefunden');
	}

	const source = url.searchParams.get('source');
	const query = url.searchParams.get('query');

	if (!source || !query) {
		throw error(400, 'Source und Query Parameter sind erforderlich');
	}

	try {
		let plugins: any[] = [];

		switch (source) {
			case 'spigotmc':
				// SpigotMC API (Spiget)
				try {
					const spigotResponse = await fetch(`https://api.spiget.org/v2/search/resources/${encodeURIComponent(query)}?size=20&field=name`);
					if (spigotResponse.ok) {
						const spigotData = await spigotResponse.json();
						const resources = Array.isArray(spigotData) ? spigotData : [];
						
						// Hole für jedes Plugin die neueste Version
						plugins = await Promise.all(resources.map(async (p: any) => {
							let version = 'Unbekannt';
							try {
								// Hole neueste Version
								const versionResponse = await fetch(`https://api.spiget.org/v2/resources/${p.id}/versions?size=1&sort=-releaseDate`);
								if (versionResponse.ok) {
									const versionData = await versionResponse.json();
									if (Array.isArray(versionData) && versionData.length > 0) {
										version = versionData[0].name || 'Unbekannt';
									} else if (p.version?.name) {
										version = p.version.name;
									}
								}
							} catch (e) {
								// Fallback auf vorhandene Version
								version = p.version?.name || 'Unbekannt';
							}
							
							return {
								id: p.id?.toString() || '',
								name: p.name || 'Unbekannt',
								description: p.tag || p.description || 'Keine Beschreibung',
								version: version,
								downloads: p.downloads || 0,
								downloadUrl: `https://api.spiget.org/v2/resources/${p.id}/download`
							};
						}));
					}
				} catch (e) {
					console.warn('SpigotMC API Fehler:', e);
					plugins = [];
				}
				break;

			case 'papermc':
				// PaperMC Hangar API - verwende v1 für Suche (v2 hat andere Struktur)
				try {
					const hangarResponse = await fetch(`https://hangar.papermc.io/api/v1/projects?q=${encodeURIComponent(query)}&limit=20`);
					if (hangarResponse.ok) {
						const hangarData = await hangarResponse.json();
						const projects = hangarData.result || [];
						
						// Hole für jedes Plugin die neueste Version
						plugins = await Promise.all(projects.map(async (p: any) => {
							let version = 'Unbekannt';
							const projectId = p.namespace ? `${p.namespace.owner}/${p.namespace.slug}` : p.slug || '';
							
							if (projectId) {
								try {
									// Versuche verschiedene Endpunkte für die neueste Version
									const versionResponse = await fetch(`https://hangar.papermc.io/api/v1/projects/${projectId}/versions/latest`);
									if (versionResponse.ok) {
										const versionData = await versionResponse.json();
										// Prüfe verschiedene mögliche Felder für die Version
										version = versionData.name || 
										          versionData.version || 
										          versionData.versionString ||
										          versionData.tag ||
										          p.latestVersion || 
										          'Unbekannt';
									} else {
										// Fallback: Versuche alle Versionen zu holen und nehm die erste
										try {
											const allVersionsResponse = await fetch(`https://hangar.papermc.io/api/v1/projects/${projectId}/versions`);
											if (allVersionsResponse.ok) {
												const allVersions = await allVersionsResponse.json();
												if (Array.isArray(allVersions) && allVersions.length > 0) {
													const latest = allVersions[0];
													version = latest.name || latest.version || latest.versionString || latest.tag || 'Unbekannt';
												} else if (p.latestVersion) {
													version = p.latestVersion;
												}
											} else if (p.latestVersion) {
												version = p.latestVersion;
											}
										} catch (e2) {
											version = p.latestVersion || 'Unbekannt';
										}
									}
								} catch (e) {
									// Fallback auf vorhandene Daten
									version = p.latestVersion || p.latestVersionName || 'Unbekannt';
								}
							}
							
							return {
								id: projectId,
								name: p.name || 'Unbekannt',
								description: p.description || 'Keine Beschreibung',
								version: version,
								downloads: p.stats?.downloads || 0,
								downloadUrl: projectId ? `https://hangar.papermc.io/api/v1/projects/${projectId}/versions/latest/download` : ''
							};
						}));
					}
				} catch (e) {
					console.warn('PaperMC Hangar API Fehler:', e);
					plugins = [];
				}
				break;

			case 'modrinth':
				// Modrinth API v2
				try {
					const modrinthResponse = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20&facets=[["project_type:plugin"]]`, {
						headers: {
							'User-Agent': 'TitanNode/1.0 (contact@titannode.com)'
						}
					});
					if (modrinthResponse.ok) {
						const modrinthData = await modrinthResponse.json();
						const hits = modrinthData.hits || [];
						
						// Hole für jedes Plugin die neueste Version
						plugins = await Promise.all(hits.map(async (p: any) => {
							const projectId = p.project_id || p.slug || '';
							let version = 'Unbekannt';
							
							if (projectId) {
								try {
									const versionResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`, {
										headers: {
											'User-Agent': 'TitanNode/1.0 (contact@titannode.com)'
										}
									});
									if (versionResponse.ok) {
										const versions = await versionResponse.json();
										if (Array.isArray(versions) && versions.length > 0) {
											// Sortiere nach Datum (neueste zuerst)
											const sortedVersions = versions.sort((a: any, b: any) => 
												new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
											);
											const latestVersion = sortedVersions[0];
											version = latestVersion.version_number || latestVersion.name || 'Unbekannt';
										}
									}
								} catch (e) {
									// Fallback
									version = p.latest_version || 'Unbekannt';
								}
							}
							
							return {
								id: projectId,
								name: p.title || 'Unbekannt',
								description: p.description || 'Keine Beschreibung',
								version: version,
								downloads: p.downloads || 0,
								downloadUrl: '' // Wird beim Installieren geholt
							};
						}));
					}
				} catch (e) {
					console.warn('Modrinth API Fehler:', e);
					plugins = [];
				}
				break;

			case 'curseforge':
				// CurseForge API (benötigt API Key - Coming Soon)
				plugins = [];
				break;

			case 'craftingstudiopro':
				// CraftingStudioPro API
				try {
					const cspResponse = await fetch(`https://www.craftingstudiopro.de/api/plugins?q=${encodeURIComponent(query)}`);
					if (cspResponse.ok) {
						const cspData = await cspResponse.json();
						
						// API gibt { success: true, data: [...], meta: {...} } zurück
						if (cspData.success && Array.isArray(cspData.data)) {
							const allPlugins = cspData.data;
							
							// Limitiere auf 20 Ergebnisse
							const limitedPlugins = allPlugins.slice(0, 20);
							
							// Mappe Plugins - Version ist bereits in den Daten vorhanden
							plugins = limitedPlugins.map((p: any) => {
								const projectId = p.id?.toString() || '';
								const version = p.version || 'Unbekannt';
								const name = p.title || p.name || 'Unbekannt';
								const description = p.summary || p.description || 'Keine Beschreibung';
								const downloads = p.downloads || 0;
								
								return {
									id: projectId,
									name: name,
									description: description,
									version: version,
									downloads: downloads,
									downloadUrl: projectId ? `https://www.craftingstudiopro.de/api/plugins/project/${projectId}/versions/latest/download` : ''
								};
							});
						}
					}
				} catch (e) {
					console.warn('CraftingStudioPro API Fehler:', e);
					plugins = [];
				}
				break;

			default:
				throw error(400, 'Unbekannte Quelle');
		}

		return json({ plugins });
	} catch (err) {
		console.error('Plugin-Suche Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Plugins nicht suchen');
	}
};
