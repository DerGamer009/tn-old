import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';
import { isTeamMember } from '$lib/server/roles';

export const load: PageServerLoad = async ({ locals }) => {
	// nur Team-Mitglieder
	if (!locals.user || !isTeamMember(locals.user.role)) {
		throw redirect(302, '/team/login');
	}
	// Lade alle Accounts (Kunden + Team)
	const customers = await prisma.user.findMany({
		include: {
			_count: {
				select: {
					servers: true,
					tickets: true,
					invoices: true
				}
			},
			servers: {
				select: {
					id: true,
					name: true,
					type: true,
					status: true
				},
				take: 3
			},
			tickets: {
				where: { status: { not: 'CLOSED' } },
				select: {
					id: true,
					status: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// Stats
	const [totalCustomers, activeServers, openTickets] = await Promise.all([
		prisma.user.count(),
		prisma.server.count({ where: { status: 'ACTIVE' } }),
		prisma.ticket.count({ where: { status: { not: 'CLOSED' } } })
	]);

	return {
		customers,
		stats: {
			total: totalCustomers,
			activeServers,
			openTickets
		}
	};
};

export const actions: Actions = {
	impersonate: async ({ request, cookies, locals }) => {
		if (!locals.user || !isTeamMember(locals.user.role)) {
			throw redirect(302, '/team/login');
		}

		const data = await request.formData();
		const userId = data.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'Fehlende Daten' });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			return fail(404, { error: 'User nicht gefunden' });
		}

		if (!user.isActive) {
			return fail(403, { error: 'Account ist deaktiviert' });
		}

		// Aktuelle Team-Session sichern, falls noch nicht gesichert
		const currentSession = cookies.get('session');
		if (currentSession) {
			cookies.set('team_session', currentSession, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 8 // 8 Stunden
			});
		}

		// Neue Session als dieser User erstellen (Impersonation)
		const sessionToken = await createSession(user.id, {
			createdByImpersonationUserId: locals.user.id
		});

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 8 // 8 Stunden
		});

		throw redirect(303, '/dashboard');
	}
};


