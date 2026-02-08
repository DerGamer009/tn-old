import type { PageServerLoad } from './$types';
import { getRecentActivity } from '$lib/server/activity';
import { getAnnouncements } from '$lib/server/announcements';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Lade alle Daten parallel
	const [
		recentActivity,
		announcements,
		servicesCount,
		userServers,
		pendingInvoices,
		pendingInvoicesSum,
		ticketsOpened,
		userWithCredits
	] = await Promise.all([
		getRecentActivity(user.id, 5),
		getAnnouncements(5),
		// Services: Anzahl aller Server des Users
		prisma.server.count({ where: { userId: user.id } }),
		// Services: Liste der Server (für Anzeige)
		prisma.server.findMany({
			where: { userId: user.id },
			select: {
				id: true,
				name: true,
				type: true,
				status: true,
				ipAddress: true,
				createdAt: true
			},
			orderBy: { createdAt: 'desc' },
			take: 5 // Nur die letzten 5 für die Dashboard-Übersicht
		}),
		// Pending Invoices: Anzahl der unbezahlten Rechnungen
		prisma.invoice.count({ 
			where: { 
				userId: user.id, 
				status: 'UNPAID' 
			} 
		}),
		// Pending Invoices: Summe der unbezahlten Rechnungen
		prisma.invoice.aggregate({
			where: { 
				userId: user.id, 
				status: 'UNPAID' 
			},
			_sum: { amount: true }
		}),
		// Tickets Opened: Anzahl der offenen Tickets (nicht geschlossen)
		prisma.ticket.count({ 
			where: { 
				userId: user.id, 
				status: { not: 'CLOSED' } 
			} 
		}),
		// User mit Credits aus der DB laden
		prisma.user.findUnique({
			where: { id: user.id }
		})
	]);

	return {
		recentActivity,
		announcements,
		servers: userServers,
		stats: {
			credits: ((userWithCredits as any)?.credits as number) || 0.00,
			services: servicesCount,
			pendingInvoices: pendingInvoices,
			pendingInvoicesAmount: pendingInvoicesSum._sum.amount || 0,
			ticketsOpened: ticketsOpened
		}
	};
};
