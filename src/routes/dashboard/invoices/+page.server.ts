import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Lade alle Rechnungen des Users
	const invoices = await prisma.invoice.findMany({
		where: { userId: user.id },
		include: {
			order: {
				include: {
					servers: {
						select: {
							id: true,
							name: true,
							type: true
						}
					}
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// Berechne Statistiken
	const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID');
	const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
	const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');

	const unpaidSum = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
	const paidSum = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
	const overdueSum = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

	return {
		invoices,
		stats: {
			unpaid: {
				count: unpaidInvoices.length,
				sum: unpaidSum
			},
			paid: {
				count: paidInvoices.length,
				sum: paidSum
			},
			overdue: {
				count: overdueInvoices.length,
				sum: overdueSum
			}
		}
	};
};

