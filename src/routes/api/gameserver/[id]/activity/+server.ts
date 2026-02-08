import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerActivities } from '$lib/server/server-activity';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const server = await prisma.server.findUnique({
		where: { id: params.id, userId: locals.user.id, type: 'GAMESERVER' }
	}) as any;

	if (!server) {
		throw error(404, 'Server nicht gefunden');
	}

	const limit = parseInt(url.searchParams.get('limit') || '50');

	try {
		const activities = await getServerActivities(params.id, limit);
		return json({ activities });
	} catch (err) {
		console.error('Fehler beim Laden der Activity-Logs:', err);
		throw error(500, 'Konnte Activity-Logs nicht laden');
	}
};
