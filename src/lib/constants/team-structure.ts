/**
 * Offizielle TitanNode Team-Struktur (Rollen & Beschreibungen).
 * Verwendung: Our Team Seite, Admin Team-Verwaltung, Karriere.
 */

export type TeamRole = {
	id: string;
	title: string;
	description: string;
};

export type TeamCategory = {
	id: string;
	name: string;
	icon: string;
	roles: TeamRole[];
};

/** Alle offiziellen Team-Kategorien und Rollen */
export const TEAM_STRUCTURE: TeamCategory[] = [
	{
		id: 'leadership',
		name: 'Unternehmensleitung',
		icon: 'tabler:building',
		roles: [
			{ id: 'founder', title: 'Founder', description: 'Gründer von TitanNode. Trifft alle strategischen und organisatorischen Entscheidungen.' },
			{ id: 'co-founder', title: 'Co-Founder', description: 'Mitgründer von TitanNode. Unterstützt den Founder bei Leitung und Entwicklung des Unternehmens.' },
			{ id: 'coo', title: 'COO (Operations)', description: 'Leitet den operativen Betrieb und sorgt für reibungslose interne Abläufe.' },
			{ id: 'cto', title: 'CTO (Technik)', description: 'Verantwortlich für die gesamte technische Infrastruktur, Systeme und Weiterentwicklung.' },
			{ id: 'cfo', title: 'CFO (Finanzen)', description: 'Zuständig für Buchhaltung, Abrechnung, Budgets und finanzielle Planung.' }
		]
	},
	{
		id: 'technical',
		name: 'Technisches Team',
		icon: 'tabler:tool',
		roles: [
			{ id: 'head-of-infrastructure', title: 'Head of Infrastructure', description: 'Leitet das technische Kernteam und überwacht Server, Netzwerke und Systeme.' },
			{ id: 'senior-technician', title: 'Senior Technician', description: 'Erfahrener Techniker für komplexe technische Probleme und Systemoptimierungen.' },
			{ id: 'junior-technician', title: 'Junior Technician', description: 'Unterstützt das Technikteam bei Wartung, Einrichtung und Fehlerbehebung.' },
			{ id: 'system-administrator', title: 'System Administrator', description: 'Verwaltet Server, Betriebssysteme, Virtualisierung und Systemdienste.' },
			{ id: 'network-administrator', title: 'Network Administrator', description: 'Zuständig für Netzwerke, Firewalls, DDoS-Schutz und Routing.' },
			{ id: 'security-engineer', title: 'Security Engineer', description: 'Sorgt für Sicherheit, Monitoring, Schutz vor Angriffen und Schwachstellenanalyse.' },
			{ id: 'devops-engineer', title: 'DevOps Engineer', description: 'Automatisierung, Deployments, CI/CD, Monitoring und Performance-Optimierung.' },
			{ id: 'monitoring-team', title: 'Monitoring Team', description: 'Überwacht Server und Dienste rund um die Uhr und meldet Störungen.' },
			{ id: 'backup-recovery-team', title: 'Backup & Recovery Team', description: 'Verantwortlich für Backups, Wiederherstellung und Datensicherheit.' }
		]
	},
	{
		id: 'support',
		name: 'Support & Kundenservice',
		icon: 'tabler:headset',
		roles: [
			{ id: 'head-of-support', title: 'Head of Support', description: 'Leitet das Support-Team und ist verantwortlich für Qualität und Prozesse.' },
			{ id: 'senior-support', title: 'Senior Support', description: 'Erfahrener Support für komplexe Kundenanfragen und Eskalationen.' },
			{ id: 'support', title: 'Support', description: 'Erster Ansprechpartner für Kunden bei Fragen, Problemen und Tickets.' },
			{ id: 'trial-support', title: 'Trial Support', description: 'Support für neue Kunden und Testphasen.' },
			{ id: 'ticket-manager', title: 'Ticket Manager', description: 'Koordiniert Support-Tickets und sorgt für strukturierte Bearbeitung.' },
			{ id: 'live-chat-support', title: 'Live-Chat Support', description: 'Soforthilfe für Kunden über Live-Chat und Discord.' },
			{ id: 'night-shift-support', title: 'Night Shift Support', description: 'Support außerhalb der Hauptzeiten (Nachtbetrieb).' }
		]
	},
	{
		id: 'sales-marketing',
		name: 'Vertrieb & Marketing',
		icon: 'tabler:chart-line',
		roles: [
			{ id: 'head-of-sales', title: 'Head of Sales', description: 'Leitet Vertrieb und Verkaufsstrategien.' },
			{ id: 'sales-manager', title: 'Sales Manager', description: 'Betreut Kunden, Angebote und Vertragsabschlüsse.' },
			{ id: 'sales-agent', title: 'Sales Agent', description: 'Berät Interessenten und unterstützt beim Produktverkauf.' },
			{ id: 'affiliate-manager', title: 'Affiliate Manager', description: 'Betreut Partner, Affiliates und Provisionsprogramme.' },
			{ id: 'marketing-manager', title: 'Marketing Manager', description: 'Plant und steuert Marketing- und Werbemaßnahmen.' },
			{ id: 'social-media-manager', title: 'Social Media Manager', description: 'Verwaltet Social-Media-Kanäle und Community-Interaktion.' },
			{ id: 'community-manager', title: 'Community Manager', description: 'Pflegt die Community, moderiert und organisiert Events.' },
			{ id: 'partnership-manager', title: 'Partnership Manager', description: 'Verantwortlich für Kooperationen und externe Partner.' }
		]
	},
	{
		id: 'admin-org',
		name: 'Verwaltung & Organisation',
		icon: 'tabler:clipboard-list',
		roles: [
			{ id: 'hr-manager', title: 'HR Manager', description: 'Zuständig für Teammanagement, Bewerbungen und Personalorganisation.' },
			{ id: 'recruitment-team', title: 'Recruitment Team', description: 'Sichtet Bewerbungen und führt Auswahlprozesse durch.' },
			{ id: 'qa', title: 'Quality Assurance (QA)', description: 'Überprüft Service-Qualität, Prozesse und Kundenzufriedenheit.' },
			{ id: 'compliance-manager', title: 'Compliance Manager', description: 'Achtet auf Regeln, Richtlinien und rechtliche Vorgaben.' },
			{ id: 'finance-team', title: 'Finance Team', description: 'Unterstützt bei Rechnungen, Zahlungen und Buchhaltung.' },
			{ id: 'billing-support', title: 'Billing Support', description: 'Hilft Kunden bei Rechnungen, Zahlungen und Abrechnungsfragen.' }
		]
	}
];

/** Alle Rollen-IDs (flach) für Dropdowns/Validierung */
export const ALL_TEAM_ROLE_IDS = TEAM_STRUCTURE.flatMap((c) => c.roles.map((r) => r.id));

/** Rolle anhand ID finden */
export function getTeamRoleById(roleId: string): TeamRole | undefined {
	for (const cat of TEAM_STRUCTURE) {
		const role = cat.roles.find((r) => r.id === roleId);
		if (role) return role;
	}
	return undefined;
}
