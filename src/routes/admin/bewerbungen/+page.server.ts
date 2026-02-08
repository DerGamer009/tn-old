import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const applications = await prisma.careerApplication.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			}
		}
	});

	return { applications };
};
