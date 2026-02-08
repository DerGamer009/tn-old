import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

const TECHNICAL_ROLE_IDS = [
	'head-of-infrastructure',
	'senior-technician',
	'junior-technician',
	'system-administrator',
	'network-administrator',
	'security-engineer',
	'devops-engineer',
	'monitoring-team',
	'backup-recovery-team'
];

export const load: PageServerLoad = async () => {
	const [
		techniciansCount,
		serversTotal,
		serversActive,
		nodesTotal,
		openTickets,
		urgentTickets
	] = await Promise.all([
		prisma.user.count({
			where: {
				isActive: true,
				OR: [
					{ role: 'TECHNICIAN' },
					{ position: { in: TECHNICAL_ROLE_IDS } }
				]
			}
		}),
		prisma.server.count(),
		prisma.server.count({ where: { status: 'ACTIVE' } }),
		prisma.node.count({ where: { isActive: true } }),
		prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
		prisma.ticket.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } })
	]);

	return {
		stats: {
			techniciansCount,
			serversTotal,
			serversActive,
			nodesTotal,
			openTickets,
			urgentTickets
		}
	};
};
