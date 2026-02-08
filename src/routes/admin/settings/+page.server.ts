import type { PageServerLoad, Actions } from './$types';
import { getSiteBanner, saveSiteBanner } from '$lib/server/site-banner';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const banner = await getSiteBanner();
	return {
		banner: banner ?? {
			enabled: false,
			text: '25% Sale auf alle Gameserver-Pakete und Konfiguration',
			linkUrl: '/gameserver',
			icon: 'tabler:discount-2'
		}
	};
};

export const actions = {
	saveBanner: async ({ request }) => {
		const formData = await request.formData();
		// Checkbox: bei mehreren Werten (hidden + checkbox) den letzten nehmen
		const enabledValues = formData.getAll('enabled');
		const enabled = enabledValues.length > 0
			? enabledValues[enabledValues.length - 1] === 'true'
			: false;
		const text = (formData.get('text') as string)?.trim() ?? '';
		const linkUrl = (formData.get('linkUrl') as string)?.trim() || null;
		const icon = (formData.get('icon') as string)?.trim() || null;
		if (!text) {
			return fail(400, { error: 'Banner-Text ist erforderlich.', form: 'banner' });
		}
		try {
			await saveSiteBanner({ enabled, text, linkUrl, icon });
			return { success: true, form: 'banner' as const };
		} catch (e) {
			console.error('Banner speichern fehlgeschlagen:', e);
			const message = e instanceof Error ? e.message : 'Banner konnte nicht gespeichert werden.';
			return fail(500, { error: message, form: 'banner' as const });
		}
	}
} satisfies Actions;
