import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';

// Upload nutzt Pterodactyl Client-API mit PTERODACTYL_USER_KEY. Dieser Key gilt nur für Server,
// die dem zugehörigen Pterodactyl-User gehören. Damit Upload für alle Kunden funktioniert,
// PTERODACTYL_SERVICE_USER_ID setzen und neue Server mit diesem User erstellen (gameserver.ts/app-hosting).

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

	try {
		let formData: FormData;
		try {
			formData = await request.formData();
		} catch (e) {
			// Body zu groß (z. B. Vercel/Proxy-Limit) → 413
			return json(
				{ error: 'Die Datei ist zu groß für den Upload. Bitte nutze SFTP oder lade eine kleinere Datei hoch.' },
				{ status: 413 }
			);
		}
		const directory = formData.get('directory') as string || '/';
		const file = formData.get('files') as File;

		if (!file) {
			throw error(400, 'Keine Datei erhalten');
		}

		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

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
			const detail = errorData.errors?.[0]?.detail || errorData.message || '';
			console.error('Pterodactyl API Fehler (Upload-URL):', urlResponse.status, errorData);
			// 403 = Key hat keinen Zugriff auf diesen Server (Server gehört anderem Pterodactyl-User)
			const msg =
				urlResponse.status === 403
					? 'Keine Berechtigung für diesen Server. Bitte Support kontaktieren (Server-Zugriff).'
					: detail || `Pterodactyl Fehler: ${urlResponse.status}`;
			return json({ error: msg }, { status: 502 });
		}

		const urlData = await urlResponse.json();
		let signedUrl = urlData.attributes?.url || urlData.url;

		if (!signedUrl) {
			return json({ error: 'Keine signierte URL erhalten' }, { status: 502 });
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
			const errorText = await uploadResponse.text().catch(() => '');
			console.error('Upload Fehler:', uploadResponse.status, errorText);
			const is413 = uploadResponse.status === 413;
			const msg = is413
				? 'Die Datei ist zu groß für den Upload. Bitte nutze SFTP oder lade eine kleinere Datei hoch.'
				: (errorText || `Upload fehlgeschlagen: ${uploadResponse.status}`);
			return json({ error: msg }, { status: is413 ? 413 : 502 });
		}

		return json({ success: true });
	} catch (err) {
		console.error('Upload Proxy Fehler:', err);
		const message = err instanceof Error ? err.message : 'Konnte Datei nicht hochladen';
		return json({ error: message }, { status: 500 });
	}
};
