import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resetPasswordWithToken } from '$lib/server/password-reset';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const sessionToken = cookies.get('session');
	if (sessionToken) {
		throw redirect(302, '/dashboard');
	}
	const token = url.searchParams.get('token') ?? '';
	return { token };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const token = (data.get('token') as string) || url.searchParams.get('token') || '';
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		if (!token) {
			return fail(400, {
				error: 'Kein gültiger Link. Bitte fordere einen neuen Link über „Passwort vergessen“ an.',
				token: ''
			});
		}

		if (!password || password.length < 8) {
			return fail(400, {
				error: 'Passwort muss mindestens 8 Zeichen lang sein.',
				token
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Die Passwörter stimmen nicht überein.',
				token
			});
		}

		const result = await resetPasswordWithToken(token, password);

		if (!result.success) {
			return fail(400, {
				error: result.error,
				token
			});
		}

		return {
			success: true,
			message: 'Dein Passwort wurde geändert. Du kannst dich jetzt anmelden.'
		};
	}
};
