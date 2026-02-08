import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getServerIdentifierFromId } from '$lib/server/pterodactyl';
import { logServerActivity, getClientIp } from '$lib/server/server-activity';

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

	const { notes } = await request.json().catch(() => ({}));

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Aktualisiere Allocation Notes über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/network/allocations/${params.allocationId}`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					...(notes !== undefined && { notes: notes?.trim() || null })
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Pterodactyl API Fehler:', response.status, errorData);
			const errorMessage = errorData.errors?.[0]?.detail || errorData.message || 'Unknown error';
			throw error(response.status, errorMessage);
		}

		const allocationData = await response.json();
		const allocation = allocationData.attributes || allocationData.data?.attributes || allocationData;

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'allocation_update',
			getClientIp(request),
			`Notes für Allocation ${allocation.ip}:${allocation.port} aktualisiert`
		);

		return json({ allocation });
	} catch (err) {
		console.error('Allocation aktualisieren Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Allocation nicht aktualisieren');
	}
};

export const DELETE: RequestHandler = async ({ locals, params, request }) => {
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

		// Lösche Allocation über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/network/allocations/${params.allocationId}`,
			{
				method: 'DELETE',
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

		// Log Activity
		await logServerActivity(
			server.id,
			locals.user.id,
			'allocation_delete',
			getClientIp(request),
			`Allocation ${params.allocationId} entfernt`
		);

		return json({ success: true });
	} catch (err) {
		console.error('Allocation löschen Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Allocation nicht löschen');
	}
};
