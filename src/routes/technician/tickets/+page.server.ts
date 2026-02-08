import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const tickets = await prisma.ticket.findMany({
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					role: true
				}
			},
			server: {
				select: {
					id: true,
					name: true,
					type: true
				}
			},
			messages: {
				orderBy: { createdAt: 'desc' },
				take: 1
			},
			_count: {
				select: { messages: true }
			}
		},
		orderBy: { updatedAt: 'desc' }
	});

	return { tickets };
};
