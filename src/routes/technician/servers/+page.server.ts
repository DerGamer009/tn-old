import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const servers = await prisma.server.findMany({
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	return { servers };
};
