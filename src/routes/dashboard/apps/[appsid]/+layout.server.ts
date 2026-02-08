import type { LayoutServerLoad } from './$types';
export type { LayoutServerLoad };
import { getUserAppHostingServers } from '$lib/server/app-hosting';
import { redirect, error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const servers = await getUserAppHostingServers(locals.user.id);
	
	// Finde den Server anhand der ID
	const server = servers.find((s) => s.id === params.appsid);

	if (!server) {
		throw error(404, 'App nicht gefunden');
	}

	return {
		server
	};
};

