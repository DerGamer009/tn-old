/**
 * App Hosting Management
 * Verwaltet App Hosting Server mit Pterodactyl-Integration
 */

import { prisma } from './prisma';
import {
	createOrFindPterodactylUser,
	createPterodactylServer,
	getPterodactylServerFromAdmin,
	getServerIdentifierFromId,
	deletePterodactylServer,
	sendServerPowerAction,
	type PterodactylServer,
	PterodactylApiError
} from './pterodactyl';
import type { ServerStatus } from '@prisma/client';

const PTERODACTYL_LOCATION_ID = parseInt(process.env.PTERODACTYL_LOCATION_ID || '2', 10);
const PTERODACTYL_NEST_ID = parseInt(process.env.PTERODACTYL_NEST_ID || '8', 10);
const PTERODACTYL_SERVICE_USER_ID = process.env.PTERODACTYL_SERVICE_USER_ID
	? parseInt(process.env.PTERODACTYL_SERVICE_USER_ID, 10)
	: undefined;

// Egg IDs Mapping
export const EGG_IDS = {
	NODE_JS: 32,
	PYTHON: 34,
	UPTIME_KUMA: 39,
	JAVA: 27,
	GRAFANA: 28,
	MARIADB: 29,
	MONGODB_7: 30,
	MONGODB_8: 31,
	POSTGRES_17: 33,
	REDIS_6: 35,
	REDIS_7: 36,
	SFTP_STORAGE: 37,
	SINUSBOT: 38,
	CODE_SERVER: 26
} as const;

/**
 * Erstellt einen neuen App Hosting Server
 */
export async function createAppHostingServer(data: {
	userId: string;
	name: string;
	cpu: number; // vCores (wird zu Prozent konvertiert: 1 Core = 100%)
	ram: number; // in GB (wird zu MB konvertiert)
	storage: number; // in GB (wird zu MB konvertiert)
	priceMonthly: number;
	eggId: number; // Pterodactyl Egg ID (15=Node.JS, 16=Python, 19=Uptime Kuma, 20=Java)
	environment?: Record<string, string>;
	startup?: string;
	orderId?: string;
}) {
	try {
		// Hole User aus DB
		const user = await prisma.user.findUnique({
			where: { id: data.userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true
			}
		});

		// Hole Pterodactyl User ID separat (falls vorhanden)
		const userWithPterodactyl = await prisma.user.findUnique({
			where: { id: data.userId }
		}) as any;

		if (!user) {
			throw new Error('User nicht gefunden');
		}

		// Erstelle oder finde Pterodactyl User
		const pterodactylUserId = userWithPterodactyl?.pterodactylUserId;
		let pterodactylUser;
		
		if (pterodactylUserId) {
			// User existiert bereits in Pterodactyl
			const { getPterodactylUser } = await import('./pterodactyl');
			try {
				pterodactylUser = await getPterodactylUser(pterodactylUserId);
			} catch (error) {
				// User existiert nicht mehr in Pterodactyl, erstelle neuen
				pterodactylUser = await createOrFindPterodactylUser(
					user.email,
					user.firstName,
					user.lastName,
					user.id
				);
			}
		} else {
			// Erstelle neuen Pterodactyl User
			pterodactylUser = await createOrFindPterodactylUser(
				user.email,
				user.firstName,
				user.lastName,
				user.id
			);
		}

		// Aktualisiere User in DB mit Pterodactyl User ID (nur wenn kein Service-User-Modus)
		const useExternalId = PTERODACTYL_SERVICE_USER_ID != null;
		if (!useExternalId && (!pterodactylUserId || pterodactylUserId !== pterodactylUser.id.toString())) {
			await prisma.user.update({
				where: { id: data.userId },
				data: {
					pterodactylUserId: pterodactylUser.id.toString()
				} as any
			});
		}

		// Bei Service-User-Modus: Server gehört einem gemeinsamen Pterodactyl-User → Power/Upload für alle
		const ownerId = PTERODACTYL_SERVICE_USER_ID ?? pterodactylUser.id;

		// Erstelle Server in Pterodactyl
		const pterodactylServer = await createPterodactylServer({
			name: data.name,
			userId: ownerId,
			locationId: PTERODACTYL_LOCATION_ID,
			nestId: PTERODACTYL_NEST_ID,
			eggId: data.eggId,
			limits: {
				memory: data.ram * 1024, // GB zu MB
				swap: 0,
				disk: data.storage * 1024, // GB zu MB
				cpu: data.cpu * 100, // vCores zu Prozent (1 Core = 100%)
			},
			environment: data.environment,
			startup: data.startup,
			nodeId: undefined, // Wird automatisch gefunden
			externalId: useExternalId ? data.userId : undefined,
		});

		// Hole Server-Details für IP-Adresse und Port (Admin API)
		const serverDetails = await getPterodactylServerFromAdmin(pterodactylServer.id);

		// Extrahiere IP-Adresse und Port aus Allocations
		let ipAddress: string | undefined;
		let port: number | undefined;

		try {
			// Hole Allocations für den Server über Admin API
			const pterodactylBase = process.env.PTERODACTYL_API_BASE || 'https://cp.craftingstudiopro.de';
			const adminApiUrl = `${pterodactylBase}/api/application`;
			const allocationsResponse = await fetch(
				`${adminApiUrl}/servers/${pterodactylServer.id}/allocations`,
				{
					headers: {
						'Authorization': `Bearer ${process.env.PTERODACTYL_ADMIN_KEY || ''}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
				}
			);

			if (allocationsResponse.ok) {
				const allocationsData = await allocationsResponse.json();
				const allocations = allocationsData.data || [];
				if (allocations.length > 0) {
					const primaryAllocation = allocations.find((alloc: any) => alloc.attributes?.is_default) || allocations[0];
					if (primaryAllocation) {
						const attrs = primaryAllocation.attributes || primaryAllocation;
						ipAddress = attrs.ip;
						port = attrs.port;
					}
				}
			}
		} catch (error) {
			console.warn('Konnte Allocations nicht abrufen:', error);
		}

		// Mappe Pterodactyl Status zu unserem ServerStatus (Admin API: nur suspended-Flag)
		const status = mapPterodactylStatusFromAdmin(
			serverDetails.suspended
		);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);

		// Erstelle Server-Eintrag in der Datenbank
		const server = await prisma.server.create({
			data: {
				name: data.name,
				type: 'APP_HOSTING',
				status,
				cpu: data.cpu,
				ram: data.ram,
				storage: data.storage,
				bandwidth: 1, // Standard für App Hosting
				priceMonthly: data.priceMonthly,
				ipAddress: ipAddress || undefined,
				port: port || undefined,
				pterodactylServerId: pterodactylServer.id.toString(),
				eggId: data.eggId,
				userId: data.userId,
				orderId: data.orderId,
				expiresAt,
			} as any,
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
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Synchronisiert App Hosting Server Status von Pterodactyl mit der Datenbank
 */
export async function syncAppHostingStatus(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'APP_HOSTING') {
		throw new Error('Server nicht gefunden oder kein App Hosting');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Verwende Admin API für Status-Sync (nur ACTIVE/SUSPENDED basierend auf suspended)
		const pterodactylServer = await getPterodactylServerFromAdmin(pterodactylServerId);
		const status = mapPterodactylStatusFromAdmin(
			pterodactylServer.suspended
		);

		// Aktualisiere Server in der Datenbank
		const updated = await prisma.server.update({
			where: { id: serverId },
			data: {
				status,
			},
		});

		return updated;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen App Hosting Server
 */
export async function startAppHosting(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'APP_HOSTING') {
		throw new Error('Server nicht gefunden oder kein App Hosting');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'start');
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Stoppt einen App Hosting Server
 */
export async function stopAppHosting(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'APP_HOSTING') {
		throw new Error('Server nicht gefunden oder kein App Hosting');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'stop');
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'SUSPENDED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen App Hosting Server neu
 */
export async function restartAppHosting(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'APP_HOSTING') {
		throw new Error('Server nicht gefunden oder kein App Hosting');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'restart');
		
		// Status bleibt ACTIVE nach Neustart
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Löscht einen App Hosting Server
 */
export async function deleteAppHosting(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'APP_HOSTING') {
		throw new Error('Server nicht gefunden oder kein App Hosting');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Lösche Server bei Pterodactyl
		await deletePterodactylServer(pterodactylServerId);
		
		// Markiere Server als gelöscht in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'CANCELLED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Mappt Pterodactyl Status von Admin API zu unserem ServerStatus
 * Admin API gibt nur suspended-Flag zurück -> ACTIVE oder SUSPENDED
 */
function mapPterodactylStatusFromAdmin(suspended: boolean): ServerStatus {
	return suspended ? 'SUSPENDED' : 'ACTIVE';
}

/**
 * Mappt Pterodactyl Status von User API zu unserem ServerStatus
 * User API gibt detaillierte Status zurück (running, stopped, starting, etc.)
 */
function mapPterodactylStatusFromUser(
	pterodactylStatus: string | null,
	suspended: boolean
): ServerStatus {
	if (suspended) {
		return 'SUSPENDED';
	}

	if (!pterodactylStatus) {
		return 'PENDING';
	}

	const statusLower = pterodactylStatus.toLowerCase();
	
	switch (statusLower) {
		case 'running':
		case 'on':
		case 'started':
			return 'ACTIVE';
		case 'stopped':
		case 'off':
			return 'SUSPENDED';
		case 'starting':
			// Wenn Server gerade startet, aber nicht suspended, behandle als ACTIVE
			// (Server ist funktionsfähig, auch wenn er noch startet)
			return 'ACTIVE';
		case 'stopping':
		case 'restarting':
		case 'installing':
		case 'install_failed':
			return 'PENDING';
		default:
			return 'PENDING';
	}
}

/**
 * Ruft alle App Hosting Server eines Benutzers ab
 */
export async function getUserAppHostingServers(userId: string) {
	return await prisma.server.findMany({
		where: {
			userId,
			type: 'APP_HOSTING',
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
}

/**
 * Synchronisiert Pterodactyl Server in die Datenbank
 */
export async function syncPterodactylServersToDatabase(
	userId: string,
	pterodactylServers: Array<{
		id: number | string;
		identifier?: string;
		name: string;
		egg?: number | { id: number };
		limits?: {
			memory: number; // in MB
			swap: number; // in MB
			disk: number; // in MB
			cpu: number; // in Prozent
		};
		status?: string | null;
		suspended?: boolean;
		allocation?: number | any;
		node?: number;
		user?: number;
		relationships?: {
			allocations?: {
				data?: Array<{
					attributes?: {
						ip?: string;
						ip_alias?: string;
						port?: number;
						is_default?: boolean;
						isDefault?: boolean;
					};
					id?: number;
				}>;
			};
			egg?: {
				data?: {
					id?: number;
					attributes?: {
						id?: number;
					};
				};
			};
		};
		created_at?: string;
		updated_at?: string;
	}>
): Promise<number> {
	let syncedCount = 0;

	for (const pterServer of pterodactylServers) {
		try {
			// Extrahiere Egg ID aus verschiedenen möglichen Strukturen
			let eggId: number | undefined;
			if (pterServer.egg) {
				eggId = typeof pterServer.egg === 'number' ? pterServer.egg : pterServer.egg.id;
			} else if (pterServer.relationships?.egg?.data?.attributes?.id) {
				eggId = pterServer.relationships.egg.data.attributes.id;
			} else if (pterServer.relationships?.egg?.data?.id) {
				eggId = pterServer.relationships.egg.data.id;
			}
			
			if (!eggId) {
				console.warn(`Server ${pterServer.id || pterServer.name}: Keine Egg ID gefunden`);
				continue;
			}

			// Extrahiere Limits (mit Defaults falls nicht vorhanden)
			const limits = pterServer.limits || {
				memory: 1024, // 1GB
				swap: 0,
				disk: 10240, // 10GB
				cpu: 100 // 1 Core
			};

			// Konvertiere Limits zu DB-Format
			const cpu = Math.round(limits.cpu / 100); // CPU Prozent zu vCores
			const ram = Math.round(limits.memory / 1024); // MB zu GB
			const storage = Math.round(limits.disk / 1024); // MB zu GB

			// Hole aktuellen Server-Status von der Admin API
			let serverStatus: ServerStatus = 'PENDING';
			let isSuspended = false;
			
			try {
				// Verwende Admin API für Status-Sync (nur ACTIVE/SUSPENDED basierend auf suspended)
				const currentServer = await getPterodactylServerFromAdmin(pterServer.id);
				
				// Debug: Logge alle relevanten Felder
				if (process.env.DEBUG === 'true') {
					console.log(`[DEBUG] Server ${pterServer.id} (${pterServer.name}) Admin API Daten:`, {
						suspended: currentServer.suspended,
						identifier: currentServer.identifier,
						raw_server: JSON.stringify(currentServer).substring(0, 500)
					});
				}
				
				// Admin API: Nur suspended-Flag prüfen -> ACTIVE oder SUSPENDED
				serverStatus = mapPterodactylStatusFromAdmin(currentServer.suspended || false);
				isSuspended = currentServer.suspended || false;
				
				if (process.env.DEBUG === 'true') {
					console.log(`[DEBUG] Server ${pterServer.id} finaler Status (Admin API): ${serverStatus} (suspended: ${isSuspended})`);
				}
			} catch (error) {
				console.warn(`Konnte Status für Server ${pterServer.id} nicht von Admin API abrufen:`, error);
				// Fallback: Verwende Status aus übergebenen Daten
				serverStatus = pterServer.suspended 
					? 'SUSPENDED' 
					: 'ACTIVE';
				isSuspended = pterServer.suspended || false;
			}

			// Extrahiere IP und Port aus allocations
			let ipAddress: string | undefined;
			let port: number | undefined;
			
			if (pterServer.relationships?.allocations?.data && Array.isArray(pterServer.relationships.allocations.data) && pterServer.relationships.allocations.data.length > 0) {
				// Finde die primäre Allocation (meist die erste oder die mit default: true)
				const primaryAllocation = pterServer.relationships.allocations.data.find((a: any) => 
					a.attributes?.is_default === true || a.attributes?.isDefault === true
				) || pterServer.relationships.allocations.data[0];
				
				// Extrahiere Allocation-Daten - prüfe zuerst attributes, dann direkt
				const alloc = primaryAllocation?.attributes || primaryAllocation;
				if (alloc && typeof alloc === 'object') {
					ipAddress = (alloc as any).ip || (alloc as any).ip_alias || (alloc as any).ipAlias;
					port = (alloc as any).port;
				}
			}

			// Prüfe ob Server bereits existiert
			const existingServer = await prisma.server.findFirst({
				where: {
					pterodactylServerId: String(pterServer.id)
				} as any
			});

			if (existingServer) {
				// Aktualisiere bestehenden Server
				await prisma.server.update({
					where: { id: existingServer.id },
					data: {
						name: pterServer.name,
						status: serverStatus as any,
						cpu,
						ram,
						storage,
						eggId: eggId,
						ipAddress: ipAddress || undefined,
						port: port || undefined,
						updatedAt: new Date()
					} as any
				});
			} else {
				// Erstelle neuen Server
				await prisma.server.create({
					data: {
						name: pterServer.name,
						type: 'APP_HOSTING',
						status: serverStatus as any,
						cpu,
						ram,
						storage,
						bandwidth: 1, // Default Bandwidth
						priceMonthly: 0, // Default Preis (kann später angepasst werden)
						pterodactylServerId: String(pterServer.id),
						eggId: eggId,
						userId: userId,
						ipAddress: ipAddress || undefined,
						port: port || undefined,
						createdAt: pterServer.created_at ? new Date(pterServer.created_at) : new Date(),
						updatedAt: pterServer.updated_at ? new Date(pterServer.updated_at) : new Date()
					} as any,
				});
			}

			syncedCount++;
		} catch (error) {
			console.error(`Fehler beim Synchronisieren von Server ${pterServer.id || pterServer.name}:`, error);
		}
	}

	// Entferne DB-Einträge, die kein App-Hosting-Server mehr sind (z. B. fälschlich als APP_HOSTING angelegte Gameserver)
	const syncedPterodactylIds = pterodactylServers.map((s) => String(s.id));
	if (syncedPterodactylIds.length > 0) {
		await prisma.server.deleteMany({
			where: {
				userId,
				type: 'APP_HOSTING' as any,
				pterodactylServerId: { notIn: syncedPterodactylIds }
			} as any
		});
	} else {
		// Keine App-Hosting-Server von Pterodactyl (nur Nest 8) → falsch zugeordnete Einträge entfernen
		await prisma.server.deleteMany({
			where: {
				userId,
				type: 'APP_HOSTING' as any,
				pterodactylServerId: { not: null }
			} as any
		});
	}

	return syncedCount;
}

/**
 * Synchronisiert Gameserver Server in die Datenbank
 * Ähnlich wie syncPterodactylServersToDatabase, aber für GAMESERVER type
 */
export async function syncGameserverServersToDatabase(
	userId: string,
	pterodactylServers: Array<{
		id: number | string;
		identifier?: string;
		name: string;
		egg?: number | { id: number };
		limits?: {
			memory: number; // in MB
			swap: number; // in MB
			disk: number; // in MB
			cpu: number; // in Prozent
		};
		status?: string | null;
		suspended?: boolean;
		allocation?: number | any;
		node?: number;
		user?: number;
		relationships?: {
			allocations?: {
				data?: Array<{
					attributes?: {
						ip?: string;
						ip_alias?: string;
						port?: number;
						is_default?: boolean;
						isDefault?: boolean;
					};
					id?: number;
				}>;
			};
			egg?: {
				data?: {
					id?: number;
					attributes?: {
						id?: number;
					};
				};
			};
		};
		created_at?: string;
		updated_at?: string;
	}>
): Promise<number> {
	let syncedCount = 0;

	for (const pterServer of pterodactylServers) {
		try {
			// Extrahiere Egg ID aus verschiedenen möglichen Strukturen
			let eggId: number | undefined;
			if (pterServer.egg) {
				eggId = typeof pterServer.egg === 'number' ? pterServer.egg : pterServer.egg.id;
			} else if (pterServer.relationships?.egg?.data?.attributes?.id) {
				eggId = pterServer.relationships.egg.data.attributes.id;
			} else if (pterServer.relationships?.egg?.data?.id) {
				eggId = pterServer.relationships.egg.data.id;
			}
			
			if (!eggId) {
				console.warn(`Server ${pterServer.id || pterServer.name}: Keine Egg ID gefunden`);
				continue;
			}

			// Extrahiere Limits (mit Defaults falls nicht vorhanden)
			const limits = pterServer.limits || {
				memory: 1024, // 1GB
				swap: 0,
				disk: 10240, // 10GB
				cpu: 100 // 1 Core
			};

			// Konvertiere Limits zu DB-Format
			const cpu = Math.round(limits.cpu / 100); // CPU Prozent zu vCores
			const ram = Math.round(limits.memory / 1024); // MB zu GB
			const storage = Math.round(limits.disk / 1024); // MB zu GB

			// Hole aktuellen Server-Status von der Admin API
			let serverStatus: ServerStatus = 'PENDING';
			let isSuspended = false;
			
			try {
				// Verwende Admin API für Status-Sync (nur ACTIVE/SUSPENDED basierend auf suspended)
				const currentServer = await getPterodactylServerFromAdmin(pterServer.id);
				
				// Debug: Logge alle relevanten Felder
				if (process.env.DEBUG === 'true') {
					console.log(`[DEBUG] Gameserver ${pterServer.id} (${pterServer.name}) Admin API Daten:`, {
						suspended: currentServer.suspended,
						identifier: currentServer.identifier,
						raw_server: JSON.stringify(currentServer).substring(0, 500)
					});
				}
				
				// Admin API: Nur suspended-Flag prüfen -> ACTIVE oder SUSPENDED
				serverStatus = mapPterodactylStatusFromAdmin(currentServer.suspended || false);
				isSuspended = currentServer.suspended || false;
				
				if (process.env.DEBUG === 'true') {
					console.log(`[DEBUG] Gameserver ${pterServer.id} finaler Status (Admin API): ${serverStatus} (suspended: ${isSuspended})`);
				}
			} catch (error) {
				console.warn(`Konnte Status für Gameserver ${pterServer.id} nicht von Admin API abrufen:`, error);
				// Fallback: Verwende Status aus übergebenen Daten
				serverStatus = pterServer.suspended 
					? 'SUSPENDED' 
					: 'ACTIVE';
				isSuspended = pterServer.suspended || false;
			}

			// Extrahiere IP und Port aus allocations
			let ipAddress: string | undefined;
			let port: number | undefined;
			
			if (pterServer.relationships?.allocations?.data && Array.isArray(pterServer.relationships.allocations.data) && pterServer.relationships.allocations.data.length > 0) {
				// Finde die primäre Allocation (meist die erste oder die mit default: true)
				const primaryAllocation = pterServer.relationships.allocations.data.find((a: any) => 
					a.attributes?.is_default === true || a.attributes?.isDefault === true
				) || pterServer.relationships.allocations.data[0];
				
				// Extrahiere Allocation-Daten - prüfe zuerst attributes, dann direkt
				const alloc = primaryAllocation?.attributes || primaryAllocation;
				if (alloc && typeof alloc === 'object') {
					ipAddress = (alloc as any).ip || (alloc as any).ip_alias || (alloc as any).ipAlias;
					port = (alloc as any).port;
				}
			}

			// Prüfe ob Server bereits existiert
			const existingServer = await prisma.server.findFirst({
				where: {
					pterodactylServerId: String(pterServer.id)
				} as any
			});

			if (existingServer) {
				// Aktualisiere bestehenden Server
				await prisma.server.update({
					where: { id: existingServer.id },
					data: {
						name: pterServer.name,
						status: serverStatus as any,
						cpu,
						ram,
						storage,
						eggId: eggId,
						ipAddress: ipAddress || undefined,
						port: port || undefined,
						updatedAt: new Date()
					} as any
				});
			} else {
				// Erstelle neuen Server
				await prisma.server.create({
					data: {
						name: pterServer.name,
						type: 'GAMESERVER',
						status: serverStatus as any,
						cpu,
						ram,
						storage,
						bandwidth: 1, // Default Bandwidth
						priceMonthly: 0, // Default Preis (kann später angepasst werden)
						pterodactylServerId: String(pterServer.id),
						eggId: eggId,
						userId: userId,
						ipAddress: ipAddress || undefined,
						port: port || undefined,
						createdAt: pterServer.created_at ? new Date(pterServer.created_at) : new Date(),
						updatedAt: pterServer.updated_at ? new Date(pterServer.updated_at) : new Date()
					} as any,
				});
			}

			syncedCount++;
		} catch (error) {
			console.error(`Fehler beim Synchronisieren von Gameserver ${pterServer.id || pterServer.name}:`, error);
		}
	}

	// Entferne DB-Einträge, die kein Gameserver mehr sind (nur Nest 6 = Minecraft Java)
	const syncedPterodactylIds = pterodactylServers.map((s) => String(s.id));
	if (syncedPterodactylIds.length > 0) {
		await prisma.server.deleteMany({
			where: {
				userId,
				type: 'GAMESERVER' as any,
				pterodactylServerId: { notIn: syncedPterodactylIds }
			} as any
		});
	} else {
		await prisma.server.deleteMany({
			where: {
				userId,
				type: 'GAMESERVER' as any,
				pterodactylServerId: { not: null }
			} as any
		});
	}

	return syncedCount;
}

/**
 * Synchronisiert Gameserver Status von Pterodactyl mit der Datenbank
 */
export async function syncGameserverStatus(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'GAMESERVER') {
		throw new Error('Server nicht gefunden oder kein Gameserver');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Verwende Admin API für Status-Sync (nur ACTIVE/SUSPENDED basierend auf suspended)
		const pterodactylServer = await getPterodactylServerFromAdmin(pterodactylServerId);
		const status = mapPterodactylStatusFromAdmin(
			pterodactylServer.suspended
		);

		// Aktualisiere Server in der Datenbank
		const updated = await prisma.server.update({
			where: { id: serverId },
			data: {
				status,
			},
		});

		return updated;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen Gameserver
 */
export async function startGameserver(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'GAMESERVER') {
		throw new Error('Server nicht gefunden oder kein Gameserver');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'start');
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Stoppt einen Gameserver
 */
export async function stopGameserver(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'GAMESERVER') {
		throw new Error('Server nicht gefunden oder kein Gameserver');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'stop');
		
		// Aktualisiere Status in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'SUSPENDED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Startet einen Gameserver neu
 */
export async function restartGameserver(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'GAMESERVER') {
		throw new Error('Server nicht gefunden oder kein Gameserver');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Hole Server Identifier für User API
		const serverIdentifier = await getServerIdentifierFromId(pterodactylServerId);
		await sendServerPowerAction(serverIdentifier, 'restart');
		
		// Status bleibt ACTIVE nach Neustart
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'ACTIVE' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Löscht einen Gameserver
 */
export async function deleteGameserver(serverId: string) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
	});

	if (!server || server.type !== 'GAMESERVER') {
		throw new Error('Server nicht gefunden oder kein Gameserver');
	}

	const pterodactylServerId = (server as any).pterodactylServerId;
	if (!pterodactylServerId) {
		throw new Error('Server hat keine Pterodactyl Server ID');
	}

	try {
		// Lösche Server bei Pterodactyl
		await deletePterodactylServer(pterodactylServerId);
		
		// Markiere Server als gelöscht in der DB
		await prisma.server.update({
			where: { id: serverId },
			data: { status: 'CANCELLED' },
		});

		return { success: true };
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw new Error(`Pterodactyl API Fehler: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Verlängert die Laufzeit eines Gameservers oder App-Hosting-Servers (expiresAt + Monate).
 * Optional: Credits abziehen und Order/Invoice anlegen.
 */
export async function extendServerLaufzeit(
	serverId: string,
	months: number = 1,
	useCredits: boolean = true
) {
	const server = await prisma.server.findUnique({
		where: { id: serverId },
		include: {
			user: {
				select: { id: true, credits: true }
			}
		}
	});

	if (!server || (server.type !== 'GAMESERVER' && server.type !== 'APP_HOSTING')) {
		throw new Error('Server nicht gefunden oder kein Gameserver/App-Hosting');
	}

	const priceInCents = server.priceMonthly;
	const priceInEuros = priceInCents / 100;
	const totalPrice = priceInEuros * months;

	if (useCredits) {
		const userCredits = ((server.user as any)?.credits as number) ?? 0;
		if (userCredits < totalPrice) {
			throw new Error(`Nicht genügend Credits. Benötigt: €${totalPrice.toFixed(2)}, Verfügbar: €${userCredits.toFixed(2)}`);
		}
	}

	const currentExpiresAt = server.expiresAt || new Date();
	const newExpiresAt = new Date(currentExpiresAt);
	newExpiresAt.setMonth(newExpiresAt.getMonth() + months);

	await prisma.$transaction(async (tx) => {
		await tx.server.update({
			where: { id: serverId },
			data: {
				expiresAt: newExpiresAt,
				status: server.status === 'EXPIRED' ? 'ACTIVE' : server.status
			} as any
		});

		if (useCredits) {
			await tx.user.update({
				where: { id: server.userId },
				data: { credits: { decrement: totalPrice } } as any
			});
		}

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
				servers: { connect: { id: serverId } }
			} as any
		});

		const { createInvoiceForOrder } = await import('./invoice-helper');
		await createInvoiceForOrder(
			orderId,
			server.userId,
			totalPrice,
			'PAID',
			new Date(),
			tx
		);
	});
}

/**
 * Fügt einem Gameserver oder App-Hosting-Server Laufzeit hinzu (ohne Credits/Rechnung).
 * Für z. B. Discord-Boost-Gutschrift über die Bot-API.
 */
export async function addMonthsToServerLaufzeit(serverId: string, months: number) {
	if (months < 1) {
		throw new Error('Monate muss mindestens 1 sein');
	}
	const server = await prisma.server.findUnique({
		where: { id: serverId }
	});
	if (!server || (server.type !== 'GAMESERVER' && server.type !== 'APP_HOSTING')) {
		throw new Error('Server nicht gefunden oder kein Gameserver/App-Hosting');
	}
	const currentExpiresAt = server.expiresAt || new Date();
	const newExpiresAt = new Date(currentExpiresAt);
	newExpiresAt.setMonth(newExpiresAt.getMonth() + months);
	await prisma.server.update({
		where: { id: serverId },
		data: {
			expiresAt: newExpiresAt,
			status: server.status === 'EXPIRED' ? 'ACTIVE' : server.status
		} as any
	});
	return { server, newExpiresAt };
}

