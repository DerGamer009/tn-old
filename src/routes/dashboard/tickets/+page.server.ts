import type { Actions, PageServerLoad } from './$types';
import { getUserTickets, getTicketStats, createTicket, getUserServers } from '$lib/server/tickets';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const [tickets, stats, servers] = await Promise.all([
		getUserTickets(user.id),
		getTicketStats(user.id),
		getUserServers(user.id)
	]);

	return {
		tickets,
		stats,
		servers
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht authentifiziert' });
		}

		const data = await request.formData();
		const subject = data.get('subject') as string;
		const description = data.get('description') as string;
		const priority = data.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
		const serverId = data.get('serverId') as string | null;

		// Validierung
		if (!subject || subject.length < 5) {
			return fail(400, { error: 'Betreff muss mindestens 5 Zeichen lang sein' });
		}

		if (!description || description.length < 10) {
			return fail(400, { error: 'Beschreibung muss mindestens 10 Zeichen lang sein' });
		}

		if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
			return fail(400, { error: 'Ungültige Priorität' });
		}

		try {
			await createTicket({
				userId: locals.user.id,
				subject,
				description,
				priority,
				serverId: serverId && serverId !== 'general' ? serverId : undefined
			});

			return { success: true };
		} catch (error) {
			console.error('Error creating ticket:', error);
			return fail(500, { error: 'Fehler beim Erstellen des Tickets' });
		}
	}
} satisfies Actions;

