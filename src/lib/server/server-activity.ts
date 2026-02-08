import { prisma } from './prisma';

/**
 * Loggt eine Server-Aktivität
 */
export async function logServerActivity(
	serverId: string,
	userId: string,
	action: string,
	ipAddress: string,
	details?: string
) {
	try {
		await prisma.serverActivity.create({
			data: {
				serverId,
				userId,
				action,
				ipAddress,
				details
			}
		});
	} catch (error) {
		console.error('Fehler beim Loggen der Server-Aktivität:', error);
		// Nicht werfen, damit die Hauptaktion nicht fehlschlägt
	}
}

/**
 * Holt die Activity-Logs für einen Server
 */
export async function getServerActivities(
	serverId: string,
	limit: number = 50
) {
	return await prisma.serverActivity.findMany({
		where: { serverId },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true
				}
			}
		},
		orderBy: { createdAt: 'desc' },
		take: limit
	});
}

/**
 * Holt die IP-Adresse aus einem Request
 */
export function getClientIp(request: Request): string {
	// Versuche verschiedene Header zu lesen
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Fallback
	return 'unknown';
}
