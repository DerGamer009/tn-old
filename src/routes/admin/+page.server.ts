import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	// Lade Admin-Dashboard Statistiken
	const [
		openTickets,
		urgentTickets,
		totalUsers,
		newUsersToday,
		openInvoices,
		openInvoicesData,
		activeServers,
		totalServers
	] = await Promise.all([
		prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
		prisma.ticket.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } }),
		prisma.user.count(),
		prisma.user.count({
			where: {
				createdAt: {
					gte: new Date(new Date().setHours(0, 0, 0, 0))
				}
			}
		}),
		prisma.invoice.count({ where: { status: 'UNPAID' } }),
		prisma.invoice.aggregate({
			where: { status: 'UNPAID' },
			_sum: { amount: true }
		}),
		prisma.server.count({ where: { status: 'ACTIVE' } }),
		prisma.server.count()
	]);

	return {
		stats: {
			openTickets,
			urgentTickets,
			totalUsers,
			newUsersToday,
			openInvoices,
			openInvoicesAmount: openInvoicesData._sum.amount || 0,
			activeServers,
			totalServers
		}
	};
};

