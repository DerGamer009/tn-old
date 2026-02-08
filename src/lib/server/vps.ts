/**
 * VPS Server Management
 * Verwaltet VPS-Server mit Datalix-Integration
 */

import { prisma } from './prisma';
import {
	createDatalixVps,
	getDatalixVps,
	deleteDatalixVps,
	startDatalixVps,
	stopDatalixVps,
	restartDatalixVps,
	updateDatalixVps,
	type CreateVpsRequest,
	DatalixApiError
} from './datalix';
import type { ServerStatus } from '@prisma/client';

/**
 * Extrahiert IP-Adresse aus verschiedenen Formaten (String, Array von Strings, Array von Objekten)
 */
function extractIpAddress(ipv4: any): string | undefined {
	if (!ipv4) return undefined;
	
	// Wenn es bereits ein String ist
	if (typeof ipv4 === 'string') {
		return ipv4;
	}
	
	// Wenn es ein Array ist
	if (Array.isArray(ipv4)) {
		if (ipv4.length === 0) return undefined;
		
		const firstItem = ipv4[0];
		
		// Wenn das erste Element ein Objekt mit 'ip' Property ist
		if (typeof firstItem === 'object' && firstItem !== null && 'ip' in firstItem) {
			return firstItem.ip as string;
		}
		
		// Wenn das erste Element direkt ein String ist
		if (typeof firstItem === 'string') {
			return firstItem;
		}
	}
	
	return undefined;
}

/**
 * Erstellt einen neuen VPS-Server
 */
export async function createVpsServer(data: {
	userId: string;
	name: string;
	cpu: number;
	ram: number; // in GB
	storage: number; // in GB
	bandwidth: number; // in Gbit/s
	priceMonthly: number;
	orderId?: string;
}) {
	try {
		// Erstelle VPS über Datalix API
		const datalixVps = await createDatalixVps({
			name: data.name,
			cpu: data.cpu,
			ram: data.ram * 1024, // Konvertiere GB zu MB für Datalix
			disk: data.storage,
			bandwidth: data.bandwidth,
		});

		// Mappe Datalix Status zu unserem ServerStatus
		const status = mapDatalixStatusToServerStatus(datalixVps.status);

		// Extrahiere IP-Adresse korrekt (kann String oder Array sein)
		const ipAddress = extractIpAddress(datalixVps.ipv4);

		// Erstelle Server-Eintrag in der Datenbank
		// Verwende Datalix VPS-ID als Server-ID
		const server = await prisma.server.create({
			data: {
				id: datalixVps.id, // Verwende Datalix VPS-ID als Server-ID
				name: data.name,
				type: 'VPS',
				status,
				cpu: data.cpu,
				ram: data.ram,
				storage: data.storage,
				bandwidth: data.bandwidth,
				priceMonthly: data.priceMonthly,
				ipAddress: ipAddress || undefined,
				datalixVpsId: datalixVps.id,
				userId: data.userId,
				orderId: data.orderId,
			},
		});

		// Erstelle Rechnung für Server-Kauf, falls Order vorhanden
		if (data.orderId) {
			const { createInvoiceForServerPurchase } = await import('./invoice-helper');
			// Prüfe ob Order bereits bezahlt ist
			const order = await prisma.order.findUnique({
				where: { id: data.orderId }
			});
			const invoiceStatus = order?.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID';
			await createInvoiceForServerPurchase(data.orderId, data.userId, data.priceMonthly, invoiceStatus);
		}

		return server;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Synchronisiert VPS-Status von Datalix mit der Datenbank
 */
export async function syncVpsStatus(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Verwende Server-ID (falls es die Datalix-ID ist) oder datalixVpsId für Rückwärtskompatibilität
	const datalixVpsId = server.datalixVpsId || server.id;

	try {
		const datalixVps = await getDatalixVps(datalixVpsId);
		const status = mapDatalixStatusToServerStatus(datalixVps.status);

		// Extrahiere IP-Adresse korrekt (kann String oder Array sein)
		const ipAddress = extractIpAddress(datalixVps.ipv4) || server.ipAddress;

		// Aktualisiere Server in der Datenbank
		const updated = await prisma.server.update({
			where: { id: serverId },
			data: {
				status,
				ipAddress,
			},
		});

		return updated;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen VPS
 */
export async function startVps(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Verwende Server-ID (falls es die Datalix-ID ist) oder datalixVpsId für Rückwärtskompatibilität
	const datalixVpsId = server.datalixVpsId || server.id;

	try {
		await startDatalixVps(datalixVpsId);
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Stoppt einen VPS
 */
export async function stopVps(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Verwende Server-ID (falls es die Datalix-ID ist) oder datalixVpsId für Rückwärtskompatibilität
	const datalixVpsId = server.datalixVpsId || server.id;

	try {
		await stopDatalixVps(datalixVpsId);
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'SUSPENDED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen VPS neu
 */
export async function restartVps(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Verwende Server-ID (falls es die Datalix-ID ist) oder datalixVpsId für Rückwärtskompatibilität
	const datalixVpsId = server.datalixVpsId || server.id;

	try {
		await restartDatalixVps(datalixVpsId);
		
		// Status bleibt ACTIVE nach Neustart
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Löscht einen VPS
 */
export async function deleteVps(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Verwende Server-ID (falls es die Datalix-ID ist) oder datalixVpsId für Rückwärtskompatibilität
	const datalixVpsId = server.datalixVpsId || server.id;

	try {
		// Lösche VPS bei Datalix
		await deleteDatalixVps(datalixVpsId);
		
		// Markiere Server als gelöscht in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'CANCELLED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw new Error(`Datalix API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Mappt Datalix Status zu unserem ServerStatus
 */
function mapDatalixStatusToServerStatus(
	datalixStatus: 'running' | 'stopped' | 'suspended' | 'pending'
): ServerStatus {
	switch (datalixStatus) {
		case 'running':
			return 'ACTIVE';
		case 'stopped':
		case 'suspended':
			return 'SUSPENDED';
		case 'pending':
			return 'PENDING';
		default:
			return 'PENDING';
	}
}

/**
 * Verlängert einen VPS-Server
 * @param serverId - ID des Servers
 * @param months - Anzahl der Monate (Standard: 1)
 * @param useCredits - Ob Credits verwendet werden sollen (Standard: true)
 * @returns Aktualisierter Server
 */
export async function extendVpsServer(serverId: string, months: number = 1, useCredits: boolean = true) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
		include: {
			user: {
				select: {
					id: true,
					credits: true
				}
			}
		}
	});

	if (!server || server.type !== 'VPS') {
		throw new Error('Server nicht gefunden oder kein VPS');
	}

	// Berechne Preis (priceMonthly ist in Cent)
	const priceInCents = server.priceMonthly;
	const priceInEuros = priceInCents / 100;
	const totalPrice = priceInEuros * months;

	// Prüfe ob User genug Credits hat
	if (useCredits) {
		const userCredits = ((server.user as any).credits as number) || 0;
		if (userCredits < totalPrice) {
			throw new Error(`Nicht genügend Credits. Benötigt: €${totalPrice.toFixed(2)}, Verfügbar: €${userCredits.toFixed(2)}`);
		}
	}

	// Berechne neue expiresAt
	const currentExpiresAt = server.expiresAt || new Date();
	const newExpiresAt = new Date(currentExpiresAt);
	newExpiresAt.setMonth(newExpiresAt.getMonth() + months);

	try {
		// Beginne Transaktion
		await prisma.$transaction(async (tx) => {
			// Aktualisiere Server expiresAt
			await tx.server.update({
				where: { id: serverId },
				data: {
					expiresAt: newExpiresAt,
					status: server.status === 'EXPIRED' ? 'ACTIVE' : server.status
				}
			});

			// Ziehe Credits ab (falls useCredits = true)
			if (useCredits) {
				await tx.user.update({
					where: { id: server.userId },
					data: {
						credits: { decrement: totalPrice }
					} as any
				});
			}

			// Erstelle Order für die Verlängerung
			const orderId = `extend-${serverId}-${Date.now()}`;
			await tx.order.create({
				data: {
					id: orderId,
					orderNumber: orderId,
					status: 'COMPLETED',
					total: totalPrice,
					paymentMethod: useCredits ? 'CREDITS' : 'ADMIN',
					paymentStatus: 'PAID',
					userId: server.userId,
					servers: {
						connect: { id: serverId }
					}
				} as any
			});

			// Erstelle Invoice mit Helper-Funktion (innerhalb der Transaktion)
			const { createInvoiceForOrder } = await import('./invoice-helper');
			await createInvoiceForOrder(
				orderId,
				server.userId,
				totalPrice,
				'PAID',
				new Date(), // Fälligkeitsdatum = heute, da bereits bezahlt
				tx // Transaktions-Client übergeben
			);
		});

		// Optional: Versuche Datalix API zu aktualisieren (falls verfügbar)
		// Hinweis: Die Datalix API hat möglicherweise keinen direkten Verlängerungs-Endpunkt
		// In diesem Fall wird nur die Datenbank aktualisiert
		const datalixVpsId = server.datalixVpsId || server.id;
		try {
			// Versuche Service-Details zu aktualisieren
			// Dies ist optional und kann fehlschlagen, ohne die Verlängerung zu beeinträchtigen
			await syncVpsStatus(serverId);
		} catch (error) {
			// Ignoriere Fehler bei Datalix-Synchronisation
			// Die Verlängerung wurde bereits in der DB durchgeführt
			console.warn('Warnung: Datalix-Synchronisation nach Verlängerung fehlgeschlagen:', error);
		}

		// Lade aktualisierten Server
		const updatedServer = await prisma.server.findUnique({
			where: { id: serverId },
			include: {
				user: {
					select: {
						id: true,
						credits: true
					}
				}
			}
		});

		return updatedServer;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(`Fehler bei der Verlängerung: ${String(error)}`);
	}
}

/**
 * Ruft alle VPS eines Benutzers ab
 */
export async function getUserVpsServers(userId: string) {
	return await prisma.server.findMany({
		where: {
			userId,
			type: 'VPS',
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
}

