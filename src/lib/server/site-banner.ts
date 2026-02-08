import { prisma } from '$lib/server/prisma';

export type SiteBannerData = {
	enabled: boolean;
	text: string;
	linkUrl: string | null;
	icon: string | null;
};

/** Liefert den aktuellen Site-Banner (erster Eintrag). Wenn keiner existiert, null. */
export async function getSiteBanner(): Promise<SiteBannerData | null> {
	const row = await prisma.siteBanner.findFirst({
		orderBy: { updatedAt: 'desc' }
	});
	if (!row) return null;
	return {
		enabled: row.enabled,
		text: row.text,
		linkUrl: row.linkUrl,
		icon: row.icon
	};
}

/** Speichert den Banner. Erstellt einen Eintrag, wenn noch keiner existiert. */
export async function saveSiteBanner(data: SiteBannerData): Promise<void> {
	const existing = await prisma.siteBanner.findFirst();
	const payload = {
		enabled: data.enabled,
		text: data.text,
		linkUrl: data.linkUrl ?? null,
		icon: data.icon ?? null
	};
	if (existing) {
		await prisma.siteBanner.update({
			where: { id: existing.id },
			data: payload
		});
	} else {
		await prisma.siteBanner.create({
			data: payload
		});
	}
}
