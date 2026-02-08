import { validateSession, type AuthUser } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (sessionToken) {
		const session = await validateSession(sessionToken);

		if (session) {
			const u = session.user as any;
			const authUser: AuthUser = {
				id: u.id,
				email: u.email,
				firstName: u.firstName,
				lastName: u.lastName,
				image: u.image,
				emailVerified: u.emailVerified,
				emailVerifiedAt: u.emailVerifiedAt,
				identityVerified: u.identityVerified ?? false,
				role: u.role,
				supportPin: u.supportPin,
				isActive: u.isActive,
				twoFactorEnabled: u.twoFactorEnabled ?? false
			};

			event.locals.user = authUser;
		} else {
			// Session ungültig, Cookie löschen
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};

