import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { user } = await parent();

	const invoice = await prisma.invoice.findUnique({
		where: { id: params.invoicesid },
		include: {
			user: true,
			order: {
				include: {
					servers: {
						select: {
							id: true,
							name: true,
							type: true,
							cpu: true,
							ram: true,
							storage: true,
							priceMonthly: true,
							createdAt: true
						}
					}
				}
			}
		}
	});

	if (!invoice) {
		throw error(404, 'Rechnung nicht gefunden');
	}

	// Prüfe ob der User berechtigt ist
	if (invoice.userId !== user.id) {
		throw error(403, 'Keine Berechtigung');
	}

	return {
		invoice
	};
};
