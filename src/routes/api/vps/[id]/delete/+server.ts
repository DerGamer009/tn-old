import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteVps } from '$lib/server/vps';
import { prisma } from '$lib/server/prisma';

export const DELETE: RequestHandler = async ({ params, locals }) => {
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

		await deleteVps(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting VPS:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Löschen des VPS' },
			{ status: 500 }
		);
	}
};

