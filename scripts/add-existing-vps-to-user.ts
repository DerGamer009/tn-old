/**
 * Script zum Hinzufügen eines bestehenden VPS-Servers von Datalix zu einem User
 * Ruft VPS-Daten (RAM, Disk, CPU, Bandwidth, Laufzeit) von Datalix ab
 * 
 * Usage:
 *   DATALIX_SERVICE_ID=6a954ecb-8ceb-4374-8e34-7863af015c70 USER_ID=cmk78xm8m0000ipa80c1i4mkt npx tsx scripts/add-existing-vps-to-user.ts
 * 
 * WICHTIG: Stelle sicher, dass DATALIX_API_KEY in .env gesetzt ist!
 * Optional: DATALIX_AUTH_TYPE kann auf "apikey", "basic" oder "bearer" gesetzt werden
 */

import { PrismaClient } from '@prisma/client';
import {
	getDatalixVpsByServiceId,
	type DatalixVps,
	DatalixApiError
} from '../src/lib/server/datalix';

const prisma = new PrismaClient();

/**
 * Mappt Datalix Status zu unserem ServerStatus
 */
function mapDatalixStatusToServerStatus(
	datalixStatus: 'running' | 'stopped' | 'suspended' | 'pending'
): 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED' {
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
 * Berechnet den monatlichen Preis basierend auf den Specs
 */
function calculatePrice(cpu: number, ram: number, storage: number, bandwidth: number): number {
	// Einfache Preisberechnung basierend auf Specs
	// Kann später angepasst werden
	const basePrice = 4.99;
	const cpuPrice = cpu * 1.0;
	const ramPrice = ram * 0.5; // RAM in GB
	const storagePrice = storage * 0.05; // Storage in GB
	const bandwidthPrice = bandwidth * 0.5; // Bandwidth in Gbit/s
	
	return Math.round((basePrice + cpuPrice + ramPrice + storagePrice + bandwidthPrice) * 100) / 100;
}

/**
 * Konvertiert Datum-String zu Date-Objekt
 */
function parseDate(dateString: string | undefined): Date | undefined {
	if (!dateString) return undefined;
	try {
		return new Date(dateString);
	} catch {
		return undefined;
	}
}

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

async function addExistingVpsToUser(userId: string, serviceId: string, customName?: string) {
	try {
		console.log(`🚀 Füge bestehenden VPS zu User hinzu`);
		console.log(`📋 Service ID: ${serviceId}`);
		console.log(`👤 User ID: ${userId}`);

		// Prüfe ob User existiert
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error(`User mit ID ${userId} nicht gefunden`);
		}

		console.log(`✅ User gefunden: ${user.email} (${user.firstName} ${user.lastName})`);

		// Rufe VPS-Daten von Datalix ab
		console.log(`\n📡 Rufe VPS-Daten von Datalix API ab...`);
		let datalixVps: DatalixVps;
		try {
			datalixVps = await getDatalixVpsByServiceId(serviceId);
		} catch (error) {
			// Versuche auch direkt mit der Service-ID als VPS-ID
			if (error instanceof DatalixApiError && error.statusCode === 404) {
				console.log(`   Service-ID Endpunkt nicht gefunden, versuche direkt als VPS-ID...`);
				try {
					const { getDatalixVps } = await import('../src/lib/server/datalix');
					datalixVps = await getDatalixVps(serviceId);
					console.log(`   ✅ VPS gefunden über VPS-ID Endpunkt`);
				} catch (innerError) {
					// Versuche getDatalixServiceDetails
					console.log(`   VPS-ID Endpunkt nicht gefunden, versuche Service-Details Endpunkt...`);
					try {
						const { getDatalixServiceDetails } = await import('../src/lib/server/datalix');
						const serviceDetails = await getDatalixServiceDetails(serviceId);
						
						if (serviceDetails.service && serviceDetails.product) {
							// Extrahiere IP-Adresse
							let ipv4: string | undefined = undefined;
							if (serviceDetails.ipData?.ipv4) {
								if (Array.isArray(serviceDetails.ipData.ipv4) && serviceDetails.ipData.ipv4.length > 0) {
									ipv4 = typeof serviceDetails.ipData.ipv4[0] === 'object' && 'ip' in serviceDetails.ipData.ipv4[0]
										? serviceDetails.ipData.ipv4[0].ip
										: String(serviceDetails.ipData.ipv4[0]);
								} else if (typeof serviceDetails.ipData.ipv4 === 'string') {
									ipv4 = serviceDetails.ipData.ipv4;
								}
							}
							
							// Mappe zu DatalixVps
							datalixVps = {
								id: serviceDetails.product.id || serviceDetails.service.id,
								name: serviceDetails.service.name || serviceDetails.product.hostname || `VPS-${serviceDetails.service.id.substring(0, 8)}`,
								status: serviceDetails.product.status || 'pending',
								cpu: serviceDetails.product.cores || 0,
								ram: serviceDetails.product.memory || 0,
								disk: serviceDetails.product.disk || 0,
								bandwidth: serviceDetails.product.uplink ? Math.round(Number(serviceDetails.product.uplink) / 1000) : 1,
								ipv4: ipv4,
								location: serviceDetails.product.location || undefined,
								hostname: serviceDetails.product.hostname || undefined,
								serviceId: serviceDetails.service.id,
								createdAt: serviceDetails.product.created_on ? new Date(Number(serviceDetails.product.created_on) * 1000).toISOString() : (serviceDetails.service.created_on ? new Date(Number(serviceDetails.service.created_on) * 1000).toISOString() : undefined),
								expiresAt: serviceDetails.service.expire_at ? new Date(Number(serviceDetails.service.expire_at) * 1000).toISOString() : undefined,
							};
							console.log(`   ✅ VPS gefunden über Service-Details Endpunkt`);
						} else {
							throw new Error('Service-Details haben nicht die erwartete Struktur');
						}
					} catch (serviceDetailsError) {
						// Als letzten Versuch: Liste alle VPS auf und suche nach Service-ID
						console.log(`   Service-Details Endpunkt nicht verfügbar, versuche alle VPS aufzulisten...`);
						try {
							const { listDatalixVps } = await import('../src/lib/server/datalix');
							const allVps = await listDatalixVps();
							const foundVps = allVps.find(vps => vps.serviceId === serviceId || vps.id === serviceId);
							
							if (foundVps) {
								datalixVps = foundVps;
								console.log(`   ✅ VPS gefunden in VPS-Liste`);
							} else {
								throw new Error(`VPS mit Service ID ${serviceId} nicht in der Liste gefunden`);
							}
						} catch (listError) {
							// Werfe ursprünglichen Fehler mit mehr Details
							throw new DatalixApiError(
								`VPS mit Service ID ${serviceId} nicht gefunden. Bitte prüfe:\n` +
								`  1. Ist die Service ID korrekt?\n` +
								`  2. Ist der API-Key gültig?\n` +
								`  3. Hat der API-Key Zugriff auf diesen Service?\n` +
								`\nVersucht wurden:\n` +
								`  - getDatalixVpsByServiceId\n` +
								`  - getDatalixVps (als VPS-ID)\n` +
								`  - getDatalixServiceDetails\n` +
								`  - listDatalixVps (Suche in Liste)\n` +
								`\nLetzter Fehler: ${listError instanceof Error ? listError.message : String(listError)}`,
								error.statusCode || 404,
								error.response
							);
						}
					}
				}
			} else {
				throw error;
			}
		}

		console.log(`✅ VPS-Daten abgerufen:`, {
			id: datalixVps.id,
			name: datalixVps.name,
			status: datalixVps.status,
			cpu: `${datalixVps.cpu} vCores`,
			ram: `${datalixVps.ram} MB (${Math.round(datalixVps.ram / 1024 * 100) / 100} GB)`,
			disk: `${datalixVps.disk} GB`,
			bandwidth: `${datalixVps.bandwidth} Gbit/s`,
			ipv4: datalixVps.ipv4 || 'Nicht zugewiesen',
			createdAt: datalixVps.createdAt || 'Unbekannt',
			expiresAt: datalixVps.expiresAt || 'Unbegrenzt',
		});

		// Prüfe ob VPS bereits existiert (nach ID - die ID ist die Datalix VPS-ID)
		const existingServer = await prisma.server.findUnique({
			where: {
				id: datalixVps.id,
			},
		});

		if (existingServer) {
			console.log(`⚠️  VPS mit ID ${datalixVps.id} existiert bereits in der Datenbank`);
			console.log(`   Server ID: ${existingServer.id}`);
			console.log(`   Name: ${existingServer.name}`);
			console.log(`   User: ${existingServer.userId}`);
			
			const overwrite = process.env.OVERWRITE === 'true';
			if (!overwrite) {
				throw new Error('VPS existiert bereits. Setze OVERWRITE=true um zu überschreiben.');
			}
			console.log(`   ⚠️  Überschreibe bestehenden Eintrag...`);
		}

		// Mappe Datalix Status zu unserem ServerStatus
		const status = mapDatalixStatusToServerStatus(datalixVps.status);

		// Konvertiere RAM von MB zu GB
		const ramInGb = Math.round((datalixVps.ram / 1024) * 100) / 100;

		// Berechne Preis
		const priceMonthly = calculatePrice(
			datalixVps.cpu,
			ramInGb,
			datalixVps.disk,
			datalixVps.bandwidth
		);

		// Parse Expiration Date
		const expiresAt = parseDate(datalixVps.expiresAt);

		// Erstelle oder aktualisiere Server-Eintrag in der Datenbank
		console.log(`\n💾 Speichere VPS in Datenbank...`);
		
		// Extrahiere IP-Adresse korrekt (kann String oder Array sein)
		const ipAddress = extractIpAddress(datalixVps.ipv4);

		const serverData = {
			id: datalixVps.id, // Verwende Datalix VPS-ID als Server-ID
			name: customName || datalixVps.name || `VPS-${serviceId.substring(0, 8)}`,
			type: 'VPS' as const,
			status,
			cpu: datalixVps.cpu,
			ram: Math.round(ramInGb), // Runde auf ganze GB
			storage: datalixVps.disk,
			bandwidth: datalixVps.bandwidth,
			priceMonthly,
			ipAddress: ipAddress || undefined,
			datalixVpsId: datalixVps.id, // Behalte auch datalixVpsId für Kompatibilität
			userId: userId,
			expiresAt: expiresAt || undefined,
		};

		let server;
		if (existingServer) {
			// Aktualisiere bestehenden Server
			server = await prisma.server.update({
				where: { id: datalixVps.id },
				data: serverData,
			});
			console.log(`✅ VPS aktualisiert!`);
		} else {
			// Erstelle neuen Server mit Datalix VPS-ID als ID
			server = await prisma.server.create({
				data: serverData,
			});
			console.log(`✅ VPS erfolgreich erstellt!`);
		}

		console.log(`\n📊 Server-Details:`, {
			id: server.id,
			name: server.name,
			status: server.status,
			cpu: `${server.cpu} vCores`,
			ram: `${server.ram} GB`,
			storage: `${server.storage} GB`,
			bandwidth: `${server.bandwidth} Gbit/s`,
			ipAddress: server.ipAddress || 'Wird zugewiesen...',
			datalixVpsId: server.datalixVpsId,
			priceMonthly: `€${server.priceMonthly}/Monat`,
			expiresAt: server.expiresAt ? server.expiresAt.toISOString() : 'Unbegrenzt',
			createdAt: server.createdAt.toISOString(),
		});

		return server;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			console.error(`\n❌ Datalix API Fehler:`, error.message);
			if (error.statusCode) {
				console.error(`   Status Code: ${error.statusCode}`);
			}
			if (error.response) {
				console.error(`   Response:`, error.response);
			}
		} else {
			console.error(`\n❌ Fehler:`, error instanceof Error ? error.message : error);
		}
		throw error;
	}
}

// Main
async function main() {
	// Lade .env Datei
	try {
		const { config } = await import('dotenv');
		config();
	} catch {
		// dotenv ist optional
	}

	const serviceId = process.env.DATALIX_SERVICE_ID || '86e6e30f-552b-4a28-8ecf-1d84bd71828b';
	const userId = process.env.USER_ID || 'cmkwxlsmb0002lnyfo49z7rg0';
	const customName = process.env.VPS_NAME;

	if (!serviceId) {
		console.error('❌ DATALIX_SERVICE_ID ist erforderlich!');
		process.exit(1);
	}

	if (!userId) {
		console.error('❌ USER_ID ist erforderlich!');
		process.exit(1);
	}

	if (!process.env.DATALIX_API_KEY && !process.env.DATALIX_USERNAME) {
		console.error('❌ DATALIX_API_KEY oder DATALIX_USERNAME/DATALIX_PASSWORD ist nicht gesetzt!');
		console.error('   Bitte setze eine der folgenden Optionen in deiner .env Datei:');
		console.error('   - DATALIX_API_KEY="dein-api-key"');
		console.error('   - ODER DATALIX_USERNAME="username" und DATALIX_PASSWORD="password"');
		process.exit(1);
	}

	if (process.env.DATALIX_USERNAME) {
		console.log(`🔑 Authentifizierung: Query-Parameter token (Username: ${process.env.DATALIX_USERNAME})`);
	} else if (process.env.DATALIX_API_KEY) {
		console.log(`🔑 Authentifizierung: Query-Parameter token (API-Key)`);
	}

	try {
		await addExistingVpsToUser(userId, serviceId, customName);
	} catch (error) {
		console.error('\n💥 Script fehlgeschlagen!');
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();

