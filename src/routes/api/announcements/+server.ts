import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAnnouncement, getAnnouncements } from '$lib/server/announcements';

// GET - Alle Announcements abrufen
export const GET: RequestHandler = async () => {
	try {
		const announcements = await getAnnouncements(50);
		return json(announcements);
	} catch (error) {
		console.error('Fehler beim Abrufen der Announcements:', error);
		return json({ error: 'Fehler beim Abrufen der Announcements' }, { status: 500 });
	}
};

// POST - Neues Announcement erstellen (nur für Admins)
export const POST: RequestHandler = async ({ request, locals }) => {
	// Admin-Check: nur Admins dürfen Announcements erstellen
	if (!locals.user || !["FOUNDER", "MANAGEMENT"].includes(locals.user.role)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		const data = await request.json() as { title: string; content: string; type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' };
		const announcement = await createAnnouncement(data.title, data.content, data.type);
		return json(announcement, { status: 201 });
	} catch (error) {
		console.error('Fehler beim Erstellen des Announcements:', error);
		return json({ error: 'Fehler beim Erstellen des Announcements' }, { status: 500 });
	}
};
