import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { createTicket } from '$lib/server/tickets';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { user } = await parent();
	const domain = (url.searchParams.get('domain') ?? '').trim().toLowerCase();
	const validDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(domain)
		? domain
		: '';
	return {
		domain: validDomain,
		user: user ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null
	};
};

export const actions: Actions = {
	order: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Bitte melde dich an, um die Domain über uns zu bestellen.' });
		}
		const formData = await request.formData();
		const domain = (formData.get('domain') as string)?.trim() ?? '';
		const message = (formData.get('message') as string)?.trim() ?? '';

		if (!domain || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(domain)) {
			return fail(400, { error: 'Bitte gib eine gültige Domain ein.' });
		}

		const description = `[Domain-Bestellung]\n\nGewünschte Domain: ${domain}\n\n${message ? `Nachricht des Kunden:\n${message}` : 'Keine zusätzliche Nachricht.'}`;

		try {
			await createTicket({
				userId: locals.user.id,
				subject: `Domain-Bestellung: ${domain}`,
				description,
				priority: 'MEDIUM'
			});
			return { success: true, domain };
		} catch (e) {
			console.error('Domain order ticket error:', e);
			return fail(500, { error: 'Die Bestellanfrage konnte nicht erstellt werden. Bitte versuche es erneut.' });
		}
	}
};
