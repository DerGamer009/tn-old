import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';
import { logServerActivity, getClientIp } from '$lib/server/server-activity';

export const GET: RequestHandler = async ({ locals, params }) => {
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
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Hole Schedules von Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/schedules`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const data = await response.json();
		const schedules = data.data || [];

		return json({ schedules });
	} catch (err) {
		console.error('Schedules laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Schedules nicht laden');
	}
};

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

	const body = await request.json();
	const { name, minute, hour, day_of_month, month, day_of_week, is_active, only_when_online, tasks } = body;

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw error(400, 'Schedule-Name ist erforderlich');
	}

	if (!minute || !hour || !day_of_month || !month || !day_of_week) {
		throw error(400, 'Cron-Ausdrücke sind erforderlich');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Erstelle Schedule über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/schedules`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					name: name.trim(),
					minute,
					hour,
					day_of_month,
					month,
					day_of_week,
					is_active: is_active !== undefined ? is_active : true,
					only_when_online: only_when_online !== undefined ? only_when_online : false
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const scheduleData = await response.json();
		const schedule = scheduleData.attributes || scheduleData.data?.attributes || scheduleData;

		// Erstelle Tasks, falls vorhanden
		if (tasks && Array.isArray(tasks) && tasks.length > 0) {
			for (const task of tasks) {
				try {
					await fetch(
						`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/schedules/${schedule.id}/tasks`,
						{
							method: 'POST',
							headers: {
								'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
								'Content-Type': 'application/json',
								'Accept': 'application/json'
							},
							body: JSON.stringify({
								action: task.action,
								payload: task.payload || '',
								time_offset: task.time_offset || 0,
								continue_on_failure: task.continue_on_failure || false
							})
						}
					);
				} catch (taskError) {
					console.warn('Fehler beim Erstellen eines Tasks:', taskError);
				}
			}
		}

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'schedule_create',
			getClientIp(request),
			`Schedule "${schedule.name}" erstellt`
		);

		return json({ schedule });
	} catch (err) {
		console.error('Schedule erstellen Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Schedule nicht erstellen');
	}
};
