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

		// Hole Server-Details für Limits
		const serverResponse = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}`,
			{
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			}
		);

		let allocationLimit = 0;
		if (serverResponse.ok) {
			const serverData = await serverResponse.json();
			const serverAttrs = serverData.attributes || serverData.data?.attributes || serverData;
			allocationLimit = serverAttrs.feature_limits?.allocations || 0;
		}

		// Hole Allocations von Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/network/allocations`,
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
		const allocations = data.data || [];

		return json({ 
			allocations,
			limit: allocationLimit,
			used: allocations.length
		});
	} catch (err) {
		console.error('Allocations laden Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Allocations nicht laden');
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

	const body = await request.json().catch(() => ({}));
	const { ip, port } = body;

	try {
		const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
		const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';

		// Hole Server Identifier
		const serverIdentifier = await getServerIdentifierFromId(server.pterodactylServerId);

		// Erstelle Allocation über Pterodactyl User API
		const response = await fetch(
			`${PTERODACTYL_API_BASE}/api/client/servers/${serverIdentifier}/network/allocations`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${PTERODACTYL_USER_KEY}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					...(ip && { ip }),
					...(port && { port })
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
			'allocation_create',
			getClientIp(request),
			`Allocation ${allocation.ip}:${allocation.port} erstellt`
		);

		return json({ allocation });
	} catch (err) {
		console.error('Allocation erstellen Fehler:', err);
		// Wenn es bereits ein error() ist, werfe es weiter
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, err instanceof Error ? err.message : 'Konnte Allocation nicht erstellen');
	}
};
