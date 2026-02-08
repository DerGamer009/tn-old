import { prisma } from './prisma';

export async function logLoginActivity(
	userId: string,
	ipAddress: string,
	userAgent: string | null,
	status: 'success' | 'failed' = 'success'
) {
	try {
		await prisma.loginActivity.create({
			data: {
				userId,
				ipAddress,
				userAgent,
				status
			}
		});
	} catch (error) {
		console.error('Fehler beim Loggen der Login-Aktivität:', error);
	}
}

export async function getRecentActivity(userId: string, limit: number = 10) {
	return prisma.loginActivity.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		take: limit
	});
}

