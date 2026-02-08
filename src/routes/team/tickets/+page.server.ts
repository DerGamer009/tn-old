import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	// Lade alle Tickets (nicht nur eigene)
	const tickets = await prisma.ticket.findMany({
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
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

	// Stats
	const [openCount, inProgressCount, waitingCount, urgentCount] = await Promise.all([
		prisma.ticket.count({ where: { status: 'OPEN' } }),
		prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
		prisma.ticket.count({ where: { status: 'WAITING_FOR_CUSTOMER' } }),
		prisma.ticket.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } })
	]);

	return {
		tickets,
		stats: {
			open: openCount,
			inProgress: inProgressCount,
			waiting: waitingCount,
			urgent: urgentCount
		}
	};
};

