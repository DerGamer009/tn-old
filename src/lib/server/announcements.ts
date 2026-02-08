import { prisma } from './prisma';

export async function getAnnouncements(limit: number = 10) {
	return prisma.announcement.findMany({
		where: { isPublished: true },
		orderBy: { createdAt: 'desc' },
		take: limit
	});
}

export async function createAnnouncement(
	title: string,
	content: string,
	type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
	createdById?: string | null
) {
	return prisma.announcement.create({
		data: {
			title,
			description: content,
			type,
			...(createdById && { createdById })
		}
	});
}

export async function deleteAnnouncement(id: string) {
	return prisma.announcement.delete({
		where: { id }
	});
}

export async function updateAnnouncement(
	id: string,
	data: {
		title?: string;
		description?: string;
		icon?: string;
		isPublished?: boolean;
	}
) {
	return prisma.announcement.update({
		where: { id },
		data
	});
}

