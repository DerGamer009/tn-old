import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

/**
 * Generiert eine eindeutige Rechnungsnummer
 */
function generateInvoiceNumber(): string {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
	return `INV-${timestamp}-${random}`;
}

/**
 * Erstellt eine Rechnung für eine Order
 * @param orderId - ID der Order
 * @param userId - ID des Users
 * @param amount - Betrag der Rechnung
 * @param status - Status der Rechnung (Standard: UNPAID)
 * @param dueDate - Fälligkeitsdatum (Standard: 14 Tage ab jetzt)
 * @param tx - Optional: Prisma Transaktions-Client (für Transaktionen)
 * @returns Erstellte Invoice
 */
export async function createInvoiceForOrder(
	orderId: string,
	userId: string,
	amount: number,
	status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' = 'UNPAID',
	dueDate?: Date,
	tx?: Omit<Prisma.TransactionClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
): Promise<any> {
	const client = tx || prisma;

	// Prüfe ob bereits eine Rechnung für diese Order existiert
	const existingInvoice = await client.invoice.findFirst({
		where: { orderId }
	});

	if (existingInvoice) {
		return existingInvoice;
	}

	// Setze Fälligkeitsdatum (Standard: 14 Tage ab jetzt)
	const invoiceDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

	// Erstelle Rechnung
	const invoice = await client.invoice.create({
		data: {
			invoiceNumber: generateInvoiceNumber(),
			amount,
			status,
			dueDate: invoiceDueDate,
			paidAt: status === 'PAID' ? new Date() : null,
			userId,
			orderId
		} as any
	});

	return invoice;
}

/**
 * Erstellt eine Rechnung für Guthaben-Aufladung
 * @param userId - ID des Users
 * @param amount - Betrag der Aufladung
 * @param orderId - Optional: ID der Order (falls vorhanden)
 * @returns Erstellte Invoice
 */
export async function createInvoiceForCredits(
	userId: string,
	amount: number,
	orderId?: string
): Promise<any> {
	// Wenn keine Order-ID vorhanden, erstelle eine Order für die Credits-Aufladung
	let finalOrderId = orderId;
	
	if (!finalOrderId) {
		const order = await prisma.order.create({
			data: {
				orderNumber: `credit-${Date.now()}-${userId}`,
				status: 'COMPLETED',
				total: amount,
				paymentMethod: 'CREDITS',
				paymentStatus: 'PAID',
				userId
			} as any
		});
		finalOrderId = order.id;
	}

	// Erstelle Rechnung (als bezahlt markiert, da bereits bezahlt wurde)
	return await createInvoiceForOrder(
		finalOrderId,
		userId,
		amount,
		'PAID',
		new Date() // Fälligkeitsdatum = heute, da bereits bezahlt
	);
}

/**
 * Erstellt eine Rechnung für Server-Kauf
 * @param orderId - ID der Order
 * @param userId - ID des Users
 * @param amount - Betrag
 * @param status - Status (Standard: PAID wenn mit Credits bezahlt, sonst UNPAID)
 * @param tx - Optional: Prisma Transaktions-Client (für Transaktionen)
 * @returns Erstellte Invoice
 */
export async function createInvoiceForServerPurchase(
	orderId: string,
	userId: string,
	amount: number,
	status: 'UNPAID' | 'PAID' = 'PAID',
	tx?: Omit<Prisma.TransactionClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
): Promise<any> {
	return await createInvoiceForOrder(
		orderId,
		userId,
		amount,
		status,
		status === 'PAID' ? new Date() : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
		tx
	);
}
