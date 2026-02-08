/**
 * Setzt bei allen bestehenden Gameservern und App-Hosting-Servern ohne Laufzeit
 * expiresAt = jetzt + 30 Tage (einmalig ausführen).
 *
 * Usage:
 *   npx tsx scripts/backfill-server-expires.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30);

	const result = await prisma.server.updateMany({
		where: {
			type: { in: ['GAMESERVER', 'APP_HOSTING'] },
			expiresAt: null
		} as any,
		data: { expiresAt } as any
	});

	console.log(
		`✅ ${result.count} Server (Gameserver/App Hosting) auf 30 Tage Laufzeit gesetzt (expiresAt: ${expiresAt.toISOString()}).`
	);
}

main()
	.catch((e) => {
		console.error('Fehler:', e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
