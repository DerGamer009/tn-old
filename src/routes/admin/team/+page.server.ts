import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { generateSupportPin } from '$lib/server/roles';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// Lade alle Benutzer mit Team-Rollen (alles außer USER)
	const teamMembers = await prisma.user.findMany({
		where: {
			role: {
				not: 'USER'
			}
		},
		include: {
			_count: {
				select: {
					tickets: true,
					loginActivities: true
				}
			}
		},
		orderBy: [
			{ role: 'asc' },
			{ createdAt: 'desc' }
		]
	});

	// Statistiken
	const stats = {
		total: teamMembers.length,
		salesTeam: teamMembers.filter(m => m.role === 'SALES_TEAM').length,
		supportTeam: teamMembers.filter(m => m.role === 'SUPPORT_TEAM').length,
		technician: teamMembers.filter(m => m.role === 'TECHNICIAN').length,
		management: teamMembers.filter(m => m.role === 'MANAGEMENT').length,
		founder: teamMembers.filter(m => m.role === 'FOUNDER').length,
		active: teamMembers.filter(m => m.isActive).length
	};

	return { teamMembers, stats };
};

export const actions = {
	regeneratePin: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;

		try {
			const newPin = generateSupportPin();
			await prisma.user.update({
				where: { id: userId },
				data: { supportPin: newPin }
			});

			return { success: true, pin: newPin };
		} catch (error) {
			return fail(500, { error: 'Fehler beim Generieren des PINs' });
		}
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		const isActive = data.get('isActive') === 'true';

		try {
			await prisma.user.update({
				where: { id: userId },
				data: { isActive }
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler' });
		}
	}
} satisfies Actions;

