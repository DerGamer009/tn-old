import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database...');

	// Erstelle Test-Announcements
	const announcements = [
		{
			title: 'Router maintenance',
			description:
				'We have scheduled a maintenance that will begin the next week. During this time, some services may be temporarily unavailable.',
			icon: '🛠️'
		},
		{
			title: 'IP migration',
			description:
				'Hello, We are migrating to a new IP range and another network. This will improve our service quality and speed.',
			icon: '📡'
		},
		{
			title: 'New feature: Auto-Backups',
			description:
				'We have introduced automatic backups for all your servers. Your data is now backed up daily.',
			icon: '💾'
		},
		{
			title: 'Welcome to TitanNode!',
			description:
				'Thank you for choosing TitanNode. We are excited to have you on board. Check out our documentation to get started.',
			icon: '🎉'
		}
	];

	for (const announcement of announcements) {
		await prisma.announcement.create({
			data: announcement
		});
	}

	console.log('✅ Seeding completed!');
	console.log(`   - Created ${announcements.length} announcements`);
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

