/**
 * Gameserver Management (Minecraft Java etc.)
 * Erstellt und verwaltet Gameserver über die Pterodactyl-Integration (Nest 6 = Minecraft Java)
 */

import { prisma } from './prisma';
import {
	createOrFindPterodactylUser,
	createPterodactylServer,
	getPterodactylServerFromAdmin,
	GAMESERVER_NEST_ID,
	PterodactylApiError
} from './pterodactyl';
import type { ServerStatus } from '@prisma/client';

const PTERODACTYL_LOCATION_ID = parseInt(process.env.PTERODACTYL_LOCATION_ID || '2', 10);
const PTERODACTYL_SERVICE_USER_ID = process.env.PTERODACTYL_SERVICE_USER_ID
	? parseInt(process.env.PTERODACTYL_SERVICE_USER_ID, 10)
	: undefined;

/** Minecraft Java Egg IDs (Nest 6): 15=Velocity, 16=Paper, 17=Folia, 18=Purpur, 19=SpongeVanilla, 20=SpongeForge, 21=Forge, 22=NeoForge, 43=Fabric */
export const MINECRAFT_JAVA_EGG_IDS = [15, 16, 17, 18, 19, 20, 21, 22, 43] as const;

/**
 * Erstellt einen neuen Minecraft Java Gameserver in Pterodactyl und in der Datenbank
 */
export async function createGameserver(data: {
	userId: string;
	name: string;
	cpu: number;
	ram: number; // GB
	storage: number; // GB
	priceMonthly: number;
	eggId: number; // z.B. 16 = Paper
	nestId?: number; // Standard 6 (Minecraft Java)
	game?: string;
	slots?: number;
	locationId?: number;
	dockerImage?: string;
	orderId?: string;
}) {
	const nestId = data.nestId ?? GAMESERVER_NEST_ID;
	const locationId = data.locationId ?? PTERODACTYL_LOCATION_ID;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
		select: { id: true, email: true, firstName: true, lastName: true }
	});
	const userWithPterodactyl = await prisma.user.findUnique({
		where: { id: data.userId }
	}) as any;

	if (!user) {
		throw new Error('User nicht gefunden');
	}

	let pterodactylUser;
	const pterodactylUserId = userWithPterodactyl?.pterodactylUserId;
	if (pterodactylUserId) {
		const { getPterodactylUser } = await import('./pterodactyl');
		try {
			pterodactylUser = await getPterodactylUser(pterodactylUserId);
		} catch {
			pterodactylUser = await createOrFindPterodactylUser(
				user.email,
				user.firstName,
				user.lastName,
				user.id
			);
		}
	} else {
		pterodactylUser = await createOrFindPterodactylUser(
			user.email,
			user.firstName,
			user.lastName,
			user.id
		);
	}

	// Bei Service-User-Modus: Server gehört einem gemeinsamen Pterodactyl-User → Upload/Power für alle
	const ownerId = PTERODACTYL_SERVICE_USER_ID ?? pterodactylUser.id;
	const useExternalId = PTERODACTYL_SERVICE_USER_ID != null;

	if (!useExternalId && (!pterodactylUserId || pterodactylUserId !== pterodactylUser.id.toString())) {
		await prisma.user.update({
			where: { id: data.userId },
			data: { pterodactylUserId: pterodactylUser.id.toString() } as any
		});
	}

	const pterodactylServer = await createPterodactylServer({
		name: data.name,
		userId: ownerId,
		locationId,
		nestId,
		eggId: data.eggId,
		limits: {
			memory: data.ram * 1024,
			swap: 0,
			disk: data.storage * 1024,
			cpu: data.cpu * 100
		},
		environment: data.dockerImage ? { DOCKER_IMAGE: data.dockerImage } : undefined,
		nodeId: undefined,
		externalId: useExternalId ? data.userId : undefined
	});

	const serverDetails = await getPterodactylServerFromAdmin(pterodactylServer.id);
	let ipAddress: string | undefined;
	let port: number | undefined;
	try {
		const base = process.env.PTERODACTYL_API_BASE || 'https://cp.titannode.org';
		const res = await fetch(
			`${base}/api/application/servers/${pterodactylServer.id}/allocations`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PTERODACTYL_ADMIN_KEY || ''}`,
					Accept: 'application/json'
				}
			}
		);
		if (res.ok) {
			const json = await res.json();
			const allocations = json.data || [];
			const primary = allocations.find((a: any) => a.attributes?.is_default) || allocations[0];
			if (primary) {
				const attrs = primary.attributes || primary;
				ipAddress = attrs.ip;
				port = attrs.port;
			}
		}
	} catch (e) {
		console.warn('Allocations nicht abrufbar:', e);
	}

	const status: ServerStatus = serverDetails.suspended ? 'SUSPENDED' : 'ACTIVE';

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30);

	const server = await prisma.server.create({
		data: {
			name: data.name,
			type: 'GAMESERVER',
			status,
			cpu: data.cpu,
			ram: data.ram,
			storage: data.storage,
			bandwidth: 1,
			priceMonthly: data.priceMonthly,
			ipAddress: ipAddress || undefined,
			port: port || undefined,
			pterodactylServerId: pterodactylServer.id.toString(),
			eggId: data.eggId,
			game: data.game || 'minecraft-java',
			slots: data.slots ?? 10,
			userId: data.userId,
			orderId: data.orderId,
			expiresAt
		} as any
	});

	if (data.orderId) {
		const { createInvoiceForServerPurchase } = await import('./invoice-helper');
		const order = await prisma.order.findUnique({ where: { id: data.orderId } });
		const invoiceStatus = order?.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID';
		await createInvoiceForServerPurchase(data.orderId, data.userId, data.priceMonthly, invoiceStatus);
	}

	return server;
}
