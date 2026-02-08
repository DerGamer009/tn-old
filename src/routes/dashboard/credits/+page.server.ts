import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Lade User mit Credits
	const userWithCredits = await prisma.user.findUnique({
		where: { id: user.id }
	});

	return {
		credits: ((userWithCredits as any)?.credits as number) || 0.00
	};
};

export const actions = {
	topUp: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const data = await request.formData();
		const amountStr = data.get('amount') as string;
		const paymentMethod = data.get('paymentMethod') as string || 'paypal';

		if (!amountStr) {
			return fail(400, { error: 'Bitte gib einen Betrag ein' });
		}

		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Ungültiger Betrag. Bitte gib einen gültigen Betrag ein.' });
		}

		if (amount < 5) {
			return fail(400, { error: 'Mindestbetrag ist 5€' });
		}

		try {
			// Hier würde normalerweise die Payment-Integration stattfinden
			// Für jetzt simulieren wir eine erfolgreiche Zahlung und fügen die Credits direkt hinzu
			
			// Aktuelles Guthaben abrufen
			const user = await prisma.user.findUnique({
				where: { id: locals.user.id }
			});

			if (!user) {
				return fail(404, { error: 'User nicht gefunden' });
			}

			// Credits hinzufügen (simuliert - in Produktion sollte das erst nach erfolgreicher Zahlung passieren)
			const currentCredits = (user as any).credits || 0;
			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					credits: currentCredits + amount
				} as any
			});

			// Erstelle Order für die Credits-Aufladung
			const order = await prisma.order.create({
				data: {
					orderNumber: `credit-${Date.now()}-${locals.user.id}`,
					status: 'COMPLETED',
					total: amount,
					paymentMethod: 'CREDITS',
					paymentStatus: 'PAID',
					userId: locals.user.id
				} as any
			});

			// Erstelle Rechnung für Guthaben-Aufladung
			const { createInvoiceForCredits } = await import('$lib/server/invoice-helper');
			await createInvoiceForCredits(locals.user.id, amount, order.id);

			return { 
				success: true, 
				message: `${amount.toFixed(2)}€ erfolgreich aufgeladen! Das Guthaben wurde deinem Account hinzugefügt.` 
			};
		} catch (error) {
			console.error('Error topping up credits:', error);
			return fail(500, { error: 'Fehler beim Aufladen. Bitte versuche es später erneut.' });
		}
	}
} satisfies Actions;

