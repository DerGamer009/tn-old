import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

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

