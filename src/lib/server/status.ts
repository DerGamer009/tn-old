import { prisma } from './prisma';
import type { ServiceStatus, IncidentStatus, IncidentSeverity } from '@prisma/client';

// Services abrufen
export async function getSystemServices() {
	return await prisma.systemService.findMany({
		where: { isActive: true },
		orderBy: { displayOrder: 'asc' },
		include: {
			metrics: {
				orderBy: { date: 'desc' },
				take: 1 // Neueste Metrik
			}
		}
	});
}

// Incidents abrufen
export async function getStatusIncidents(limit = 10) {
	return await prisma.statusIncident.findMany({
		take: limit,
		orderBy: { startedAt: 'desc' },
		include: {
			affectedServices: {
				select: {
					name: true,
					slug: true
				}
			},
			updates: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});
}

// Aktuelle Incidents (nicht resolved/completed)
export async function getActiveIncidents() {
	return await prisma.statusIncident.findMany({
		where: {
			status: {
				notIn: ['RESOLVED', 'COMPLETED']
			}
		},
		orderBy: { startedAt: 'desc' },
		include: {
			affectedServices: {
				select: {
					name: true,
					slug: true
				}
			}
		}
	});
}

// Gesamtstatus berechnen
export async function getOverallStatus(): Promise<{
	status: ServiceStatus;
	message: string;
	operationalCount: number;
	totalCount: number;
}> {
	const services = await prisma.systemService.findMany({
		where: { isActive: true }
	});

	const totalCount = services.length;
	const operationalCount = services.filter(s => s.status === 'OPERATIONAL').length;
	const majorOutages = services.filter(s => s.status === 'MAJOR_OUTAGE').length;
	const partialOutages = services.filter(s => s.status === 'PARTIAL_OUTAGE').length;
	const degraded = services.filter(s => s.status === 'DEGRADED').length;
	const maintenance = services.filter(s => s.status === 'MAINTENANCE').length;

	let status: ServiceStatus = 'OPERATIONAL';
	let message = 'Alle Systeme betriebsbereit';

	if (majorOutages > 0) {
		status = 'MAJOR_OUTAGE';
		message = 'Größere Störung bei mehreren Services';
	} else if (partialOutages > 0) {
		status = 'PARTIAL_OUTAGE';
		message = 'Teilweise Ausfälle bei einigen Services';
	} else if (degraded > 0) {
		status = 'DEGRADED';
		message = 'Einige Services sind beeinträchtigt';
	} else if (maintenance > 0) {
		status = 'MAINTENANCE';
		message = 'Planmäßige Wartungsarbeiten';
	}

	return {
		status,
		message,
		operationalCount,
		totalCount
	};
}

// Service-Status aktualisieren
export async function updateServiceStatus(
	serviceSlug: string,
	status: ServiceStatus
) {
	return await prisma.systemService.update({
		where: { slug: serviceSlug },
		data: { status }
	});
}

// Neues Incident erstellen
export async function createIncident(data: {
	title: string;
	description: string;
	severity: IncidentSeverity;
	status: IncidentStatus;
	affectedServiceSlugs: string[];
}) {
	return await prisma.statusIncident.create({
		data: {
			title: data.title,
			description: data.description,
			severity: data.severity,
			status: data.status,
			affectedServices: {
				connect: data.affectedServiceSlugs.map(slug => ({ slug }))
			}
		}
	});
}

// Incident-Update hinzufügen
export async function addIncidentUpdate(
	incidentId: string,
	message: string,
	status: IncidentStatus
) {
	return await prisma.incidentUpdate.create({
		data: {
			incidentId,
			message,
			status
		}
	});
}

// Incident als gelöst markieren
export async function resolveIncident(incidentId: string) {
	return await prisma.statusIncident.update({
		where: { id: incidentId },
		data: {
			status: 'RESOLVED',
			resolvedAt: new Date()
		}
	});
}

// Service-Metriken hinzufügen
export async function addServiceMetric(
	serviceSlug: string,
	uptime: number,
	responseTime: number
) {
	const service = await prisma.systemService.findUnique({
		where: { slug: serviceSlug }
	});

	if (!service) throw new Error('Service not found');

	return await prisma.serviceMetric.create({
		data: {
			serviceId: service.id,
			uptime,
			responseTime
		}
	});
}

// 90-Tage Uptime-Daten
export async function getUptimeHistory(serviceSlug: string, days = 90) {
	const service = await prisma.systemService.findUnique({
		where: { slug: serviceSlug }
	});

	if (!service) return [];

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	return await prisma.serviceMetric.findMany({
		where: {
			serviceId: service.id,
			date: {
				gte: startDate
			}
		},
		orderBy: { date: 'asc' }
	});
}

