import type { PageServerLoad, Actions } from './$types';
import {
	getPterodactylNode,
	deletePterodactylNode,
	updatePterodactylNode,
	getPterodactylNodeConfiguration,
	getPterodactylLocations,
	createPterodactylNodeAllocations,
	deletePterodactylNodeAllocation
} from '$lib/server/pterodactyl';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	const numId = parseInt(id, 10);
	if (isNaN(numId)) {
		throw redirect(302, '/admin/nodes');
	}
	try {
		const [node, configResult, locationsResult] = await Promise.all([
			getPterodactylNode(numId, { include: 'allocations,location,servers' }),
			getPterodactylNodeConfiguration(numId).then((c) => ({ config: c, error: null })).catch((err) => ({
				config: null as Record<string, unknown> | null,
				error: err instanceof Error ? err.message : 'Konfiguration konnte nicht geladen werden.'
			})),
			getPterodactylLocations().then((l) => ({ locations: l, error: null })).catch(() => ({
				locations: [] as Array<{ id: number; short: string; long?: string }>,
				error: null
			}))
		]);
		return {
			node,
			error: null,
			nodeConfiguration: configResult.config,
			configurationError: configResult.error,
			locations: locationsResult.locations
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Node konnte nicht geladen werden.';
		return {
			node: null,
			error: message,
			nodeConfiguration: null,
			configurationError: null,
			locations: []
		};
	}
};

export const actions = {
	delete: async ({ params }) => {
		const id = params.id;
		const numId = parseInt(id, 10);
		if (isNaN(numId)) {
			return fail(400, { error: 'Ungültige Node-ID' });
		}
		try {
			await deletePterodactylNode(numId);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Node konnte nicht gelöscht werden.';
			return fail(500, { error: message });
		}
		throw redirect(303, '/admin/nodes');
	},

	addAllocation: async ({ params, request }) => {
		const id = params.id;
		const numId = parseInt(id, 10);
		if (isNaN(numId)) return fail(400, { error: 'Ungültige Node-ID', form: 'allocation' });
		const formData = await request.formData();
		const ip = (formData.get('ip') as string)?.trim();
		const ipAlias = (formData.get('ipAlias') as string)?.trim() || undefined;
		const portsRaw = (formData.get('ports') as string)?.trim();
		if (!ip) return fail(400, { error: 'IP-Adresse ist erforderlich.', form: 'allocation' });
		// Ports: Komma oder Leerzeichen oder Zeilenumbrüche
		const ports = portsRaw
			? portsRaw.split(/[\s,\n]+/).map((p) => p.trim()).filter(Boolean)
			: [];
		if (ports.length === 0) return fail(400, { error: 'Mindestens ein Port oder Port-Bereich (z.B. 25565-25570) ist erforderlich.', form: 'allocation' });
		try {
			await createPterodactylNodeAllocations(numId, { ip, ipAlias, ports });
			return { success: true, form: 'allocation' };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Allocations konnten nicht erstellt werden.';
			return fail(500, { error: message, form: 'allocation' });
		}
	},

		deleteAllocation: async ({ params, request }) => {
			const id = params.id;
			const numId = parseInt(id, 10);
			if (isNaN(numId)) return fail(400, { error: 'Ungültige Node-ID', form: 'allocation' });
			const allocationId = (await request.formData()).get('allocationId') as string;
			const allocId = parseInt(allocationId, 10);
			if (isNaN(allocId)) return fail(400, { error: 'Ungültige Allocation-ID.', form: 'allocation' });
			try {
				await deletePterodactylNodeAllocation(numId, allocId);
				return { success: true, form: 'allocation' };
			} catch (e) {
				const message = e instanceof Error ? e.message : 'Allocation konnte nicht gelöscht werden.';
				return fail(500, { error: message, form: 'allocation' });
			}
		},

		updateNode: async ({ params, request }) => {
			const id = params.id;
			const numId = parseInt(id, 10);
			if (isNaN(numId)) return fail(400, { error: 'Ungültige Node-ID', form: 'settings' });
			const formData = await request.formData();
			const name = (formData.get('name') as string)?.trim();
			const description = (formData.get('description') as string)?.trim() || '';
			const fqdn = (formData.get('fqdn') as string)?.trim();
			const scheme = (formData.get('scheme') as string) === 'http' ? 'http' : 'https';
			const memory = parseInt(formData.get('memory') as string, 10);
			const disk = parseInt(formData.get('disk') as string, 10);
			const daemonListen = parseInt(formData.get('daemonListen') as string, 10) || 8080;
			const daemonSftp = parseInt(formData.get('daemonSftp') as string, 10) || 2022;
			const locationId = parseInt(formData.get('locationId') as string, 10);
			const maintenanceMode = formData.get('maintenanceMode') === 'true';
			if (!name || !fqdn || isNaN(memory) || isNaN(disk)) {
				return fail(400, { error: 'Name, FQDN, Memory und Disk sind erforderlich.', form: 'settings' });
			}
			try {
				await updatePterodactylNode(numId, {
					name,
					description: description || undefined,
					fqdn,
					scheme,
					memory,
					disk,
					daemonListen,
					daemonSftp,
					locationId: isNaN(locationId) ? undefined : locationId,
					maintenanceMode
				});
				return { success: true, form: 'settings' };
			} catch (e) {
				const message = e instanceof Error ? e.message : 'Node konnte nicht aktualisiert werden.';
				return fail(500, { error: message, form: 'settings' });
			}
		}
	} satisfies Actions;
