import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requestPasswordReset } from '$lib/server/password-reset';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get('session');
	if (sessionToken) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();

		if (!email || !email.includes('@')) {
			return fail(400, {
				error: 'Bitte gib eine gültige E-Mail-Adresse ein.',
				email: email || ''
			});
		}

		const result = await requestPasswordReset(email);

		if (!result.success) {
			return fail(500, {
				error: result.error,
				email
			});
		}

		// Immer Erfolg anzeigen (kein Hinweis, ob E-Mail existiert)
		return {
			success: true,
			message:
				'Falls ein Account mit dieser E-Mail existiert, wurde dir ein Link zum Zurücksetzen des Passworts gesendet. Prüfe auch deinen Spam-Ordner.'
		};
	}
};
