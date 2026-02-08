import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const application = await prisma.careerApplication.findFirst({
		where: {
			id: params.id,
			userId: user.id
		}
	});

	if (!application) {
		throw error(404, 'Bewerbung nicht gefunden');
	}

	return { application };
};
