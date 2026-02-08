import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	// Lade nur aktive Team-Mitglieder (keine USER)
	const teamMembers = await prisma.user.findMany({
		where: {
			role: {
				not: 'USER'
			},
			isActive: true
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			position: true,
			image: true,
			createdAt: true
		},
		orderBy: [
			{ role: 'asc' },
			{ createdAt: 'asc' }
		]
	});

	return { teamMembers };
};

