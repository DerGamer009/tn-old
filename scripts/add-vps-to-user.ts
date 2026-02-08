/**
 * Script zum Hinzufügen eines VPS-Servers von Datalix zu einem User
 * 
 * Usage:
 *   npx tsx scripts/add-vps-to-user.ts
 * 
 * Oder mit benutzerdefinierten Werten:
 *   USER_ID=cmk78xm8m0000ipa80c1i4mkt npx tsx scripts/add-vps-to-user.ts
 */

import { PrismaClient } from '@prisma/client';
import {
	createDatalixVps,
	type CreateVpsRequest,
	DatalixApiError
} from '../src/lib/server/datalix';

const prisma = new PrismaClient();

interface VpsConfig {
	name: string;
	cpu: number;
	ram: number; // in GB
	storage: number; // in GB
	bandwidth: number; // in Gbit/s
	priceMonthly: number;
}

// Standard-Konfiguration für den VPS
const DEFAULT_VPS_CONFIG: VpsConfig = {
	name: 'VPS-1',
	cpu: 2,
	ram: 4, // GB
	storage: 50, // GB
	bandwidth: 1, // Gbit/s
	priceMonthly: 4.99
};

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

async function addVpsToUser(userId: string, config: VpsConfig = DEFAULT_VPS_CONFIG) {
	try {
		console.log(`🚀 Erstelle VPS für User: ${userId}`);
		console.log(`📋 Konfiguration:`, config);

		// Prüfe ob User existiert
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error(`User mit ID ${userId} nicht gefunden`);
		}

		console.log(`✅ User gefunden: ${user.email} (${user.firstName} ${user.lastName})`);

		// Erstelle VPS über Datalix API
		console.log(`\n📡 Erstelle VPS über Datalix API...`);
		const datalixVps = await createDatalixVps({
			name: config.name,
			cpu: config.cpu,
			ram: config.ram * 1024, // Konvertiere GB zu MB für Datalix
			disk: config.storage,
			bandwidth: config.bandwidth,
		});

		console.log(`✅ VPS bei Datalix erstellt:`, {
			id: datalixVps.id,
			status: datalixVps.status,
			ipv4: datalixVps.ipv4,
		});

		// Mappe Datalix Status zu unserem ServerStatus
		const status = mapDatalixStatusToServerStatus(datalixVps.status);

		// Erstelle Server-Eintrag in der Datenbank
		console.log(`\n💾 Speichere VPS in Datenbank...`);
		const server = await prisma.server.create({
			data: {
				name: config.name,
				type: 'VPS',
				status,
				cpu: config.cpu,
				ram: config.ram,
				storage: config.storage,
				bandwidth: config.bandwidth,
				priceMonthly: config.priceMonthly,
				ipAddress: datalixVps.ipv4 || undefined,
				datalixVpsId: datalixVps.id,
				userId: userId,
			},
		});

		console.log(`\n✅ VPS erfolgreich erstellt!`);
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
	const userId = process.env.USER_ID || 'cmk78xm8m0000ipa80c1i4mkt';

	// Optionale Konfiguration über Environment-Variablen
	const config: VpsConfig = {
		name: process.env.VPS_NAME || DEFAULT_VPS_CONFIG.name,
		cpu: parseInt(process.env.VPS_CPU || String(DEFAULT_VPS_CONFIG.cpu)),
		ram: parseInt(process.env.VPS_RAM || String(DEFAULT_VPS_CONFIG.ram)),
		storage: parseInt(process.env.VPS_STORAGE || String(DEFAULT_VPS_CONFIG.storage)),
		bandwidth: parseInt(process.env.VPS_BANDWIDTH || String(DEFAULT_VPS_CONFIG.bandwidth)),
		priceMonthly: parseFloat(process.env.VPS_PRICE || String(DEFAULT_VPS_CONFIG.priceMonthly)),
	};

	try {
		await addVpsToUser(userId, config);
	} catch (error) {
		console.error('\n💥 Script fehlgeschlagen!');
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();

