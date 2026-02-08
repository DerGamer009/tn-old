/**
 * Karriere-Stellen: Definitionen für Liste, Detail-Seite und Bewerbungsformular.
 */

export type ApplicationQuestion = {
	id: string;
	label: string;
	type: 'text' | 'textarea' | 'number' | 'select';
	placeholder?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
};

export type Job = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	requirements: string[];
	benefits: string[];
	tags: string[];
	employmentType: string;
	location: string;
	/** Zusätzliche Fragen im Bewerbungsformular (bereichsspezifisch) */
	applicationQuestions: ApplicationQuestion[];
};

export const jobs: Job[] = [
	{
		slug: 'support-engineer',
		title: 'Support Engineer (m/w/d)',
		shortDescription: 'Du hilfst unseren Kunden bei technischen Fragen und sorgst für erstklassigen Support.',
		description: `
			Als Support Engineer bist du die erste Anlaufstelle für unsere Kunden. Du beantwortest technische Anfragen per Ticket und Chat, löst Probleme mit Hosting, Domains und Server-Konfiguration und arbeitest eng mit dem Technik-Team zusammen, um wiederkehrende Themen zu verbessern.
		`,
		requirements: [
			'Erfahrung im Kunden- oder Technik-Support',
			'Sicheres Deutsch und gutes Englisch in Wort und Schrift',
			'Grundverständnis von Linux, Webservern und Hosting',
			'Geduld und kommunikative Stärke',
			'Bereitschaft zu Schichtarbeit (24/7-Support)',
		],
		benefits: [
			'Remote-Arbeit von überall',
			'Weiterbildung im Hosting-Bereich',
			'Enge Zusammenarbeit mit Entwicklung und DevOps',
		],
		tags: ['Support', '24/7', 'Remote'],
		employmentType: 'Vollzeit',
		location: 'Remote',
		applicationQuestions: [
			{ id: 'support_experience', label: 'Wie viele Jahre Erfahrung hast du im Kunden- oder Technik-Support?', type: 'text', required: true, placeholder: 'z.B. 2 Jahre' },
			{ id: 'ticket_tools', label: 'Mit welchen Ticket- oder Support-Systemen hast du bereits gearbeitet?', type: 'text', placeholder: 'z.B. Zendesk, Freshdesk, interner Chat' },
			{ id: 'hosting_knowledge', label: 'Welche Kenntnisse hast du im Bereich Hosting, Domains oder Server?', type: 'textarea', required: true, placeholder: 'Kurze Beschreibung deiner Erfahrung' },
			{ id: 'shift_ready', label: 'Bist du bereit für Schichtarbeit (inkl. Abend/Wochenende) im 24/7-Support?', type: 'select', required: true, options: [{ value: 'ja', label: 'Ja' }, { value: 'eingeschraenkt', label: 'Eingeschränkt möglich' }, { value: 'nein', label: 'Nein' }] },
		],
	},
	{
		slug: 'backend-developer',
		title: 'Backend Developer (m/w/d)',
		shortDescription: 'Entwickle und optimiere unsere Backend-Systeme und APIs für tausende Kunden.',
		description: `
			Du arbeitest an unserem Billing-System, unseren APIs und der Integration mit Pterodactyl, Zahlungsanbietern und anderen Diensten. Sauberer Code, Tests und Dokumentation sind für dich selbstverständlich. Du arbeitest im Team mit Frontend und DevOps zusammen.
		`,
		requirements: [
			'Mehrjährige Erfahrung mit Node.js/TypeScript oder vergleichbaren Backend-Technologien',
			'Erfahrung mit PostgreSQL oder anderen relationalen Datenbanken',
			'Kenntnisse in REST-APIs und ggf. GraphQL',
			'Pragmatischer Umgang mit Legacy-Code und Refactoring',
			'Teamfähigkeit und strukturierte Kommunikation',
		],
		benefits: [
			'Moderner Tech-Stack (SvelteKit, Prisma, TypeScript)',
			'Eigenverantwortung und Mitsprache bei Architekturentscheidungen',
			'Weiterbildungsbudget und Konferenzbesuche',
		],
		tags: ['Node.js', 'TypeScript', 'PostgreSQL'],
		employmentType: 'Vollzeit',
		location: 'Remote',
		applicationQuestions: [
			{ id: 'years_backend', label: 'Wie viele Jahre Berufserfahrung hast du im Backend-Entwicklung?', type: 'text', required: true, placeholder: 'z.B. 3 Jahre' },
			{ id: 'tech_stack', label: 'Mit welchen Backend-Technologien/Frameworks hast du zuletzt gearbeitet?', type: 'text', required: true, placeholder: 'z.B. Node.js, Express, NestJS, Prisma' },
			{ id: 'github_portfolio', label: 'Link zu GitHub, GitLab oder Portfolio (optional)', type: 'text', placeholder: 'https://...' },
			{ id: 'api_experience', label: 'Beschreibe kurz eine API oder ein Backend-Projekt, an dem du mitgewirkt hast.', type: 'textarea', required: true, placeholder: 'Kurze Beschreibung' },
		],
	},
	{
		slug: 'devops-engineer',
		title: 'DevOps Engineer (m/w/d)',
		shortDescription: 'Baue und warte unsere Infrastruktur und sorge für maximale Verfügbarkeit.',
		description: `
			Du kümmerst dich um Server, Container, CI/CD und Monitoring. Unser Stack umfasst Linux-Server, Docker, Pterodactyl und eigene Dienste. Du optimierst Stabilität, Skalierung und Sicherheit und arbeitest eng mit der Entwicklung zusammen.
		`,
		requirements: [
			'Erfahrung mit Linux-Serveradministration',
			'Praktische Kenntnisse in Docker und idealerweise Kubernetes',
			'Erfahrung mit CI/CD (z.B. GitHub Actions, GitLab CI)',
			'Grundkenntnisse in Netzwerken und Sicherheit',
			'Selbstständige, lösungsorientierte Arbeitsweise',
		],
		benefits: [
			'Verantwortung für reale Produktionsinfrastruktur',
			'Moderne Tools und Cloud-Dienste',
			'Austausch mit einem kleinen, fachstarken Team',
		],
		tags: ['Docker', 'Kubernetes', 'Linux'],
		employmentType: 'Vollzeit',
		location: 'Remote',
		applicationQuestions: [
			{ id: 'years_devops', label: 'Wie viele Jahre Erfahrung hast du in DevOps/Infrastruktur?', type: 'text', required: true, placeholder: 'z.B. 2 Jahre' },
			{ id: 'docker_kubernetes', label: 'Welche Erfahrung hast du mit Docker und/oder Kubernetes?', type: 'textarea', required: true, placeholder: 'Projekte, Umfang, Selbst- oder Team-Einschätzung' },
			{ id: 'monitoring', label: 'Mit welchen Monitoring- oder Logging-Tools hast du gearbeitet?', type: 'text', placeholder: 'z.B. Prometheus, Grafana, ELK' },
			{ id: 'incident_handling', label: 'Hast du Erfahrung mit On-Call oder Incident-Management?', type: 'select', options: [{ value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }, { value: 'grundkenntnisse', label: 'Grundkenntnisse' }] },
		],
	},
	{
		slug: 'sales-representative',
		title: 'Sales Representative (m/w/d)',
		shortDescription: 'Akquiriere neue Kunden und baue langfristige Geschäftsbeziehungen auf.',
		description: `
			Du betreuest B2B-Kunden und Neukunden, führst Beratungsgespräche zu Hosting- und Server-Produkten und arbeitest an der Erreichung von Vertriebszielen. Du arbeitest mit unserem CRM und tauschst dich mit Support und Technik ab, um passende Lösungen anzubieten.
		`,
		requirements: [
			'Erfahrung im Vertrieb, idealerweise B2B oder IT/Hosting',
			'Sicheres Auftreten in Gesprächen und Präsentationen',
			'Zielorientierung und strukturierte Arbeitsweise',
			'Gute Kenntnisse in Deutsch und Englisch',
			'Interesse an technischen Produkten (Hosting, Server)',
		],
		benefits: [
			'Attraktive Vergütung mit variablem Anteil',
			'Remote-Möglichkeit und flexible Arbeitszeiten',
			'Einarbeitung in Produkte und Zielgruppen',
		],
		tags: ['Sales', 'B2B'],
		employmentType: 'Vollzeit',
		location: 'Remote',
		applicationQuestions: [
			{ id: 'years_sales', label: 'Wie viele Jahre Erfahrung hast du im Vertrieb?', type: 'text', required: true, placeholder: 'z.B. 3 Jahre' },
			{ id: 'b2b_experience', label: 'Hast du bereits B2B- oder IT-Vertriebserfahrung? Bitte kurz beschreiben.', type: 'textarea', required: true, placeholder: 'Branche, Produkte, Kundenkreis' },
			{ id: 'crm_tools', label: 'Mit welchen CRM- oder Vertriebstools hast du gearbeitet?', type: 'text', placeholder: 'z.B. Salesforce, HubSpot, Pipedrive' },
			{ id: 'sales_achievement', label: 'Beschreibe kurz deinen größten Vertriebserfolg oder ein Projekt, auf das du stolz bist.', type: 'textarea', placeholder: 'Kurze Beschreibung' },
		],
	},
];

export function getJobBySlug(slug: string): Job | undefined {
	return jobs.find((j) => j.slug === slug);
}

export function getAllJobSlugs(): string[] {
	return jobs.map((j) => j.slug);
}
