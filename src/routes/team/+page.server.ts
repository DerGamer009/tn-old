import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [openTickets, inProgressTickets, waitingTickets, closedToday] = await Promise.all([
		prisma.ticket.count({ where: { status: 'OPEN' } }),
		prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
		prisma.ticket.count({ where: { status: 'WAITING_FOR_CUSTOMER' } }),
		prisma.ticket.count({
			where: {
				status: 'CLOSED',
				closedAt: { gte: today }
			}
		})
	]);

	return {
		stats: {
			openTickets,
			inProgressTickets,
			waitingTickets,
			closedToday
		}
	};
};

