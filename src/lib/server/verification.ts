import { prisma } from './prisma';
import { randomBytes } from 'crypto';

/**
 * Generiert einen eindeutigen Verification-Token
 */
export function generateVerificationToken(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Erstellt einen Verification-Token für einen User
 */
export async function createVerificationToken(userId: string): Promise<string> {
	const token = generateVerificationToken();

	await prisma.user.update({
		where: { id: userId },
		data: {
			emailVerificationToken: token,
			emailVerificationTokenCreatedAt: new Date()
		}
	});

	return token;
}

/**
 * Verifiziert einen User anhand des Tokens
 */
export async function verifyEmail(token: string) {
	const user = await prisma.user.findUnique({
		where: { emailVerificationToken: token }
	});

	if (!user) {
		return { success: false, error: 'Ungültiger oder abgelaufener Token' };
	}

	// Token ist älter als 24 Stunden?
	if (user.emailVerificationTokenCreatedAt) {
		const tokenAge = Date.now() - user.emailVerificationTokenCreatedAt.getTime();
		if (tokenAge > 24 * 60 * 60 * 1000) {
			return { success: false, error: 'Token ist abgelaufen (24 Stunden überschritten)' };
		}
	}

	// Email als verifiziert markieren
	await prisma.user.update({
		where: { id: user.id },
		data: {
			emailVerified: true,
			emailVerifiedAt: new Date(),
			emailVerificationToken: null, // Token löschen
			emailVerificationTokenCreatedAt: null // Timestamp auch löschen
		}
	});

	return { success: true, user };
}

/**
 * Prüft ob ein User vollständig verifiziert ist (Email + Identity)
 */
export async function isUserFullyVerified(userId: string): Promise<boolean> {
	// Cast zu `any`, da das Prisma-Typmodell evtl. noch keine erweiterten Felder kennt
	const user = await (prisma as any).user.findUnique({
		where: { id: userId },
		select: {
			emailVerified: true,
			identityVerified: true
		}
	});

	return user ? user.emailVerified && !!user.identityVerified : false;
}

/**
 * Speichert die Stripe Identity Session ID
 */
export async function saveStripeIdentitySession(
	userId: string,
	sessionId: string
): Promise<void> {
	await (prisma as any).user.update({
		where: { id: userId },
		data: {
			stripeIdentitySessionId: sessionId
		}
	});
}

/**
 * Markiert die Identität als verifiziert
 */
export async function markIdentityVerified(userId: string): Promise<void> {
	await (prisma as any).user.update({
		where: { id: userId },
		data: {
			identityVerified: true,
			identityVerifiedAt: new Date()
		}
	});
}

