import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { restartGameserver } from '$lib/server/app-hosting';
import { prisma } from '$lib/server/prisma';
import { logServerActivity, getClientIp } from '$lib/server/server-activity';
import { PterodactylApiError } from '$lib/server/pterodactyl';

export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	if (!id) {
		return json({ error: 'Server ID fehlt' }, { status: 400 });
	}

	try {
		// Prüfe ob der Server dem User gehört
		const server = await prisma.server.findUnique({
			where: { id },
		});

		if (!server || server.userId !== locals.user.id || server.type !== 'GAMESERVER') {
			return json({ error: 'Server nicht gefunden' }, { status: 404 });
		}

		await restartGameserver(id);
		
		// Log Activity
		await logServerActivity(
			id,
			locals.user.id,
			'restart',
			getClientIp(request)
		);

		return json({ success: true });
	} catch (err) {
		console.error('Error restarting Gameserver:', err);
		if (err instanceof PterodactylApiError) {
			const msg = err.statusCode === 403
				? 'Keine Berechtigung für diesen Server (Power-Aktion). Bitte Support kontaktieren.'
				: err.message;
			return json({ error: msg }, { status: 502 });
		}
		return json(
			{ error: err instanceof Error ? err.message : 'Fehler beim Neustarten des Gameservers' },
			{ status: 500 }
		);
	}
};
