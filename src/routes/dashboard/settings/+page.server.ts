import { fail } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticator } from 'otplib';

// Erlaube eine kleine Zeitabweichung beim TOTP (vorheriger/nächster 30s-Slot)
(authenticator as any).options = {
	...(authenticator as any).options,
	window: 1
};

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	return { user };
};

export const actions: Actions = {
	uploadAvatar: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const formData = await request.formData();
		const file = formData.get('avatar') as File | null;

		if (!file) {
			return fail(400, { error: 'Keine Datei hochgeladen' });
		}

		// Validierung
		if (!file.type.startsWith('image/')) {
			return fail(400, { error: 'Nur Bilddateien sind erlaubt' });
		}

		// Maximale Dateigröße: 5MB
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return fail(400, { error: 'Datei ist zu groß (max. 5MB)' });
		}

		try {
			// Prüfe ob Token vorhanden ist (aus SvelteKit env oder process.env als Fallback)
			const token = env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
			
			if (!token) {
				console.error('BLOB_READ_WRITE_TOKEN nicht gefunden in Umgebungsvariablen');
				console.error('Verfügbare Env-Vars:', Object.keys(env || {}).length, 'Variablen gefunden');
				return fail(500, { 
					error: 'Blob-Storage ist nicht konfiguriert. Bitte stelle sicher, dass BLOB_READ_WRITE_TOKEN in deiner .env Datei gesetzt ist und starte den Server neu.' 
				});
			}

			// Datei zu Blob konvertieren
			const buffer = Buffer.from(await file.arrayBuffer());

			// Eindeutigen Dateinamen erstellen
			const fileName = `avatars/${locals.user.id}/${Date.now()}-${file.name}`;

			// Zu Vercel Blob hochladen
			const { url } = await put(fileName, buffer, {
				access: 'public',
				contentType: file.type,
				token: token // Token explizit übergeben
			});

			// Avatar-URL in Datenbank speichern
			await prisma.user.update({
				where: { id: locals.user.id },
				data: { image: url }
			});

			return { success: true, url };
		} catch (error) {
			console.error('Avatar-Upload Fehler:', error);
			return fail(500, { error: 'Fehler beim Hochladen des Avatars' });
		}
	},

	deleteAvatar: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		try {
			await prisma.user.update({
				where: { id: locals.user.id },
				data: { image: null }
			});

			return { success: true };
		} catch (error) {
			console.error('Avatar-Löschen Fehler:', error);
			return fail(500, { error: 'Fehler beim Löschen des Avatars' });
		}
	},

	beginTwoFactorSetup: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const user = (await prisma.user.findUnique({
			where: { id: locals.user.id }
		})) as any;

		if (!user) {
			return fail(404, { error: 'User nicht gefunden' });
		}

		// Neues Secret erzeugen
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, 'TitanNode', secret);

		console.log('[2FA] begin setup', { userId: locals.user.id });

		await prisma.user.update({
			where: { id: user.id },
			data: {
				twoFactorSecret: secret,
				twoFactorEnabled: false,
				twoFactorBackupCodes: []
			} as any
		});

		return {
			success: true,
			otpauthUrl
		};
	},

	confirmTwoFactor: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const formData = await request.formData();
		const code = (formData.get('code') as string | null)?.trim() || '';

		if (!code) {
			return fail(400, { error: 'Bitte gib den Code aus deiner Authenticator-App ein.' });
		}

		const user = (await prisma.user.findUnique({
			where: { id: locals.user.id }
		})) as any;

		if (!user || !(user as any).twoFactorSecret) {
			return fail(400, { error: '2FA-Setup ist nicht initialisiert.' });
		}

		const isValid = authenticator.verify({
			token: code,
			secret: (user as any).twoFactorSecret as string
		});

		if (!isValid) {
			console.warn('[2FA] invalid TOTP during confirm', { userId: locals.user.id });
			return fail(400, { error: 'Der eingegebene Code ist ungültig.' });
		}

		// 10 zufällige Backup-Codes generieren (z.B. XXXX-XXXX-XXXX)
		const plainCodes: string[] = [];
		for (let i = 0; i < 10; i++) {
			const part1 = crypto.randomBytes(2).toString('hex');
			const part2 = crypto.randomBytes(2).toString('hex');
			const part3 = crypto.randomBytes(2).toString('hex');
			plainCodes.push(`${part1}-${part2}-${part3}`.toUpperCase());
		}

		// Codes hashen bevor sie gespeichert werden
		const hashedCodes = await Promise.all(plainCodes.map((code) => bcrypt.hash(code, 10)));

		console.log('[2FA] confirm success', { userId: locals.user.id });

		await prisma.user.update({
			where: { id: locals.user.id },
			data: {
				twoFactorEnabled: true,
				twoFactorBackupCodes: hashedCodes
			} as any
		});

		return {
			success: true,
			backupCodes: plainCodes
		};
	},

	regenerateBackupCodes: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		const user = (await prisma.user.findUnique({
			where: { id: locals.user.id }
		})) as any;

		if (!user || !user.twoFactorEnabled) {
			console.warn('[2FA] regenerate called but 2FA not enabled', { userId: locals.user.id });
			return fail(400, { error: '2FA ist nicht aktiviert.' });
		}

		// 10 zufällige Backup-Codes generieren (z.B. XXXX-XXXX-XXXX)
		const plainCodes: string[] = [];
		for (let i = 0; i < 10; i++) {
			const part1 = crypto.randomBytes(2).toString('hex');
			const part2 = crypto.randomBytes(2).toString('hex');
			const part3 = crypto.randomBytes(2).toString('hex');
			plainCodes.push(`${part1}-${part2}-${part3}`.toUpperCase());
		}

		// Codes hashen bevor sie gespeichert werden
		const hashedCodes = await Promise.all(plainCodes.map((code) => bcrypt.hash(code, 10)));

		console.log('[2FA] regenerate backup codes', { userId: locals.user.id });

		await prisma.user.update({
			where: { id: locals.user.id },
			data: {
				twoFactorEnabled: true,
				twoFactorBackupCodes: hashedCodes
			} as any
		});

		return {
			success: true,
			backupCodes: plainCodes
		};
	},

	disableTwoFactor: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert' });
		}

		console.log('[2FA] disable', { userId: locals.user.id });

		await prisma.user.update({
			where: { id: locals.user.id },
			data: {
				twoFactorEnabled: false,
				twoFactorBackupCodes: []
			} as any
		});

		return {
			success: true
		};
	}
};

