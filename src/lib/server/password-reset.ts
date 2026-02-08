import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { hashPassword } from './auth';
import { findUserByEmail } from './auth';
import { sendPasswordResetEmail } from './email';

const RESET_TOKEN_EXPIRY_HOURS = 1;

function generateResetToken(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Erstellt einen Passwort-Reset-Token für die angegebene E-Mail und sendet die E-Mail.
 * Gibt immer success zurück (kein Hinweis, ob die E-Mail existiert).
 */
export async function requestPasswordReset(email: string): Promise<{ success: true } | { success: false; error: string }> {
	const user = await findUserByEmail(email);
	if (!user) {
		// Aus Sicherheitsgründen keine Meldung, dass die E-Mail unbekannt ist
		return { success: true };
	}

	const token = generateResetToken();
	const expires = new Date();
	expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

	await prisma.user.update({
		where: { id: user.id },
		data: {
			passwordResetToken: token,
			passwordResetTokenExpires: expires
		}
	});

	const u = user as { firstName?: string; lastName?: string };
	const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || undefined;
	const sent = await sendPasswordResetEmail(user.email, token, name);

	if (!sent.success) {
		// Token wieder entfernen bei Versandfehler
		await prisma.user.update({
			where: { id: user.id },
			data: { passwordResetToken: null, passwordResetTokenExpires: null }
		});
		return { success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen.' };
	}

	return { success: true };
}

/**
 * Setzt das Passwort mit dem gültigen Token und löscht den Token.
 */
export async function resetPasswordWithToken(
	token: string,
	newPassword: string
): Promise<{ success: true } | { success: false; error: string }> {
	if (!token || token.length < 10) {
		return { success: false, error: 'Ungültiger oder abgelaufener Link.' };
	}

	const user = await prisma.user.findUnique({
		where: { passwordResetToken: token }
	});

	if (!user) {
		return { success: false, error: 'Ungültiger oder abgelaufener Link.' };
	}

	if (!user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
		await prisma.user.update({
			where: { id: user.id },
			data: { passwordResetToken: null, passwordResetTokenExpires: null }
		});
		return { success: false, error: 'Der Link ist abgelaufen. Bitte fordere einen neuen Link an.' };
	}

	if (!newPassword || newPassword.length < 8) {
		return { success: false, error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
	}

	const hashedPassword = await hashPassword(newPassword);

	await prisma.user.update({
		where: { id: user.id },
		data: {
			password: hashedPassword,
			passwordResetToken: null,
			passwordResetTokenExpires: null
		}
	});

	return { success: true };
}
