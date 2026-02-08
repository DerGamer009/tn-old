import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding status data...');

	// Services erstellen
	const services = [
		{
			name: 'VPS Hosting',
			slug: 'vps-hosting',
			description: 'Virtual Private Server Hosting',
			category: 'vps',
			displayOrder: 1
		},
		{
			name: 'Gameserver Hosting',
			slug: 'gameserver-hosting',
			description: 'Minecraft, CS:GO, ARK und mehr',
			category: 'gameserver',
			displayOrder: 2
		},
		{
			name: 'App Hosting',
			slug: 'app-hosting',
			description: 'Node.js, Docker und mehr',
			category: 'apps',
			displayOrder: 3
		},
		{
			name: 'Dashboard',
			slug: 'dashboard',
			description: 'Kundendashboard und Verwaltung',
			category: 'infrastructure',
			displayOrder: 4
		},
		{
			name: 'API',
			slug: 'api',
			description: 'REST API für Automatisierung',
			category: 'infrastructure',
			displayOrder: 5
		},
		{
			name: 'Website',
			slug: 'website',
			description: 'Hauptwebsite und Marketing-Seiten',
			category: 'infrastructure',
			displayOrder: 6
		},
		{
			name: 'Support System',
			slug: 'support-system',
			description: 'Ticket-System und Live-Chat',
			category: 'infrastructure',
			displayOrder: 7
		},
		{
			name: 'Backup System',
			slug: 'backup-system',
			description: 'Automatische Backups',
			category: 'infrastructure',
			displayOrder: 8
		}
	];

	for (const service of services) {
		const created = await prisma.systemService.upsert({
			where: { slug: service.slug },
			update: {},
			create: service
		});

		// Metriken für die letzten 7 Tage erstellen
		for (let i = 0; i < 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			await prisma.serviceMetric.create({
				data: {
					serviceId: created.id,
					uptime: 99.9 + Math.random() * 0.1,
					responseTime: Math.floor(Math.random() * 100) + 10,
					date
				}
			});
		}

		console.log(`✅ Created service: ${service.name}`);
	}

	// Beispiel-Incidents erstellen
	const vpsService = await prisma.systemService.findUnique({
		where: { slug: 'vps-hosting' }
	});
	const gameserverService = await prisma.systemService.findUnique({
		where: { slug: 'gameserver-hosting' }
	});
	const apiService = await prisma.systemService.findUnique({
		where: { slug: 'api' }
	});

	if (vpsService && gameserverService) {
		// Geplante Wartung
		const maintenance = await prisma.statusIncident.create({
			data: {
				title: 'Geplante Wartung - Frankfurt Datacenter',
				description:
					'Routinemäßige Wartungsarbeiten an der Netzwerkinfrastruktur. Es kann zu kurzen Unterbrechungen kommen.',
				status: 'COMPLETED',
				severity: 'MAINTENANCE',
				startedAt: new Date('2026-01-10T02:00:00Z'),
				resolvedAt: new Date('2026-01-10T04:00:00Z'),
				affectedServices: {
					connect: [{ id: vpsService.id }, { id: gameserverService.id }]
				}
			}
		});

		await prisma.incidentUpdate.create({
			data: {
				incidentId: maintenance.id,
				message: 'Wartungsarbeiten erfolgreich abgeschlossen. Alle Services sind wieder verfügbar.',
				status: 'COMPLETED'
			}
		});

		console.log('✅ Created maintenance incident');
	}

	if (apiService) {
		// API-Verzögerung
		const apiIssue = await prisma.statusIncident.create({
			data: {
				title: 'Kurze API-Verzögerung',
				description:
					'Erhöhte API-Antwortzeiten aufgrund eines Datenbankproblems. Wir arbeiten an einer Lösung.',
				status: 'RESOLVED',
				severity: 'MINOR',
				startedAt: new Date('2026-01-05T14:30:00Z'),
				resolvedAt: new Date('2026-01-05T14:45:00Z'),
				affectedServices: {
					connect: [{ id: apiService.id }]
				}
			}
		});

		await prisma.incidentUpdate.createMany({
			data: [
				{
					incidentId: apiIssue.id,
					message: 'Problem identifiziert: Datenbankverbindungs-Pool war erschöpft.',
					status: 'IDENTIFIED',
					createdAt: new Date('2026-01-05T14:35:00Z')
				},
				{
					incidentId: apiIssue.id,
					message: 'Fix deployed. Monitoring der Situation.',
					status: 'MONITORING',
					createdAt: new Date('2026-01-05T14:40:00Z')
				},
				{
					incidentId: apiIssue.id,
					message: 'Problem behoben. API-Antwortzeiten sind wieder normal.',
					status: 'RESOLVED',
					createdAt: new Date('2026-01-05T14:45:00Z')
				}
			]
		});

		console.log('✅ Created API incident');
	}

	console.log('✅ Status seeding completed!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

