import type { UserRole } from '@prisma/client';
import { TEAM_STRUCTURE } from './team-structure';

/**
 * Prisma UserRole – Rollen-Namen für UI (USER bleibt Kunde)
 */
export const ROLE_NAMES: Record<UserRole, string> = {
	USER: 'Kunde',
	SALES_TEAM: 'Sales Team',
	SUPPORT_TEAM: 'Support Team',
	TECHNICIAN: 'Techniker',
	MANAGEMENT: 'Management',
	FOUNDER: 'Founder'
};

/**
 * Prisma UserRole – Rollen-Farben für Badges
 */
export const ROLE_COLORS: Record<UserRole, string> = {
	USER: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
	SALES_TEAM: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
	SUPPORT_TEAM: 'bg-green-500/10 text-green-700 dark:text-green-400',
	TECHNICIAN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
	MANAGEMENT: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
	FOUNDER: 'bg-red-500/10 text-red-700 dark:text-red-400'
};

/** Farben pro Team-Kategorie (für offizielle Team-Rollen) */
const TEAM_CATEGORY_COLORS: Record<string, string> = {
	leadership: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40',
	technical: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/40',
	support: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40',
	'sales-marketing': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/40',
	'admin-org': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/40'
};

/**
 * Offizielle Team-Rollen (Titel) – alle Positionen aus der Team-Struktur
 */
export const TEAM_POSITION_NAMES: Record<string, string> = Object.fromEntries(
	TEAM_STRUCTURE.flatMap((cat) => cat.roles.map((r) => [r.id, r.title]))
);

/**
 * Offizielle Team-Rollen – Badge-Farben (nach Kategorie)
 */
export const TEAM_POSITION_COLORS: Record<string, string> = Object.fromEntries(
	TEAM_STRUCTURE.flatMap((cat) =>
		cat.roles.map((r) => [r.id, TEAM_CATEGORY_COLORS[cat.id] ?? 'bg-muted text-muted-foreground border-border'])
	)
);

/** Name für eine Rolle (Prisma UserRole oder Team-Position-ID) – USER bleibt „Kunde“ */
export function getRoleDisplayName(roleOrPositionId: string): string {
	return ROLE_NAMES[roleOrPositionId as UserRole] ?? TEAM_POSITION_NAMES[roleOrPositionId] ?? roleOrPositionId;
}

/** Badge-Klasse für eine Rolle (Prisma UserRole oder Team-Position-ID) */
export function getRoleColor(roleOrPositionId: string): string {
	return ROLE_COLORS[roleOrPositionId as UserRole] ?? TEAM_POSITION_COLORS[roleOrPositionId] ?? 'bg-muted text-muted-foreground border-border';
}

// Re-Export Team-Struktur für zentrale Nutzung
export { TEAM_STRUCTURE, ALL_TEAM_ROLE_IDS, getTeamRoleById } from './team-structure';
export type { TeamRole, TeamCategory } from './team-structure';

