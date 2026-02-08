import type { Actions, PageServerLoad } from './$types';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '$lib/server/announcements';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const announcements = await getAnnouncements();
	return { announcements };
};

export const actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const title = data.get('title') as string;
		const content = data.get('content') as string;
		const type = (data.get('type') as string)?.toUpperCase() as 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

		if (!title || !content || !type) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		const createdById = locals.user?.id ?? null;

		try {
			await createAnnouncement(title, content, type, createdById);
			return { success: true };
		} catch (error) {
			console.error('Error creating announcement:', error);
			return fail(500, { error: 'Fehler beim Erstellen' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID fehlt' });
		}

		try {
			await deleteAnnouncement(id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting announcement:', error);
			return fail(500, { error: 'Fehler beim Löschen' });
		}
	}
} satisfies Actions;

