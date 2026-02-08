import { prisma } from './prisma';
import type { Priority, TicketStatus } from '@prisma/client';

/**
 * Holt alle Tickets eines Users
 */
export async function getUserTickets(userId: string) {
	return prisma.ticket.findMany({
		where: { userId },
		include: {
			messages: {
				orderBy: { createdAt: 'asc' },
				take: 1 // Nur letzte Nachricht für Preview
			},
			server: {
				select: {
					id: true,
					name: true,
					type: true
				}
			},
			_count: {
				select: { messages: true }
			}
		},
		orderBy: { updatedAt: 'desc' }
	});
}

/**
 * Holt ein einzelnes Ticket mit allen Nachrichten
 */
export async function getTicketById(ticketId: string, userId: string) {
	return prisma.ticket.findFirst({
		where: {
			id: ticketId,
			userId // Sicherstellen dass User nur eigene Tickets sehen kann
		},
		include: {
			messages: {
				orderBy: { createdAt: 'asc' }
			},
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			},
			server: {
				select: {
					id: true,
					name: true,
					type: true,
					ipAddress: true
				}
			}
		}
	});
}

/**
 * Erstellt ein neues Ticket
 */
export async function createTicket(data: {
	userId: string;
	subject: string;
	description: string;
	priority: Priority;
	serverId?: string;
}) {
	return prisma.ticket.create({
		data: {
			userId: data.userId,
			subject: data.subject,
			description: data.description,
			priority: data.priority,
			serverId: data.serverId || null,
			status: 'OPEN'
		}
	});
}

/**
 * Holt alle Server eines Users
 */
export async function getUserServers(userId: string) {
	return prisma.server.findMany({
		where: { userId },
		select: {
			id: true,
			name: true,
			type: true,
			status: true,
			ipAddress: true
		},
		orderBy: { createdAt: 'desc' }
	});
}

/**
 * Fügt eine Nachricht zu einem Ticket hinzu
 */
export async function addTicketMessage(data: {
	ticketId: string;
	userId: string;
	message: string;
	isStaff?: boolean;
}) {
	// Prüfe ob User Zugriff auf Ticket hat
	const ticket = await prisma.ticket.findFirst({
		where: {
			id: data.ticketId,
			userId: data.userId
		}
	});

	if (!ticket) {
		throw new Error('Ticket nicht gefunden oder kein Zugriff');
	}

	// Nachricht erstellen
	const ticketMessage = await prisma.ticketMessage.create({
		data: {
			ticketId: data.ticketId,
			message: data.message,
			isStaff: data.isStaff || false
		}
	});

	// Ticket-Status auf WAITING_FOR_CUSTOMER setzen wenn Staff antwortet
	if (data.isStaff) {
		await prisma.ticket.update({
			where: { id: data.ticketId },
			data: { status: 'WAITING_FOR_CUSTOMER' }
		});
	} else {
		// User antwortet -> Status auf IN_PROGRESS
		if (ticket.status === 'WAITING_FOR_CUSTOMER') {
			await prisma.ticket.update({
				where: { id: data.ticketId },
				data: { status: 'IN_PROGRESS' }
			});
		}
	}

	return ticketMessage;
}

/**
 * Ändert den Status eines Tickets
 */
export async function updateTicketStatus(ticketId: string, userId: string, status: TicketStatus) {
	// Prüfe ob User Zugriff auf Ticket hat
	const ticket = await prisma.ticket.findFirst({
		where: {
			id: ticketId,
			userId
		}
	});

	if (!ticket) {
		throw new Error('Ticket nicht gefunden oder kein Zugriff');
	}

	return prisma.ticket.update({
		where: { id: ticketId },
		data: {
			status,
			closedAt: status === 'CLOSED' ? new Date() : null
		}
	});
}

/**
 * Holt Ticket-Statistiken für einen User
 */
export async function getTicketStats(userId: string) {
	const [open, inProgress, waitingForCustomer, closed] = await Promise.all([
		prisma.ticket.count({ where: { userId, status: 'OPEN' } }),
		prisma.ticket.count({ where: { userId, status: 'IN_PROGRESS' } }),
		prisma.ticket.count({ where: { userId, status: 'WAITING_FOR_CUSTOMER' } }),
		prisma.ticket.count({ where: { userId, status: 'CLOSED' } })
	]);

	return {
		open,
		inProgress,
		waitingForCustomer,
		closed,
		total: open + inProgress + waitingForCustomer + closed
	};
}

/**
 * Löscht ein Ticket (nur wenn Status CLOSED)
 */
export async function deleteTicket(ticketId: string, userId: string) {
	const ticket = await prisma.ticket.findFirst({
		where: {
			id: ticketId,
			userId,
			status: 'CLOSED' // Nur geschlossene Tickets können gelöscht werden
		}
	});

	if (!ticket) {
		throw new Error('Ticket nicht gefunden, kein Zugriff oder nicht geschlossen');
	}

	return prisma.ticket.delete({
		where: { id: ticketId }
	});
}

/**
 * Holt ein Ticket für Team-Mitglieder (ohne userId Check)
 */
export async function getTicketByIdForTeam(ticketId: string) {
	return prisma.ticket.findUnique({
		where: { id: ticketId },
		include: {
			messages: {
				orderBy: { createdAt: 'asc' }
			},
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					supportPin: true
				}
			},
			server: {
				select: {
					id: true,
					name: true,
					type: true,
					ipAddress: true
				}
			}
		}
	});
}

/**
 * Fügt eine Nachricht zu einem Ticket hinzu (für Team-Mitglieder)
 */
export async function addTicketMessageForTeam(data: {
	ticketId: string;
	message: string;
}) {
	// Prüfe ob Ticket existiert
	const ticket = await prisma.ticket.findUnique({
		where: { id: data.ticketId }
	});

	if (!ticket) {
		throw new Error('Ticket nicht gefunden');
	}

	// Nachricht erstellen (immer isStaff: true für Team)
	const ticketMessage = await prisma.ticketMessage.create({
		data: {
			ticketId: data.ticketId,
			message: data.message,
			isStaff: true
		}
	});

	// Ticket-Status auf WAITING_FOR_CUSTOMER setzen wenn Staff antwortet
	await prisma.ticket.update({
		where: { id: data.ticketId },
		data: { status: 'WAITING_FOR_CUSTOMER' }
	});

	return ticketMessage;
}

/**
 * Ändert den Status eines Tickets (für Team-Mitglieder)
 */
export async function updateTicketStatusForTeam(ticketId: string, status: TicketStatus) {
	const ticket = await prisma.ticket.findUnique({
		where: { id: ticketId }
	});

	if (!ticket) {
		throw new Error('Ticket nicht gefunden');
	}

	return prisma.ticket.update({
		where: { id: ticketId },
		data: {
			status,
			closedAt: status === 'CLOSED' ? new Date() : null
		}
	});
}

