import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { generateInvoicePDF } from '$lib/server/invoice-pdf';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Nicht autorisiert');
	}

	const invoice = await prisma.invoice.findUnique({
		where: { id: params.invoicesid },
		include: {
			user: true,
			order: {
				include: {
					servers: true
				}
			}
		}
	});

	if (!invoice) {
		throw error(404, 'Rechnung nicht gefunden');
	}

	// Prüfe ob der User berechtigt ist (eigene Rechnung oder Admin)
	if (invoice.userId !== locals.user.id && locals.user.role !== 'FOUNDER' && locals.user.role !== 'MANAGEMENT') {
		throw error(403, 'Keine Berechtigung');
	}

	try {
		const pdfBuffer = await generateInvoicePDF(invoice as any);

		return new Response(Buffer.from(pdfBuffer), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="Rechnung-${invoice.invoiceNumber}.pdf"`
			}
		});
	} catch (err) {
		console.error('PDF-Generierung Fehler:', err);
		throw error(500, 'Konnte PDF nicht generieren');
	}
};
