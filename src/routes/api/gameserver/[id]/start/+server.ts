import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startGameserver } from '$lib/server/app-hosting';
import { prisma } from '$lib/server/prisma';
import { logServerActivity, getClientIp } from '$lib/server/server-activity';

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

		await startGameserver(id);
		
		// Log Activity
		await logServerActivity(
			id,
			locals.user.id,
			'start',
			getClientIp(request)
		);

		return json({ success: true });
	} catch (error) {
		console.error('Error starting Gameserver:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Starten des Gameservers' },
			{ status: 500 }
		);
	}
};
