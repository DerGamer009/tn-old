import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// Lade oder erstelle Checkout-Einstellungen
	let settings = await prisma.checkoutSettings.findFirst();
	
	if (!settings) {
		// Erstelle Standard-Einstellungen
		settings = await prisma.checkoutSettings.create({
			data: {
				enabled: true,
				buyerApproved: false,
				orderApproved: false,
				orderCompleted: true,
				orderDeclined: false,
				orderSaved: false,
				orderVoided: false
			}
		});
	}

	return {
		settings
	};
};

export const actions = {
	updateSettings: async ({ request }) => {
		const data = await request.formData();
		
		const enabled = data.get('enabled') === 'true';
		const buyerApproved = data.get('buyerApproved') === 'true';
		const orderApproved = data.get('orderApproved') === 'true';
		const orderCompleted = data.get('orderCompleted') === 'true';
		const orderDeclined = data.get('orderDeclined') === 'true';
		const orderSaved = data.get('orderSaved') === 'true';
		const orderVoided = data.get('orderVoided') === 'true';

		try {
			// Lade oder erstelle Einstellungen
			let settings = await prisma.checkoutSettings.findFirst();
			
			if (!settings) {
				settings = await prisma.checkoutSettings.create({
					data: {
						enabled,
						buyerApproved,
						orderApproved,
						orderCompleted,
						orderDeclined,
						orderSaved,
						orderVoided
					}
				});
			} else {
				settings = await prisma.checkoutSettings.update({
					where: { id: settings.id },
					data: {
						enabled,
						buyerApproved,
						orderApproved,
						orderCompleted,
						orderDeclined,
						orderSaved,
						orderVoided
					}
				});
			}

			return {
				success: true,
				message: 'Checkout-Einstellungen erfolgreich gespeichert'
			};
		} catch (error) {
			console.error('Error updating checkout settings:', error);
			return fail(500, { error: 'Fehler beim Speichern der Einstellungen' });
		}
	}
} satisfies Actions;

