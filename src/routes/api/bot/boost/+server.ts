import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { addMonthsToServerLaufzeit } from '$lib/server/app-hosting';

const TITANNODE_BOT_API_KEY = process.env.TITANNODE_BOT_API_KEY || '';

/**
 * TitanNode Bot API: Boost-Gutschrift
 * 1 Boost = +1 Monat Laufzeit auf einem Gameserver oder App-Hosting-Server des Users.
 *
 * Auth: Bearer TITANNODE_BOT_API_KEY
 * Body: { discordUserId: string, boosts: number, serverId?: string }
 * - discordUserId: Discord User ID (User muss in TitanNode discordUserId hinterlegt haben)
 * - boosts: Anzahl Monate (z. B. 1 Boost = 1)
 * - serverId: optional – welcher Server verlängert wird; sonst wird der am frühesten ablaufende gewählt
 */
export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('Authorization');
	const expected = `Bearer ${TITANNODE_BOT_API_KEY}`;
	if (!TITANNODE_BOT_API_KEY || auth !== expected) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	let body: { discordUserId?: string; boosts?: number; serverId?: string };
	try {
		body = await request.json();
	} catch {
		return json(
			{ success: false, error: 'Ungültiger JSON-Body' },
			{ status: 400 }
		);
	}

	const discordUserId = body.discordUserId?.trim();
	const boosts = typeof body.boosts === 'number' ? Math.floor(body.boosts) : parseInt(String(body.boosts || '0'), 10);
	const serverId = body.serverId?.trim();

	if (!discordUserId) {
		return json(
			{ success: false, error: 'discordUserId fehlt' },
			{ status: 400 }
		);
	}
	if (!Number.isFinite(boosts) || boosts < 1) {
		return json(
			{ success: false, error: 'boosts muss eine positive Zahl sein (1 Boost = 1 Monat)' },
			{ status: 400 }
		);
	}

	const user = await prisma.user.findUnique({
		where: { discordUserId }
	} as any);

	if (!user) {
		return json(
			{ success: false, error: 'Kein TitanNode-Account mit dieser Discord-ID verknüpft' },
			{ status: 404 }
		);
	}

	let targetServerId: string | null = null;

	if (serverId) {
		const server = await prisma.server.findFirst({
			where: {
				id: serverId,
				userId: user.id,
				type: { in: ['GAMESERVER', 'APP_HOSTING'] }
			} as any
		});
		if (!server) {
			return json(
				{ success: false, error: 'Server nicht gefunden oder gehört nicht diesem User' },
				{ status: 404 }
			);
		}
		targetServerId = server.id;
	} else {
		const server = await prisma.server.findFirst({
			where: {
				userId: user.id,
				type: { in: ['GAMESERVER', 'APP_HOSTING'] }
			} as any,
			orderBy: [
				{ expiresAt: 'asc' },
				{ createdAt: 'desc' }
			]
		});
		if (!server) {
			return json(
				{ success: false, error: 'User hat keinen Gameserver oder App-Hosting-Server' },
				{ status: 404 }
			);
		}
		targetServerId = server.id;
	}

	try {
		const { server, newExpiresAt } = await addMonthsToServerLaufzeit(targetServerId, boosts);
		return json({
			success: true,
			months: boosts,
			serverId: server.id,
			serverName: server.name,
			serverType: server.type,
			expiresAt: newExpiresAt.toISOString()
		});
	} catch (err) {
		console.error('Bot boost API error:', err);
		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Fehler beim Gutschreiben'
			},
			{ status: 500 }
		);
	}
};
