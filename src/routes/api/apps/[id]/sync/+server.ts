import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncAppHostingStatus } from '$lib/server/app-hosting';
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

		if (!server || server.userId !== locals.user.id || server.type !== 'APP_HOSTING') {
			return json({ error: 'Server nicht gefunden' }, { status: 404 });
		}

		const updated = await syncAppHostingStatus(id);
		return json({ success: true, server: updated });
	} catch (error) {
		console.error('Error syncing App Hosting:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Synchronisieren der App' },
			{ status: 500 }
		);
	}
};

