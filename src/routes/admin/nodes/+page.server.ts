import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getPterodactylNodes, getPterodactylLocations, createPterodactylNode } from '$lib/server/pterodactyl';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const [nodes, pterodactylResult, locationsResult] = await Promise.all([
		prisma.node.findMany({
			include: {
				_count: {
					select: { servers: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		}),
		getPterodactylNodes().then((nodes) => ({ nodes, error: null })).catch((err) => ({
			nodes: [] as Awaited<ReturnType<typeof getPterodactylNodes>>,
			error: err instanceof Error ? err.message : 'Pterodactyl-Nodes konnten nicht geladen werden.'
		})),
		getPterodactylLocations().then((locations) => ({ locations, error: null })).catch((err) => ({
			locations: [] as Array<{ id: number; short: string; long?: string }>,
			error: err instanceof Error ? err.message : 'Locations konnten nicht geladen werden.'
		}))
	]);

	return {
		nodes,
		pterodactylNodes: pterodactylResult.nodes,
		pterodactylError: pterodactylResult.error,
		pterodactylLocations: locationsResult.locations,
		pterodactylLocationsError: locationsResult.error
	};
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		
		const name = data.get('name') as string;
		const hostname = data.get('hostname') as string;
		const ip = data.get('ip') as string;
		const port = parseInt(data.get('port') as string) || 22;
		const username = data.get('username') as string || 'root';
		const location = data.get('location') as string;
		const totalCpu = parseInt(data.get('totalCpu') as string);
		const totalRam = parseInt(data.get('totalRam') as string);
		const totalDisk = parseInt(data.get('totalDisk') as string);

		if (!name || !hostname || !ip || !location || !totalCpu || !totalRam || !totalDisk) {
			return fail(400, { error: 'Alle Felder müssen ausgefüllt werden' });
		}

		try {
			await prisma.node.create({
				data: {
					name,
					hostname,
					ip,
					port,
					username,
					location,
					totalCpu,
					totalRam,
					totalDisk
				}
			});

			return { success: true };
		} catch (error) {
			console.error('Error creating node:', error);
			return fail(500, { error: 'Fehler beim Erstellen des Nodes' });
		}
	},

	toggleStatus: async ({ request }) => {
		const data = await request.formData();
		const nodeId = data.get('nodeId') as string;
		const status = data.get('status') as string;

		try {
			await prisma.node.update({
				where: { id: nodeId },
				data: {
					// Status-String in Prisma-Enum casten
					status: status as any
				}
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Aktualisieren' });
		}
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const nodeId = data.get('nodeId') as string;
		const isActive = data.get('isActive') === 'true';

		try {
			await prisma.node.update({
				where: { id: nodeId },
				data: { isActive }
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const nodeId = data.get('nodeId') as string;

		try {
			// Prüfe ob Server auf dem Node laufen
			const serverCount = await prisma.server.count({
				where: { nodeId }
			});

			if (serverCount > 0) {
				return fail(400, { error: 'Node kann nicht gelöscht werden, da noch Server darauf laufen' });
			}

			await prisma.node.delete({
				where: { id: nodeId }
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Löschen' });
		}
	},

	createPterodactylNode: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || undefined;
		const locationId = parseInt(data.get('locationId') as string, 10);
		const fqdn = (data.get('fqdn') as string)?.trim();
		const scheme = (data.get('scheme') as string) === 'http' ? 'http' : 'https';
		const memory = parseInt(data.get('memory') as string, 10);
		const disk = parseInt(data.get('disk') as string, 10);
		const daemonListen = parseInt(data.get('daemonListen') as string, 10) || 8080;
		const daemonSftp = parseInt(data.get('daemonSftp') as string, 10) || 2022;

		if (!name || !fqdn || isNaN(locationId) || isNaN(memory) || isNaN(disk) || memory <= 0 || disk <= 0) {
			return fail(400, { error: 'Name, FQDN, Location, Memory und Disk sind erforderlich.' });
		}

		try {
			await createPterodactylNode({
				name,
				description,
				locationId,
				fqdn,
				scheme,
				memory,
				disk,
				daemonListen,
				daemonSftp
			});
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Fehler beim Erstellen des Pterodactyl-Nodes.';
			return fail(500, { error: message });
		}
	}
} satisfies Actions;

