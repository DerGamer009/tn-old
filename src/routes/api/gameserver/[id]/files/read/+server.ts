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
		throw error(404, 'Server nicht gefunden');
	}

	const file = url.searchParams.get('file');
	const path = url.searchParams.get('path') || '/';

	if (!file) {
		throw error(400, 'Dateiname fehlt');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		const filePath = path === '/' ? file : path.endsWith('/') ? `${path}${file}` : `${path}/${file}`;

		// Hole Dateiinhalt von Pterodactyl Client API
		const urlObj = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/contents`);
		urlObj.searchParams.set('file', filePath);

		const response = await fetch(urlObj.toString(), {
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			let errorData: any = {};
			try {
				errorData = JSON.parse(text);
			} catch {
				errorData = { message: 'Unknown error' };
			}
			const detail = errorData.errors?.[0]?.detail || errorData.message || '';
			const isTooLarge = typeof detail === 'string' && /too large|zu groß/i.test(detail);
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			if (isTooLarge) {
				return json(
					{ error: 'Diese Datei ist zu groß, um sie im Editor anzuzeigen. Bitte nutze SFTP oder den Dateimanager.' },
					{ status: 400 }
				);
			}
			throw error(500, `Pterodactyl API Fehler: ${response.status} - ${detail || 'Unknown error'}`);
		}

		// Pterodactyl gibt Dateiinhalt entweder als JSON oder direkt als Text zurück
		// Lese zuerst als Text (können wir nur einmal lesen)
		const responseText = await response.text();
		console.log('Datei-Response (raw, erste 500 Zeichen):', responseText.substring(0, 500));
		
		let contents = '';
		
		// Versuche als JSON zu parsen
		try {
			const data = JSON.parse(responseText);
			console.log('Datei-Response (JSON):', JSON.stringify(data, null, 2));
			
			// Pterodactyl gibt Dateiinhalt in verschiedenen Formaten zurück
			// Zuerst prüfen wir ob es ein Pterodactyl-Wrapper-Objekt ist
			if (data.attributes?.contents !== undefined) {
				contents = data.attributes.contents;
			} else if (data.data?.attributes?.contents !== undefined) {
				contents = data.data.attributes.contents;
			} else if (data.contents !== undefined && typeof data.contents === 'string') {
				contents = data.contents;
			} else if (data.data?.contents !== undefined && typeof data.data.contents === 'string') {
				contents = data.data.contents;
			} else {
				// Wenn kein contents-Feld gefunden wurde, ist das gesamte JSON-Objekt der Dateiinhalt
				// Das passiert, wenn Pterodactyl den JSON-Inhalt direkt zurückgibt (z.B. config.json)
				// Verwende den rohen Response-Text, da dieser den originalen JSON-String enthält
				contents = responseText;
				console.log('Kein contents-Feld gefunden, verwende gesamten Response als Dateiinhalt');
			}
		} catch (e) {
			// Kein JSON, ist direkter Text
			console.log('Datei ist direkter Text (kein JSON)');
			contents = responseText;
		}
		
		// Prüfe ob der Inhalt Base64-kodiert ist und dekodiere ihn
		if (contents && typeof contents === 'string' && contents.trim().length > 0) {
			try {
				// Versuche Base64 zu dekodieren (Pterodactyl verwendet oft Base64)
				// Prüfe ob es Base64 ist (keine Leerzeichen, nur Base64-Zeichen, möglicherweise mit Padding)
				const trimmed = contents.trim();
				if (/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed) && trimmed.length > 10) {
					// Versuche zu dekodieren
					const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
					// Wenn dekodiert erfolgreich war und sinnvollen Text enthält (nicht nur unlesbare Zeichen)
					if (decoded && decoded.length > 0 && !/^[\x00-\x08\x0B-\x0C\x0E-\x1F]*$/.test(decoded)) {
						contents = decoded;
						console.log('Dateiinhalt war Base64-kodiert, dekodiert');
					}
				}
			} catch (e) {
				// Wenn Dekodierung fehlschlägt, verwende Original-String
				console.warn('Konnte Dateiinhalt nicht dekodieren (kein Base64):', e);
			}
		}

		console.log('Dateiinhalt (final, erste 200 Zeichen):', contents.substring(0, 200));

		return json({ contents });
	} catch (err) {
		console.error('Datei lesen Fehler:', err);
		throw error(500, err instanceof Error ? err.message : 'Konnte Datei nicht lesen');
	}
};
