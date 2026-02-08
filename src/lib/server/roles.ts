import type { UserRole } from '@prisma/client';

/**
 * Rollen-Hierarchie (höhere Nummer = mehr Rechte)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
	USER: 0,
	SALES_TEAM: 1,
	SUPPORT_TEAM: 2,
	TECHNICIAN: 3,
	MANAGEMENT: 4,
	FOUNDER: 5
};

/**
 * Prüft ob User mindestens eine bestimmte Rolle hat
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Prüft ob User Admin-Rechte hat (Management oder Founder)
 */
export function isAdmin(userRole: UserRole): boolean {
	return hasRole(userRole, 'MANAGEMENT');
}

/**
 * Prüft ob User Team-Mitglied ist (alle außer USER)
 */
export function isTeamMember(userRole: UserRole): boolean {
	return userRole !== 'USER';
}

/**
 * Prüft ob User Techniker-Dashboard nutzen darf (TECHNICIAN, MANAGEMENT, FOUNDER)
 */
export function isTechnician(userRole: UserRole): boolean {
	return hasRole(userRole, 'TECHNICIAN');
}

/**
 * Generiert einen 6-stelligen Support-PIN
 */
export function generateSupportPin(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

