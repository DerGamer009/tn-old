import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { generateSupportPin } from '$lib/server/roles';
import { TEAM_STRUCTURE } from '$lib/constants/team-structure';
import type { UserRole } from '@prisma/client';
import { fail } from '@sveltejs/kit';

/** Prisma-Rolle pro Team-Kategorie (für Berechtigungen bei Team-Position) */
const CATEGORY_TO_ROLE: Record<string, UserRole> = {
	leadership: 'FOUNDER',
	technical: 'TECHNICIAN',
	support: 'SUPPORT_TEAM',
	'sales-marketing': 'SALES_TEAM',
	'admin-org': 'MANAGEMENT'
};

function getRoleForPosition(positionId: string): UserRole {
	for (const cat of TEAM_STRUCTURE) {
		if (cat.roles.some((r) => r.id === positionId)) {
			return CATEGORY_TO_ROLE[cat.id] ?? 'MANAGEMENT';
		}
	}
	return 'MANAGEMENT';
}

export const load: PageServerLoad = async () => {
	const users = await prisma.user.findMany({
		include: {
			_count: {
				select: {
					servers: true,
					tickets: true,
					invoices: true
				}
			},
			servers: {
				select: {
					id: true,
					status: true
				}
			},
			invoices: {
				select: {
					id: true,
					status: true,
					amount: true
				}
			},
			tickets: {
				select: {
					id: true,
					status: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	return { users };
};

export const actions = {
	updateRole: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		const value = data.get('role') as string; // "role:USER" oder "position:cto"

		if (!userId || !value) {
			return fail(400, { error: 'Fehlende Daten' });
		}

		try {
			const isPosition = value.startsWith('position:');
			const isRole = value.startsWith('role:');
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) return fail(404, { error: 'User nicht gefunden' });

			const updates: { role: UserRole; position?: string | null; supportPin?: string } = {
				role: user.role,
				position: null
			};

			if (isRole) {
				const role = value.slice(5) as UserRole;
				updates.role = role;
				updates.position = null;
				if (role !== 'USER' && !user.supportPin) {
					updates.supportPin = generateSupportPin();
				}
			} else if (isPosition) {
				const positionId = value.slice(9);
				updates.position = positionId;
				updates.role = getRoleForPosition(positionId);
				if (!user.supportPin) {
					updates.supportPin = generateSupportPin();
				}
			} else {
				return fail(400, { error: 'Ungültiger Wert' });
			}

			await prisma.user.update({
				where: { id: userId },
				data: updates as any
			});

			return { success: true };
		} catch (error) {
			console.error('Error updating role:', error);
			return fail(500, { error: 'Fehler beim Aktualisieren' });
		}
	},

	regeneratePin: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'Fehlende Daten' });
		}

		try {
			let newPin = generateSupportPin();
			// Kollisionen vermeiden
			for (let i = 0; i < 5; i++) {
				const existing = await prisma.user.findUnique({ where: { supportPin: newPin } });
				if (!existing) break;
				newPin = generateSupportPin();
			}

			await prisma.user.update({
				where: { id: userId },
				data: {
					supportPin: newPin
				}
			});

			return { success: true };
		} catch (error) {
			console.error('Error regenerating support pin:', error);
			return fail(500, { error: 'Fehler beim Generieren des Pins' });
		}
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		const isActive = data.get('isActive') === 'true';

		try {
			await prisma.user.update({
				where: { id: userId },
				data: { isActive }
			});

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Fehler' });
		}
	},

	addCredits: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		const amountStr = data.get('amount') as string;
		const reason = data.get('reason') as string || 'Admin Gutschrift';

		if (!userId || !amountStr) {
			return fail(400, { error: 'Fehlende Daten', userId });
		}

		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Ungültiger Betrag', userId });
		}

		try {
			// Aktuelles Guthaben abrufen
			const user = await prisma.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				return fail(404, { error: 'User nicht gefunden', userId });
			}

			// Credits hinzufügen (Type-Assertion, da Prisma Client noch nicht regeneriert wurde)
			const currentCredits = (user as any).credits || 0;
			await prisma.user.update({
				where: { id: userId },
				data: {
					credits: currentCredits + amount
				} as any
			});

			return { success: true, message: `${amount.toFixed(2)}€ erfolgreich hinzugefügt`, userId };
		} catch (error) {
			console.error('Error adding credits:', error);
			return fail(500, { error: 'Fehler beim Hinzufügen der Credits', userId });
		}
	}
} satisfies Actions;

