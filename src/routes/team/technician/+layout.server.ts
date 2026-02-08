import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isTechnician } from '$lib/server/roles';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (!isTechnician(user.role)) {
		throw redirect(302, '/team');
	}

	return {};
};
