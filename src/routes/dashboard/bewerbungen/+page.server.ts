import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const applications = await prisma.careerApplication.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' }
	});

	return { applications };
};
