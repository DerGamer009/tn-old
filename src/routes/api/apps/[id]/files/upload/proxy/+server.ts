import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ locals, params, request }) => {
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
		const formData = await request.formData();
		const directory = formData.get('directory') as string || '/';
		const file = formData.get('files') as File;

		if (!file) {
			throw error(400, 'Keine Datei erhalten');
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

		// Schritt 1: Hole signierte Upload-URL
		const uploadUrl = new URL(`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/files/upload`);
		uploadUrl.searchParams.set('directory', directory);

		const urlResponse = await fetch(uploadUrl.toString(), {
			headers: {
				'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
				'Accept': 'Application/vnd.pterodactyl.v1+json',
				'Content-Type': 'application/json'
			}
		});

		if (!urlResponse.ok) {
			const errorData = await urlResponse.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', urlResponse.status, errorData);
			throw error(500, `Pterodactyl API Fehler: ${urlResponse.status} - ${errorData.errors?.[0]?.detail || errorData.message || 'Unknown error'}`);
		}

		const urlData = await urlResponse.json();
		let signedUrl = urlData.attributes?.url || urlData.url;

		if (!signedUrl) {
			throw error(500, 'Keine signierte URL erhalten');
		}

		// Füge directory als Query-Parameter zur signierten URL hinzu
		const signedUrlObj = new URL(signedUrl);
		signedUrlObj.searchParams.set('directory', directory);
		signedUrl = signedUrlObj.toString();

		// Schritt 2: Lade Datei zur signierten URL hoch (Server-zu-Server, kein CORS-Problem)
		const uploadFormData = new FormData();
		uploadFormData.append('files', file);
		uploadFormData.append('directory', directory);

		const uploadResponse = await fetch(signedUrl, {
			method: 'POST',
			body: uploadFormData
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text().catch(() => 'Unknown error');
			console.error('Upload Fehler:', uploadResponse.status, errorText);
			throw error(500, `Upload fehlgeschlagen: ${uploadResponse.status}`);
		}

		return json({ success: true });
	} catch (err) {
		console.error('Upload Proxy Fehler:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Datei nicht hochladen');
	}
};
