import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { restartVps } from '$lib/server/vps';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ params, locals }) => {
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

		if (!server || server.userId !== locals.user.id) {
			return json({ error: 'Server nicht gefunden' }, { status: 404 });
		}

		await restartVps(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error restarting VPS:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Neustarten des VPS' },
			{ status: 500 }
		);
	}
};

