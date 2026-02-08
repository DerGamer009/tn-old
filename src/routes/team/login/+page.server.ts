import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';
import { isTeamMember } from '$lib/server/roles';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect wenn bereits eingeloggt
	if (locals.user) {
		throw redirect(302, '/team');
	}
	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const pin = data.get('pin') as string;

		// Validierung
		if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
			return fail(400, { error: 'Bitte gib einen gültigen 6-stelligen PIN ein' });
		}

		try {
			// Suche User mit diesem PIN
			const user = await prisma.user.findUnique({
				where: { supportPin: pin }
			});

			if (!user) {
				return fail(400, { error: 'Ungültiger PIN' });
			}

			// Prüfe ob User aktiv ist
			if (!user.isActive) {
				return fail(403, { error: 'Dein Account wurde deaktiviert' });
			}

			// Prüfe ob User Team-Mitglied ist
			if (!isTeamMember(user.role)) {
				return fail(403, { error: 'Kein Zugriff auf Team Dashboard' });
			}

			// Session erstellen
			const sessionToken = await createSession(user.id);

			// Cookie setzen
			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 8 // 8 Stunden
			});

			// Redirect zum Team Dashboard
			throw redirect(303, '/team');
		} catch (error) {
			console.error('Team login error:', error);
			return fail(500, { error: 'Ein Fehler ist aufgetreten' });
		}
	}
} satisfies Actions;

