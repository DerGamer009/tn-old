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

		// Hole Schedule-Details (enthält Tasks)
		const scheduleResponse = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/schedules/${params.scheduleId}`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		if (!scheduleResponse.ok) {
			const errorData = await scheduleResponse.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', scheduleResponse.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(scheduleResponse.status, errorMessage);
		}

		const scheduleData = await scheduleResponse.json();
		const schedule = scheduleData.attributes || scheduleData.data?.attributes || scheduleData;
		const tasks = schedule.relationships?.tasks?.data || [];

		return json({ tasks });
	} catch (err) {
		console.error('Tasks laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Tasks nicht laden');
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

	const { action, payload, time_offset, continue_on_failure } = await request.json();

	if (!action || typeof action !== 'string') {
		throw error(400, 'Task-Action ist erforderlich');
	}

	if (!['command', 'power', 'backup'].includes(action)) {
		throw error(400, 'Ungültige Task-Action. Erlaubt: command, power, backup');
	}

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Erstelle Task über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/schedules/${params.scheduleId}/tasks`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					action,
					payload: payload || '',
					time_offset: time_offset !== undefined ? time_offset : 0,
					continue_on_failure: continue_on_failure !== undefined ? continue_on_failure : false
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const taskData = await response.json();
		const task = taskData.attributes || taskData.data?.attributes || taskData;

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'schedule_task_create',
			getClientIp(request),
			`Task "${action}" zu Schedule ${params.scheduleId} hinzugefügt`
		);

		return json({ task });
	} catch (err) {
		console.error('Task erstellen Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Task nicht erstellen');
	}
};
