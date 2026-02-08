import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server || !server.pterodactylServerId) {
		throw error(404, 'Gameserver nicht gefunden');
	}

	try {
		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole Dateien aus plugins-Ordner
		const filesUrl = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/list`);
		filesUrl.searchParams.set('directory', '/plugins');

		const response = await fetch(filesUrl.toString(), {
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			// Wenn plugins-Ordner nicht existiert, gib leeres Array zurück
			if (response.status === 404) {
				return json({ plugins: [] });
			}
			throw new Error(`Pterodactyl API Fehler: ${response.status}`);
		}

		const data = await response.json();
		
		// Pterodactyl gibt Dateien in einem "data" Array zurück
		let files: any[] = [];
		if (Array.isArray(data.data)) {
			files = data.data.map((item: any) => item.attributes || item);
		} else if (Array.isArray(data)) {
			files = data.map((item: any) => item.attributes || item);
		}

		// Helper-Funktion zum Extrahieren der Version aus dem Dateinamen
		// Viele Plugins haben Format: PluginName-1.0.0.jar oder PluginName-v1.0.0.jar
		function extractVersionFromFileName(fileName: string): string {
			// Entferne .jar Extension
			const nameWithoutExt = fileName.replace(/\.jar$/i, '');
			
			// Versuche Version zu finden (verschiedene Patterns)
			// Pattern 1: -1.0.0, -v1.0.0, -1.0, etc.
			const versionPatterns = [
				/-v?(\d+\.\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9]+)?)/,  // -1.0.0 oder -v1.0.0
				/-(\d+\.\d+\.\d+)/,  // -1.0.0
				/-(\d+\.\d+)/,  // -1.0
				/_v?(\d+\.\d+\.\d+(?:\.\d+)?)/,  // _1.0.0 oder _v1.0.0
				/\[v?(\d+\.\d+\.\d+(?:\.\d+)?)\]/,  // [1.0.0] oder [v1.0.0]
				/\(v?(\d+\.\d+\.\d+(?:\.\d+)?)\)/  // (1.0.0) oder (v1.0.0)
			];
			
			for (const pattern of versionPatterns) {
				const match = nameWithoutExt.match(pattern);
				if (match && match[1]) {
					return match[1];
				}
			}
			
			return 'Unbekannt';
		}

		// Filtere nur .jar Dateien
		const plugins = files
			.filter((file: any) => file.name?.endsWith('.jar'))
			.map((file: any) => {
				// Extrahiere Plugin-Name aus Dateiname (entferne .jar und Version)
				const fileName = file.name || '';
				const nameWithoutExt = fileName.replace(/\.jar$/i, '');
				
				// Versuche Version aus Dateinamen zu extrahieren
				const version = extractVersionFromFileName(fileName);
				
				// Entferne Version aus Name für sauberen Plugin-Namen
				let name = nameWithoutExt;
				if (version !== 'Unbekannt') {
					// Entferne Version-Patterns aus dem Namen
					name = nameWithoutExt
						.replace(/-v?\d+\.\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9]+)?$/, '')
						.replace(/-v?\d+\.\d+$/, '')
						.replace(/_v?\d+\.\d+\.\d+(?:\.\d+)?$/, '')
						.replace(/\[v?\d+\.\d+\.\d+(?:\.\d+)?\]$/, '')
						.replace(/\(v?\d+\.\d+\.\d+(?:\.\d+)?\)$/, '')
						.trim();
				}
				
				// Falls Name leer wurde, verwende Dateiname ohne Extension
				if (!name || name.length === 0) {
					name = nameWithoutExt;
				}
				
				return {
					name: name || 'Unbekannt',
					version: version,
					file: fileName,
					size: file.size || 0,
					modified: file.modified_at || file.created_at
				};
			});

		return json({ plugins });
	} catch (err) {
		console.error('Installierte Plugins laden Fehler:', err);
		// Bei Fehler gib leeres Array zurück statt Fehler zu werfen
		return json({ plugins: [] });
	}
};
