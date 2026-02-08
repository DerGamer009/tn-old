import type { Actions, PageServerLoad } from './$types';
import { getTicketByIdForTeam, addTicketMessageForTeam, updateTicketStatusForTeam } from '$lib/server/tickets';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const ticket = await getTicketByIdForTeam(params.ticketid);

	if (!ticket) {
		throw error(404, 'Ticket nicht gefunden');
	}

	return {
		ticket
	};
};

export const actions = {
	// Nachricht hinzufügen (als Team-Mitglied)
	addMessage: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht authentifiziert' });
		}

		const data = await request.formData();
		const message = data.get('message') as string;

		if (!message || message.length < 1) {
			return fail(400, { error: 'Nachricht darf nicht leer sein' });
		}

		try {
			await addTicketMessageForTeam({
				ticketId: params.ticketid,
				message
			});

			return { success: true };
		} catch (err) {
			console.error('Error adding message:', err);
			return fail(500, { error: 'Fehler beim Hinzufügen der Nachricht' });
		}
	},

	// Status ändern
	updateStatus: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht authentifiziert' });
		}

		const data = await request.formData();
		const status = data.get('status') as 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'CLOSED';

		if (!['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'CLOSED'].includes(status)) {
			return fail(400, { error: 'Ungültiger Status' });
		}

		try {
			await updateTicketStatusForTeam(params.ticketid, status);
			return { success: true, statusChanged: true };
		} catch (err) {
			console.error('Error updating status:', err);
			return fail(500, { error: 'Fehler beim Aktualisieren des Status' });
		}
	}
} satisfies Actions;
