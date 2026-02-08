import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { User } from '@prisma/client';
import { generateSupportPin } from '$lib/server/roles';

// Password-Hashing
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

// Password-Verifikation
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

// User erstellen
export async function createUser(data: {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
}) {
	const hashedPassword = await hashPassword(data.password);

	// Support-PIN generieren (für Kunden & Team-Mitglieder)
	let supportPin = generateSupportPin();
	// Optional: Mehrfach sicherstellen, dass der PIN noch nicht vergeben ist
	for (let i = 0; i < 5; i++) {
		const existing = await prisma.user.findUnique({ where: { supportPin } });
		if (!existing) break;
		supportPin = generateSupportPin();
	}

	return prisma.user.create({
		data: {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			password: hashedPassword,
			supportPin
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			createdAt: true
		}
	});
}

// User finden (Login)
export async function findUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: { email }
	});
}

// Session erstellen
export async function createSession(
	userId: string,
	options?: { createdByImpersonationUserId?: string }
): Promise<string> {
	const sessionToken = crypto.randomUUID();
	const expires = new Date();
	expires.setDate(expires.getDate() + 30); // 30 Tage gültig

	await prisma.session.create({
		data: {
			sessionToken,
			userId,
			expires,
			createdByImpersonationUserId: options?.createdByImpersonationUserId
		}
	});

	return sessionToken;
}

// Session validieren
export async function validateSession(sessionToken: string) {
	const session = await prisma.session.findUnique({
		where: { sessionToken },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					image: true,
					emailVerified: true,
					emailVerifiedAt: true,
					identityVerified: true,
					role: true,
					supportPin: true,
					isActive: true,
					twoFactorEnabled: true
				}
			}
		}
	});

	if (!session) return null;

	// Prüfe ob Session abgelaufen ist
	if (session.expires < new Date()) {
		await prisma.session.delete({
			where: { sessionToken }
		});
		return null;
	}

	return session;
}

// Session löschen (Logout)
export async function deleteSession(sessionToken: string) {
	return prisma.session.delete({
		where: { sessionToken }
	});
}

// Authentifizierter User aus Session
export type AuthUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	image: string | null;
	emailVerified: boolean;
	emailVerifiedAt: Date | null;
	identityVerified: boolean;
	role: 'USER' | 'SALES_TEAM' | 'SUPPORT_TEAM' | 'TECHNICIAN' | 'MANAGEMENT' | 'FOUNDER';
	supportPin: string | null;
	isActive: boolean;
	twoFactorEnabled: boolean;
};

export async function authenticateUser(
	email: string,
	password: string
): Promise<AuthUser | null> {
	const user = await findUserByEmail(email);

	if (!user) return null;

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) return null;

	const u = user as any;

	return {
		id: u.id,
		email: u.email,
		firstName: u.firstName,
		lastName: u.lastName,
		image: u.image,
		emailVerified: u.emailVerified,
		emailVerifiedAt: u.emailVerifiedAt,
		identityVerified: u.identityVerified ?? false,
		role: u.role,
		supportPin: u.supportPin,
		isActive: u.isActive,
		twoFactorEnabled: u.twoFactorEnabled ?? false
	};
}

