import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteAppHosting } from '$lib/server/app-hosting';
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

		if (!server || server.userId !== locals.user.id || server.type !== 'APP_HOSTING') {
			return json({ error: 'Server nicht gefunden' }, { status: 404 });
		}

		await deleteAppHosting(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting App Hosting:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Löschen der App' },
			{ status: 500 }
		);
	}
};

