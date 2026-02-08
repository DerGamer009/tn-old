import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createVpsServer } from '$lib/server/vps';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const { name, cpu, ram, storage, bandwidth, priceMonthly, orderId } = data;

		if (!name || !cpu || !ram || !storage || !bandwidth || !priceMonthly) {
			return json(
				{ error: 'Alle Felder müssen ausgefüllt werden' },
				{ status: 400 }
			);
		}

		const server = await createVpsServer({
			userId: locals.user.id,
			name,
			cpu: parseInt(cpu),
			ram: parseInt(ram),
			storage: parseInt(storage),
			bandwidth: parseInt(bandwidth),
			priceMonthly: parseFloat(priceMonthly),
			orderId,
		});

		return json({ success: true, server }, { status: 201 });
	} catch (error) {
		console.error('Error creating VPS:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Fehler beim Erstellen des VPS' },
			{ status: 500 }
		);
	}
};

