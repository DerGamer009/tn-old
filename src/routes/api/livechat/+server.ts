import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const { sessionToken, pageContext } = body as {
			sessionToken?: string;
			pageContext?: string;
		};

		if (!sessionToken) {
			return json({ success: false, error: 'sessionToken fehlt' }, { status: 400 });
		}

		const ctx = (pageContext || 'unknown').slice(0, 100);

		// Session nach Token suchen
		let session = await prisma.chatSession.findUnique({
			where: { sessionToken }
		});

		// Falls keine existiert, neu anlegen
		if (!session) {
			session = await prisma.chatSession.create({
				data: {
					sessionToken,
					pageContext: ctx,
					userId: locals.user?.id ?? null
				}
			});
		} else if (!session.userId && locals.user?.id) {
			// Nachträglich User verknüpfen, falls bisher anonym
			await prisma.chatSession.update({
				where: { id: session.id },
				data: { userId: locals.user.id }
			});
		}

		return json({
			success: true,
			session: {
				id: session.id,
				status: session.status,
				pageContext: session.pageContext
			}
		});
	} catch (error) {
		console.error('LiveChat: Fehler bei Session-Init', error);
		return json({ success: false, error: 'Interner Fehler' }, { status: 500 });
	}
};

