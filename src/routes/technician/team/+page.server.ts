import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEAM_STRUCTURE } from '$lib/constants/team-structure';

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
	const technicalCategory = TEAM_STRUCTURE.find((c) => c.id === 'technical');
	if (!technicalCategory) {
		return { technicalRoles: [], technicians: [], stats: null };
	}

	const technicians = await prisma.user.findMany({
		where: {
			isActive: true,
			OR: [
				{ role: 'TECHNICIAN' },
				{ position: { in: TECHNICAL_ROLE_IDS } }
			]
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			position: true,
			image: true
		},
		orderBy: [{ position: 'asc' }, { firstName: 'asc' }]
	});

	const [serverCount, nodeCount, activeServers] = await Promise.all([
		prisma.server.count(),
		prisma.node.count({ where: { isActive: true } }),
		prisma.server.count({ where: { status: 'ACTIVE' } })
	]);

	return {
		technicalRoles: technicalCategory.roles,
		technicians,
		stats: {
			techniciansTotal: technicians.length,
			serversTotal: serverCount,
			nodesTotal: nodeCount,
			serversActive: activeServers
		}
	};
};
