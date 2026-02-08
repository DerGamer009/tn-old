import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { checkMultipleDomains, DEFAULT_TLDS } from '$lib/server/godaddy';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
	check: async ({ request }) => {
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim() || '';

		if (!name) {
			return fail(400, {
				error: 'Bitte gib einen Namen ein (z.B. icesmp oder meineseite).',
				results: [],
				name: ''
			});
		}

		const apiKey = env.GODADDY_API_KEY;
		const apiSecret = env.GODADDY_API_SECRET;

		if (!apiKey || !apiSecret) {
			return fail(503, {
				error: 'Domain-Check ist derzeit nicht verfügbar. Bitte später erneut versuchen.',
				results: [],
				name
			});
		}

		const normalizedName = name.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
		if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(normalizedName)) {
			return fail(400, {
				error: 'Nur Buchstaben, Zahlen und Bindestriche (z.B. icesmp).',
				results: [],
				name
			});
		}

		const results = await checkMultipleDomains(normalizedName, DEFAULT_TLDS, apiKey, apiSecret);

		return {
			success: true,
			name: normalizedName,
			results
		};
	}
};
