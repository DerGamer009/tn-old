/**
 * Pterodactyl API Client
 * Integration für App Hosting über die Pterodactyl API
 * Dokumentation: https://dashflo.net/docs/api/pterodactyl/v1/
 */

const PTERODACTYL_API_BASE = process.env.PTERODACTYL_API_BASE || 'https://cp.titannode.org';
const PTERODACTYL_ADMIN_KEY = process.env.PTERODACTYL_ADMIN_KEY || '';
const PTERODACTYL_USER_KEY = process.env.PTERODACTYL_USER_KEY || '';
/** Wenn gesetzt: Ein Pterodactyl-User besitzt alle Server; PTERODACTYL_USER_KEY ist dessen Client-Key. Power/Upload funktionieren dann für alle Kunden. */
const PTERODACTYL_SERVICE_USER_ID = process.env.PTERODACTYL_SERVICE_USER_ID
	? parseInt(process.env.PTERODACTYL_SERVICE_USER_ID, 10)
	: undefined;

// Beim Start ausgeben, welche Base-URL geladen wurde (hilft bei .env-Diskrepanzen)
if (process.env.DEBUG === 'true') {
	console.log('[Pterodactyl] PTERODACTYL_API_BASE =', PTERODACTYL_API_BASE);
}

// API Endpunkte
const PTERODACTYL_ADMIN_API = `${PTERODACTYL_API_BASE}/api/application`;
const PTERODACTYL_USER_API = `${PTERODACTYL_API_BASE}/api/client`;

interface PterodactylApiResponse<T> {
	data?: T;
	attributes?: T;
	meta?: {
		pagination?: {
			total?: number;
			count?: number;
			per_page?: number;
			current_page?: number;
			total_pages?: number;
		};
	};
	errors?: Array<{
		code: string;
		status: string;
		detail: string;
	}>;
}

class PterodactylApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: unknown
	) {
		super(message);
		this.name = 'PterodactylApiError';
	}
}

/**
 * Führt einen API-Request an die Pterodactyl API aus
 */
async function pterodactylRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	useAdminKey: boolean = true
): Promise<T> {
	const apiKey = useAdminKey ? PTERODACTYL_ADMIN_KEY : PTERODACTYL_USER_KEY;

	if (!apiKey) {
		throw new Error('PTERODACTYL_ADMIN_KEY oder PTERODACTYL_USER_KEY muss gesetzt sein');
	}

	// Verwende Admin API oder User API basierend auf useAdminKey
	const apiBase = useAdminKey ? PTERODACTYL_ADMIN_API : PTERODACTYL_USER_API;
	const url = `${apiBase}${endpoint}`;

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				...options.headers,
			},
		});

		if (response.status === 204) {
			return undefined as T;
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			
			if (process.env.DEBUG === 'true') {
				console.error(`❌ Pterodactyl API Request fehlgeschlagen: ${response.status} ${response.statusText}`);
				console.error(`   URL: ${endpoint}`);
				console.error(`   Error:`, errorData);
			}

			if (response.status === 401) {
				throw new PterodactylApiError(
					`Authentifizierung fehlgeschlagen (401). Bitte prüfe den API-Key.`,
					response.status,
					errorData
				);
			}

			const errorMessage = errorData.errors?.[0]?.detail || 
			                     errorData.message || 
			                     `API request failed: ${response.statusText}`;

			throw new PterodactylApiError(
				errorMessage,
				response.status,
				errorData
			);
		}

		const data = await response.json();

		// Pterodactyl gibt Daten oft in einem `data` Feld zurück
		if (data.data !== undefined) {
			return data.data as T;
		}

		if (data.attributes !== undefined) {
			return data.attributes as T;
		}

		// Wenn es direkt die erwartete Struktur ist
		return data as T;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		const msg = error instanceof Error ? error.message : 'Unknown error';
		const err = error as NodeJS.ErrnoException;
		// Netzwerkfehler
		if (msg === 'fetch failed' || err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.code === 'ETIMEDOUT') {
			throw new PterodactylApiError(
				`Netzwerkfehler: Pterodactyl API nicht erreichbar (${err?.code || msg}). Prüfe PTERODACTYL_API_BASE (${PTERODACTYL_API_BASE}) und ob der Dienst erreichbar ist.`,
				undefined,
				undefined
			);
		}
		throw new PterodactylApiError(`Pterodactyl API Fehler: ${msg}`, undefined, undefined);
	}
}

/** Volle API-Antwort (attributes + relationships) für einzelne Ressourcen */
async function pterodactylRequestRaw(
	endpoint: string,
	useAdminKey: boolean = true
): Promise<Record<string, unknown>> {
	const apiKey = useAdminKey ? PTERODACTYL_ADMIN_KEY : PTERODACTYL_USER_KEY;
	if (!apiKey) throw new Error('PTERODACTYL_ADMIN_KEY oder PTERODACTYL_USER_KEY muss gesetzt sein');
	const apiBase = useAdminKey ? PTERODACTYL_ADMIN_API : PTERODACTYL_USER_API;
	const url = `${apiBase}${endpoint}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Accept': 'application/json'
		}
	});
	if (response.status === 204) return {};
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new PterodactylApiError(
			(errorData as any)?.errors?.[0]?.detail ?? `Request failed: ${response.statusText}`,
			response.status,
			errorData
		);
	}
	return response.json();
}

/**
 * Pterodactyl User Interface
 */
export interface PterodactylUser {
	id: number;
	external_id: string | null;
	uuid: string;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	language: string;
	root_admin: boolean;
	'2fa_enabled': boolean;
	created_at: string;
	updated_at: string;
}

/**
 * Pterodactyl Server Interface
 */
export interface PterodactylServer {
	id: number;
	external_id: string | null;
	uuid: string;
	identifier: string;
	name: string;
	description: string;
	status: string | null;
	suspended: boolean;
	limits: {
		memory: number; // in MB
		swap: number; // in MB
		disk: number; // in MB
		io: number;
		cpu: number; // in Prozent (100 = 1 Core)
	};
	feature_limits: {
		databases: number;
		allocations: number;
		backups: number;
	};
	user: number; // User ID
	node: number; // Node ID
	allocation: number; // Allocation ID
	nest: number; // Nest ID
	egg: number; // Egg ID
	container: {
		startup_command: string;
		image: string;
		installed: number;
		environment: Record<string, string>;
	};
	created_at: string;
	updated_at: string;
}

/**
 * Erstellt oder findet einen Pterodactyl User
 */
export async function createOrFindPterodactylUser(
	email: string,
	firstName: string,
	lastName: string,
	externalId?: string
): Promise<PterodactylUser> {
	try {
		// Versuche zuerst nach externer ID zu suchen
		if (externalId) {
			try {
				const users = await pterodactylRequest<PterodactylApiResponse<PterodactylUser[]>>(
					`/users?filter[external_id]=${externalId}`,
					{ method: 'GET' }
				);
				
				if (Array.isArray(users) && users.length > 0) {
					return users[0];
				}

				// Prüfe ob es in data.attributes oder data.data ist
				const response = users as any;
				if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
					return response.data[0];
				}
			} catch (error) {
				// Externe ID nicht gefunden, erstelle neuen User
			}
		}

		// Versuche nach E-Mail zu suchen
		try {
			const users = await pterodactylRequest<PterodactylApiResponse<PterodactylUser[]>>(
				`/users?filter[email]=${encodeURIComponent(email)}`,
				{ method: 'GET' }
			);
			
			if (Array.isArray(users) && users.length > 0) {
				return users[0];
			}

			const response = users as any;
			if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
				return response.data[0];
			}
		} catch (error) {
			// E-Mail nicht gefunden, erstelle neuen User
		}

		// Erstelle neuen User
		const userData = {
			email,
			username: email.split('@')[0] + '_' + Date.now().toString().slice(-6),
			first_name: firstName,
			last_name: lastName,
			external_id: externalId || undefined,
			password: generateRandomPassword(),
			root_admin: false,
			language: 'de'
		};

		const newUser = await pterodactylRequest<PterodactylUser>(
			'/users',
			{
				method: 'POST',
				body: JSON.stringify(userData),
			}
		);

		return newUser;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to create/find Pterodactyl user: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Generiert ein sicheres zufälliges Passwort
 */
function generateRandomPassword(length: number = 16): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
	let password = '';
	for (let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

/**
 * Ruft alle Pterodactyl Locations ab (Application API)
 */
export async function getPterodactylLocations(): Promise<Array<{ id: number; short: string; long?: string }>> {
	try {
		const response = await pterodactylRequest<any>('/locations', { method: 'GET' }, true);
		const list = Array.isArray(response) ? response : response?.data ?? [];
		return list.map((loc: any) => {
			const attrs = loc.attributes ?? loc;
			return {
				id: attrs.id ?? loc.id,
				short: attrs.short ?? '',
				long: attrs.long ?? attrs.name
			};
		});
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Failed to get Pterodactyl locations: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Pterodactyl Node (Application API)
 */
export interface PterodactylNode {
	id: number;
	uuid: string;
	name: string;
	description: string | null;
	locationId: number;
	fqdn: string;
	scheme: string;
	maintenanceMode: boolean;
	memory: number;
	memoryOverallocate: number;
	disk: number;
	diskOverallocate: number;
	allocatedMemory: number;
	allocatedDisk: number;
	daemonListen: number;
	daemonSftp: number;
	createdAt: string;
	updatedAt: string;
}

/** Einzelne Node mit optionalen Relationen (für Detailseite) */
export interface PterodactylNodeDetail extends PterodactylNode {
	location?: { id: number; short: string; long?: string };
	allocations?: Array<{ id: number; ip: string; port: number; assigned: boolean; notes?: string | null }>;
	servers?: Array<{ id: number; name: string; identifier: string; status?: string }>;
}

/**
 * Ruft alle Pterodactyl-Nodes ab (Application API)
 * Status: maintenance_mode → Wartung; ansonsten wird kein Online/Offline von der List-API geliefert.
 */
export async function getPterodactylNodes(): Promise<PterodactylNode[]> {
	try {
		const response = await pterodactylRequest<any>('/nodes?per_page=500', { method: 'GET' }, true);
		const list = Array.isArray(response) ? response : response?.data ?? [];
		return list.map((item: any) => {
			const a = item.attributes ?? item;
			const alloc = a.allocated_resources ?? a.allocatedResources ?? {};
			return {
				id: a.id ?? item.id,
				uuid: a.uuid ?? '',
				name: a.name ?? 'Unbekannt',
				description: a.description ?? null,
				locationId: a.location_id ?? a.locationId ?? 0,
				fqdn: a.fqdn ?? '',
				scheme: a.scheme ?? 'https',
				maintenanceMode: Boolean(a.maintenance_mode ?? a.maintenanceMode),
				memory: Number(a.memory ?? 0),
				memoryOverallocate: Number(a.memory_overallocate ?? a.memoryOverallocate ?? 0),
				disk: Number(a.disk ?? 0),
				diskOverallocate: Number(a.disk_overallocate ?? a.diskOverallocate ?? 0),
				allocatedMemory: Number(alloc.memory ?? 0),
				allocatedDisk: Number(alloc.disk ?? 0),
				daemonListen: Number(a.daemon_listen ?? a.daemonListen ?? 8080),
				daemonSftp: Number(a.daemon_sftp ?? a.daemonSftp ?? 2022),
				createdAt: a.created_at ?? a.createdAt ?? '',
				updatedAt: a.updated_at ?? a.updatedAt ?? ''
			};
		});
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Pterodactyl Nodes laden fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Erstellt einen neuen Node im Pterodactyl Panel (POST /api/application/nodes)
 */
export async function createPterodactylNode(data: {
	name: string;
	description?: string;
	locationId: number;
	fqdn: string;
	scheme?: 'http' | 'https';
	behindProxy?: boolean;
	public?: boolean;
	daemonBase?: string;
	daemonSftp?: number;
	daemonListen?: number;
	memory: number; // MB
	memoryOverallocate?: number;
	disk: number; // MB
	diskOverallocate?: number;
	uploadSize?: number;
	maintenanceMode?: boolean;
}): Promise<PterodactylNode> {
	try {
		const body = {
			name: data.name,
			description: data.description ?? '',
			location_id: data.locationId,
			fqdn: data.fqdn,
			scheme: data.scheme ?? 'https',
			behind_proxy: data.behindProxy ?? false,
			public: data.public ?? true,
			daemon_base: data.daemonBase ?? '/var/lib/pterodactyl/volumes',
			daemon_sftp: data.daemonSftp ?? 2022,
			daemon_listen: data.daemonListen ?? 8080,
			memory: data.memory,
			memory_overallocate: data.memoryOverallocate ?? 0,
			disk: data.disk,
			disk_overallocate: data.diskOverallocate ?? 0,
			upload_size: data.uploadSize ?? 100,
			maintenance_mode: data.maintenanceMode ?? false
		};
		const response = await pterodactylRequest<any>('/nodes', {
			method: 'POST',
			body: JSON.stringify(body)
		}, true);
		const raw = response?.attributes ?? response;
		const alloc = raw?.allocated_resources ?? raw?.allocatedResources ?? {};
		return {
			id: raw.id,
			uuid: raw.uuid ?? '',
			name: raw.name ?? data.name,
			description: raw.description ?? data.description ?? null,
			locationId: raw.location_id ?? raw.locationId ?? data.locationId,
			fqdn: raw.fqdn ?? data.fqdn,
			scheme: raw.scheme ?? data.scheme ?? 'https',
			maintenanceMode: Boolean(raw.maintenance_mode ?? raw.maintenanceMode),
			memory: Number(raw.memory ?? data.memory),
			memoryOverallocate: Number(raw.memory_overallocate ?? raw.memoryOverallocate ?? 0),
			disk: Number(raw.disk ?? data.disk),
			diskOverallocate: Number(raw.disk_overallocate ?? raw.diskOverallocate ?? 0),
			allocatedMemory: Number(alloc.memory ?? 0),
			allocatedDisk: Number(alloc.disk ?? 0),
			daemonListen: Number(raw.daemon_listen ?? raw.daemonListen ?? 8080),
			daemonSftp: Number(raw.daemon_sftp ?? raw.daemonSftp ?? 2022),
			createdAt: raw.created_at ?? raw.createdAt ?? '',
			updatedAt: raw.updated_at ?? raw.updatedAt ?? ''
		};
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Pterodactyl Node erstellen fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Ruft eine einzelne Pterodactyl-Node inkl. Allocations, Location, Servers ab (GET /nodes/{id})
 */
export async function getPterodactylNode(
	nodeId: number | string,
	opts?: { include?: string }
): Promise<PterodactylNodeDetail> {
	try {
		const include = opts?.include ?? 'allocations,location,servers';
		const raw = await pterodactylRequestRaw(`/nodes/${nodeId}?include=${include}`, true);
		const item = (raw?.attributes ?? raw) as any;
		const rel = (raw?.relationships ?? item?.relationships ?? {}) as Record<string, { attributes?: any; data?: any[] }>;
		const alloc = (item?.allocated_resources ?? item?.allocatedResources ?? {}) as any;
		const loc = rel.location?.attributes ?? rel.location as any;
		const allocList = rel.allocations?.data ?? rel.allocations ?? [];
		const serverList = rel.servers?.data ?? rel.servers ?? [];

		return {
			id: Number(item?.id ?? nodeId),
			uuid: String(item?.uuid ?? ''),
			name: String(item?.name ?? 'Unbekannt'),
			description: item?.description != null ? String(item.description) : null,
			locationId: Number(item?.location_id ?? item?.locationId ?? 0),
			fqdn: String(item?.fqdn ?? ''),
			scheme: String(item?.scheme ?? 'https'),
			maintenanceMode: Boolean(item?.maintenance_mode ?? item?.maintenanceMode),
			memory: Number(item?.memory ?? 0),
			memoryOverallocate: Number(item?.memory_overallocate ?? item?.memoryOverallocate ?? 0),
			disk: Number(item?.disk ?? 0),
			diskOverallocate: Number(item?.disk_overallocate ?? item?.diskOverallocate ?? 0),
			allocatedMemory: Number(alloc?.memory ?? 0),
			allocatedDisk: Number(alloc?.disk ?? 0),
			daemonListen: Number(item?.daemon_listen ?? item?.daemonListen ?? 8080),
			daemonSftp: Number(item?.daemon_sftp ?? item?.daemonSftp ?? 2022),
			createdAt: String(item?.created_at ?? item?.createdAt ?? ''),
			updatedAt: String(item?.updated_at ?? item?.updatedAt ?? ''),
			location: loc
				? {
						id: Number(loc?.id ?? 0),
						short: String(loc?.short ?? ''),
						long: String(loc?.long ?? loc?.name ?? '')
					}
				: undefined,
			allocations: Array.isArray(allocList)
				? allocList.map((a: any) => {
						const attrs = a.attributes ?? a;
						return {
							id: attrs.id ?? a.id,
							ip: attrs.ip ?? '',
							port: attrs.port ?? 0,
							assigned: Boolean(attrs.assigned),
							notes: attrs.notes ?? null
						};
					})
				: undefined,
			servers: Array.isArray(serverList)
				? serverList.map((s: any) => {
						const attrs = s.attributes ?? s;
						return {
							id: attrs.id ?? s.id,
							name: attrs.name ?? 'Unbekannt',
							identifier: attrs.identifier ?? '',
							status: attrs.status
						};
					})
				: undefined
		};
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Pterodactyl Node laden fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Aktualisiert eine Pterodactyl-Node (PATCH /nodes/{id}).
 */
export async function updatePterodactylNode(
	nodeId: number | string,
	data: {
		name?: string;
		description?: string;
		locationId?: number;
		fqdn?: string;
		scheme?: 'http' | 'https';
		behindProxy?: boolean;
		public?: boolean;
		memory?: number;
		memoryOverallocate?: number;
		disk?: number;
		diskOverallocate?: number;
		daemonListen?: number;
		daemonSftp?: number;
		maintenanceMode?: boolean;
	}
): Promise<void> {
	try {
		const body: Record<string, unknown> = {};
		if (data.name !== undefined) body.name = data.name;
		if (data.description !== undefined) body.description = data.description;
		if (data.locationId !== undefined) body.location_id = data.locationId;
		if (data.fqdn !== undefined) body.fqdn = data.fqdn;
		if (data.scheme !== undefined) body.scheme = data.scheme;
		if (data.behindProxy !== undefined) body.behind_proxy = data.behindProxy;
		if (data.public !== undefined) body.public = data.public;
		if (data.memory !== undefined) body.memory = data.memory;
		if (data.memoryOverallocate !== undefined) body.memory_overallocate = data.memoryOverallocate;
		if (data.disk !== undefined) body.disk = data.disk;
		if (data.diskOverallocate !== undefined) body.disk_overallocate = data.diskOverallocate;
		if (data.daemonListen !== undefined) body.daemon_listen = data.daemonListen;
		if (data.daemonSftp !== undefined) body.daemon_sftp = data.daemonSftp;
		if (data.maintenanceMode !== undefined) body.maintenance_mode = data.maintenanceMode;
		await pterodactylRequest<void>(`/nodes/${nodeId}`, {
			method: 'PATCH',
			body: JSON.stringify(body)
		}, true);
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Node aktualisieren fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Ruft die Wings-Konfiguration für eine Node ab (GET /nodes/{id}/configuration).
 * Wird für die Wings config-Datei auf dem Server verwendet.
 */
export async function getPterodactylNodeConfiguration(nodeId: number | string): Promise<Record<string, unknown>> {
	try {
		const response = await pterodactylRequest<Record<string, unknown>>(
			`/nodes/${nodeId}/configuration`,
			{ method: 'GET' },
			true
		);
		return response ?? {};
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Konfiguration laden fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Löscht eine Pterodactyl-Node (DELETE /nodes/{id}). Nur möglich wenn keine Server zugewiesen sind.
 */
export async function deletePterodactylNode(nodeId: number | string): Promise<void> {
	try {
		await pterodactylRequest<void>(`/nodes/${nodeId}`, { method: 'DELETE' }, true);
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Pterodactyl Node löschen fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Erstellt neue Allocations für eine Node (POST /nodes/{id}/allocations).
 * ports: z.B. ["25565", "25566-25570"] für einzelne Ports oder Bereiche.
 */
export async function createPterodactylNodeAllocations(
	nodeId: number | string,
	data: { ip: string; ipAlias?: string; ports: string[] }
): Promise<void> {
	try {
		const body = {
			ip: data.ip.trim(),
			ip_alias: data.ipAlias?.trim() || null,
			ports: data.ports.filter((p) => p.trim().length > 0)
		};
		if (body.ports.length === 0) {
			throw new PterodactylApiError('Mindestens ein Port oder Port-Bereich ist erforderlich.');
		}
		await pterodactylRequest<any>(`/nodes/${nodeId}/allocations`, {
			method: 'POST',
			body: JSON.stringify(body)
		}, true);
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Allocations erstellen fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Löscht eine Allocation einer Node (DELETE /nodes/{id}/allocations/{allocationId}).
 * Nur möglich wenn die Allocation keinem Server zugewiesen ist (assigned = false).
 */
export async function deletePterodactylNodeAllocation(
	nodeId: number | string,
	allocationId: number | string
): Promise<void> {
	try {
		await pterodactylRequest<void>(
			`/nodes/${nodeId}/allocations/${allocationId}`,
			{ method: 'DELETE' },
			true
		);
	} catch (error) {
		if (error instanceof PterodactylApiError) throw error;
		throw new PterodactylApiError(
			`Allocation löschen fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannt'}`
		);
	}
}

/**
 * Ruft einen Pterodactyl User anhand der ID ab
 */
export async function getPterodactylUser(userId: number | string): Promise<PterodactylUser> {
	try {
		const user = await pterodactylRequest<PterodactylUser>(
			`/users/${userId}`,
			{ method: 'GET' }
		);

		return user;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get Pterodactyl user: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Erstellt einen neuen Server in Pterodactyl
 */
export async function createPterodactylServer(data: {
	name: string;
	userId: number; // Pterodactyl User ID (oder PTERODACTYL_SERVICE_USER_ID)
	nodeId?: number; // Node ID (optional, wird automatisch gefunden wenn nicht gegeben)
	locationId: number; // Location ID (wird verwendet um einen Node zu finden)
	nestId: number; // Nest ID (5)
	eggId: number; // Egg ID (15=Node.JS, 16=Python, 19=Uptime Kuma, 20=Java)
	limits: {
		memory: number; // in MB
		swap: number; // in MB
		disk: number; // in MB
		cpu: number; // in Prozent (100 = 1 Core)
	};
	environment?: Record<string, string>;
	startup?: string;
	description?: string;
	/** TitanNode User-ID; wird als external_id gespeichert, wenn Service-User-Modus aktiv ist */
	externalId?: string;
}): Promise<PterodactylServer> {
	try {
		// Hole alle Nodes (filter[location_id] ist in manchen Panel-Versionen nicht erlaubt)
		const nodesResponse = await pterodactylRequest<any>('/nodes?per_page=500', { method: 'GET' });
		const allNodes = Array.isArray(nodesResponse) ? nodesResponse : (nodesResponse?.data || []);
		// Clientseitig nach location_id filtern
		let nodesList = allNodes.filter((n: any) => {
			const attrs = n.attributes ?? n;
			const locId = attrs.location_id ?? n.location_id;
			return Number(locId) === Number(data.locationId);
		});
		if (nodesList.length === 0 && allNodes.length > 0) {
			nodesList = [allNodes[0]];
		}

		let nodeId = data.nodeId;
		if (!nodeId) {
			if (nodesList.length === 0) {
				throw new PterodactylApiError(`Keine Node für Location ${data.locationId} gefunden`);
			}
			nodeId = nodesList[0].id ?? nodesList[0].attributes?.id;
		}

		// Hole verfügbare Allocations für die Node
		const allocations = await pterodactylRequest<any>(
			`/nodes/${nodeId}/allocations?per_page=100`,
			{ method: 'GET' }
		);

		const allocationsList = Array.isArray(allocations) 
			? allocations 
			: (allocations?.data || []);
		
		if (allocationsList.length === 0) {
			throw new PterodactylApiError(`Keine verfügbaren Allocations für Node ${nodeId}`);
		}

		// Finde eine freie Allocation (assigned = false)
		const freeAllocation = allocationsList.find((alloc: any) => {
			const attrs = alloc.attributes || alloc;
			return !attrs.assigned;
		});

		if (!freeAllocation) {
			throw new PterodactylApiError(`Keine freie Allocation für Node ${nodeId} gefunden`);
		}

		const allocationId = freeAllocation.attributes?.id || freeAllocation.id;

		// Hole Egg Details für Environment-Variablen
		const egg = await pterodactylRequest<any>(
			`/nests/${data.nestId}/eggs/${data.eggId}?include=variables`,
			{ method: 'GET' }
		);

		const eggData = egg.attributes || egg;
		const eggVariables = eggData?.relationships?.variables?.data || [];

		// Baue Environment-Variablen auf
		const environment: Record<string, string> = {};
		for (const variable of eggVariables) {
			const varData = variable.attributes || variable;
			const envKey = varData.env_variable || varData.name;
			// Verwende default_value oder einen leeren String
			environment[envKey] = data.environment?.[envKey] || varData.default_value || '';
		}

		// Merge mit übergebenen Environment-Variablen
		if (data.environment) {
			Object.assign(environment, data.environment);
		}

		// Erstelle Server
		const serverData: Record<string, unknown> = {
			name: data.name,
			user: data.userId,
			egg: data.eggId,
			docker_image: eggData?.docker_image || '',
			startup: data.startup || eggData?.startup || '',
			environment,
			limits: {
				memory: data.limits.memory,
				swap: data.limits.swap,
				disk: data.limits.disk,
				io: 500,
				cpu: data.limits.cpu,
			},
			feature_limits: {
				databases: 5,
				allocations: 1,
				backups: 5,
			},
			allocation: {
				default: allocationId,
			},
			description: data.description || '',
		};
		if (data.externalId) {
			serverData.external_id = data.externalId;
		}

		const server = await pterodactylRequest<PterodactylServer>(
			'/servers',
			{
				method: 'POST',
				body: JSON.stringify(serverData),
			}
		);

		return server;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to create Pterodactyl server: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft einen Server anhand der ID ab (verwendet Admin API)
 * @deprecated Verwende getPterodactylServerFromAdmin oder getPterodactylServerFromUser
 */
export async function getPterodactylServer(serverId: number | string): Promise<PterodactylServer> {
	return getPterodactylServerFromAdmin(serverId);
}

/**
 * Ruft einen Server über die Admin API ab
 * Gibt nur ACTIVE oder SUSPENDED basierend auf suspended-Flag zurück
 */
export async function getPterodactylServerFromAdmin(serverId: number | string): Promise<PterodactylServer> {
	try {
		const server = await pterodactylRequest<PterodactylServer>(
			`/servers/${serverId}`,
			{ method: 'GET' },
			true // useAdminKey = true
		);

		return server;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get Pterodactyl server from Admin API: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft einen Server über die User API ab
 * Gibt detaillierte Status-Informationen zurück (running, stopped, starting, etc.)
 * Benötigt Server Identifier statt Server ID
 */
export async function getPterodactylServerFromUser(serverIdentifier: string): Promise<any> {
	try {
		const server = await pterodactylRequest<any>(
			`/servers/${serverIdentifier}`,
			{ method: 'GET' },
			false // useAdminKey = false (User API)
		);

		return server;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get Pterodactyl server from User API: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft alle Server von Pterodactyl ab
 * Include eggs für Filterung nach App Hosting Egg IDs
 */
export async function getAllPterodactylServers(): Promise<PterodactylServer[]> {
	try {
		// include=nest für Filterung nach App Hosting (Nest 8) vs. Gameserver (Nest 6/7)
		const response = await pterodactylRequest<any>(
			'/servers?include=egg,nest,user,node',
			{ method: 'GET' }
		);

		// Pterodactyl gibt Server in einem Array oder in einem data-Array zurück
		if (Array.isArray(response)) {
			return response.map((s: any) => {
				// Wenn es attributes hat, verwende diese, sonst direkt s
				const server = s.attributes || s;
				// Behalte relationships für Egg-Info
				if (s.relationships) {
					server.relationships = s.relationships;
				}
				return server;
			});
		}

		// Wenn Response wrapped ist
		if (response && typeof response === 'object' && 'data' in response) {
			const data = response.data;
			if (Array.isArray(data)) {
				return data.map((s: any) => {
					const server = s.attributes || s;
					if (s.relationships) {
						server.relationships = s.relationships;
					}
					return server;
				});
			}
		}

		// Wenn Response ein Objekt mit attributes ist (einzelner Server)
		if (response && typeof response === 'object' && 'attributes' in response) {
			const server = response.attributes;
			if (response.relationships) {
				server.relationships = response.relationships;
			}
			return [server];
		}

		// Fallback: leeres Array
		return [];
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get all Pterodactyl servers: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * App Hosting Nest ID (8 = App Hosting in Pterodactyl)
 * Nur Server aus diesem Nest werden als App Hosting angezeigt (keine Gameserver aus Nest 6/7).
 */
export const APP_HOSTING_NEST_ID = parseInt(process.env.PTERODACTYL_NEST_ID || '8', 10);

/**
 * App Hosting Egg IDs (Legacy; App-Hosting-Filter erfolgt über APP_HOSTING_NEST_ID)
 */
export const APP_HOSTING_EGG_IDS = [15, 16, 19, 20] as const;

/**
 * Gameserver Nest ID (6 = Minecraft Java in Pterodactyl)
 * Nur Server aus diesem Nest werden als Gameserver angezeigt.
 */
export const GAMESERVER_NEST_ID = parseInt(process.env.PTERODACTYL_GAMESERVER_NEST_ID || '6', 10);

/**
 * Minecraft Java Egg IDs (Nest 6): 15=Velocity, 16=Paper, 17=Folia, 18=Purpur, 19=SpongeVanilla, 20=SpongeForge, 21=Forge, 22=NeoForge, 43=Fabric
 * Wird nur noch als Referenz genutzt; Filter erfolgt über GAMESERVER_NEST_ID.
 */
export const MINECRAFT_JAVA_EGG_IDS = [15, 16, 17, 18, 19, 20, 21, 22, 43] as const;

/**
 * Ruft alle App Hosting Server von Pterodactyl ab (gefiltert nach Nest ID 8)
 */
export async function getAllAppHostingServers(): Promise<PterodactylServer[]> {
	try {
		const allServers = await getAllPterodactylServers();
		
		// Filtere nach App Hosting Nest ID (8)
		const appHostingServers = allServers.filter((server: any) => {
			let nestId: number | undefined;
			if (server.nest) {
				nestId = typeof server.nest === 'number' ? server.nest : server.nest.id;
			} else if (server.relationships?.nest?.data?.attributes?.id) {
				nestId = server.relationships.nest.data.attributes.id;
			} else if (server.relationships?.nest?.data?.id) {
				nestId = Number(server.relationships.nest.data.id);
			}
			if (process.env.DEBUG === 'true') {
				console.log(`Server ${server.identifier || server.name || server.id}: nestId=${nestId}`);
			}
			return nestId === APP_HOSTING_NEST_ID;
		});

		if (process.env.DEBUG === 'true') {
			console.log(`Gefundene App Hosting Server: ${appHostingServers.length} von ${allServers.length} gesamt`);
		}

		return appHostingServers;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get App Hosting servers: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft alle Server eines bestimmten Pterodactyl Users ab
 * 
 * Hinweis: Die Pterodactyl API unterstützt keinen `user_id` Filter.
 * Daher werden alle Server abgerufen und dann nach dem User gefiltert.
 */
export async function getPterodactylUserServers(pterodactylUserId: number | string): Promise<PterodactylServer[]> {
	try {
		// Hole alle Server mit user, egg, nest, node und allocations (für IP/Port)
		// Da die API keinen user_id Filter unterstützt, müssen wir alle Server abrufen und filtern
		const response = await pterodactylRequest<any>(
			`/servers?include=egg,nest,user,node,allocations&per_page=500`,
			{ method: 'GET' }
		);

		console.log(`[DEBUG] Pterodactyl Response Typ: ${typeof response}, ist Array: ${Array.isArray(response)}`);
		if (response && typeof response === 'object' && !Array.isArray(response)) {
			console.log(`[DEBUG] Response Keys:`, Object.keys(response));
		}

		// Pterodactyl gibt Server in einem Array oder in einem data-Array zurück
		let allServers: any[] = [];
		
		if (Array.isArray(response)) {
			console.log(`[DEBUG] Response ist direkt ein Array mit ${response.length} Einträgen`);
			allServers = response.map((s: any) => {
				const server = s.attributes || s;
				if (s.relationships) {
					server.relationships = s.relationships;
				}
				return server;
			});
		} else if (response && typeof response === 'object' && 'data' in response) {
			const data = response.data;
			console.log(`[DEBUG] Response hat 'data' Feld, Typ: ${typeof data}, ist Array: ${Array.isArray(data)}`);
			if (Array.isArray(data)) {
				console.log(`[DEBUG] Data Array hat ${data.length} Einträge`);
				allServers = data.map((s: any) => {
					const server = s.attributes || s;
					if (s.relationships) {
						server.relationships = s.relationships;
					}
					return server;
				});
			}
		} else if (response && typeof response === 'object' && 'attributes' in response) {
			console.log(`[DEBUG] Response hat 'attributes' Feld (einzelner Server)`);
			const server = response.attributes;
			if (response.relationships) {
				server.relationships = response.relationships;
			}
			allServers = [server];
		} else {
			console.log(`[DEBUG] Unerwartete Response-Struktur:`, JSON.stringify(response).substring(0, 200));
		}
		
		console.log(`[DEBUG] Gesamt Server nach Parsing: ${allServers.length}`);

		// Filtere nach dem gewünschten User
		// Die user_id kann in verschiedenen Strukturen sein:
		// - server.user (direkt als ID)
		// - server.relationships.user.data.id
		// - server.relationships.user.data.attributes.id
		const userServers = allServers.filter((server: any) => {
			const userId = server.user || 
			               server.relationships?.user?.data?.id ||
			               server.relationships?.user?.data?.attributes?.id;
			
			// Vergleiche als String und Number, da pterodactylUserId als number | string übergeben wird
			const matches = String(userId) === String(pterodactylUserId) || 
			                Number(userId) === Number(pterodactylUserId);
			
			if (process.env.DEBUG === 'true' && !matches && userId) {
				console.log(`Server ${server.id || server.name}: userId=${userId}, target=${pterodactylUserId}, match=${matches}`);
			}
			
			return matches;
		});

		if (process.env.DEBUG === 'true') {
			console.log(`Pterodactyl: ${userServers.length} Server für User ${pterodactylUserId} gefunden (von ${allServers.length} gesamt)`);
			if (allServers.length > 0 && userServers.length === 0) {
				// Zeige die ersten paar User-IDs zur Debugging
				const sampleUserIds = allServers.slice(0, 5).map((s: any) => {
					return s.user || 
					       s.relationships?.user?.data?.id ||
					       s.relationships?.user?.data?.attributes?.id;
				}).filter(Boolean);
				console.log(`Beispiel User-IDs aus den ersten 5 Servern:`, sampleUserIds);
			}
		}

		return userServers;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get Pterodactyl user servers: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft alle App Hosting Server eines bestimmten Pterodactyl Users ab.
 * Es zählt nur das Nest: Server aus Nest 8 (App Hosting) = App Hosting; Gameserver (Nest 6/7) werden ausgeschlossen.
 * Bei Service-User-Modus: titanNodeUserId übergeben → es werden Server des Service-Users mit external_id === titanNodeUserId geladen.
 */
export async function getUserAppHostingServersFromPterodactyl(
	pterodactylUserId: number | string,
	titanNodeUserId?: string
): Promise<PterodactylServer[]> {
	try {
		const useServiceUserFilter = PTERODACTYL_SERVICE_USER_ID != null && titanNodeUserId != null && titanNodeUserId !== '';
		const effectiveUserId = useServiceUserFilter ? PTERODACTYL_SERVICE_USER_ID! : pterodactylUserId;
		console.log(`[DEBUG] getUserAppHostingServersFromPterodactyl aufgerufen für User: ${effectiveUserId}${useServiceUserFilter ? ` (external_id=${titanNodeUserId})` : ''}`);
		const userServers = await getPterodactylUserServers(effectiveUserId);
		console.log(`[DEBUG] userServers gefunden: ${userServers.length}`);

		// Bei Service-User-Modus: nur Server mit passender external_id (TitanNode User-ID)
		let candidates = userServers;
		if (useServiceUserFilter) {
			candidates = userServers.filter((server: any) => {
				const extId = server.external_id ?? server.attributes?.external_id ?? null;
				return String(extId) === String(titanNodeUserId);
			});
			console.log(`[DEBUG] Nach external_id-Filter: ${candidates.length} Server`);
		}

		// Filtere nach App Hosting Nest ID (8) – nur Server aus dem App-Hosting-Nest, keine Gameserver (Nest 6/7)
		const appHostingServers = candidates.filter((server: any) => {
			let nestId: number | undefined;
			if (server.nest) {
				nestId = typeof server.nest === 'number' ? server.nest : server.nest.id;
			} else if (server.relationships?.nest?.data?.attributes?.id) {
				nestId = server.relationships.nest.data.attributes.id;
			} else if (server.relationships?.nest?.data?.id) {
				nestId = Number(server.relationships.nest.data.id);
			}
			const isAppHosting = nestId === APP_HOSTING_NEST_ID;
			if (process.env.DEBUG === 'true') {
				console.log(`Server ${server.id || server.name}: nestId=${nestId}, isAppHosting=${isAppHosting}`);
			}
			return isAppHosting;
		});

		console.log(`[DEBUG] App Hosting Server gefunden: ${appHostingServers.length} von ${candidates.length} User-Servern`);
		if (process.env.DEBUG === 'true') {
			console.log(`User ${effectiveUserId}: ${appHostingServers.length} App Hosting Server gefunden von ${candidates.length} gesamt`);
		}

		return appHostingServers;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get user App Hosting servers: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Ruft alle Gameserver Server eines bestimmten Pterodactyl Users ab (gefiltert nach Nest ID 6 = Minecraft Java).
 * Bei Service-User-Modus: titanNodeUserId übergeben → es werden Server des Service-Users mit external_id === titanNodeUserId geladen.
 */
export async function getUserGameserverServersFromPterodactyl(
	pterodactylUserId: number | string,
	titanNodeUserId?: string
): Promise<PterodactylServer[]> {
	try {
		const useServiceUserFilter = PTERODACTYL_SERVICE_USER_ID != null && titanNodeUserId != null && titanNodeUserId !== '';
		const effectiveUserId = useServiceUserFilter ? PTERODACTYL_SERVICE_USER_ID! : pterodactylUserId;
		console.log(`[DEBUG] getUserGameserverServersFromPterodactyl aufgerufen für User: ${effectiveUserId}${useServiceUserFilter ? ` (external_id=${titanNodeUserId})` : ''}`);
		const userServers = await getPterodactylUserServers(effectiveUserId);
		console.log(`[DEBUG] userServers gefunden: ${userServers.length}`);

		// Bei Service-User-Modus: nur Server mit passender external_id (TitanNode User-ID)
		let candidates = userServers;
		if (useServiceUserFilter) {
			candidates = userServers.filter((server: any) => {
				const extId = server.external_id ?? server.attributes?.external_id ?? null;
				return String(extId) === String(titanNodeUserId);
			});
			console.log(`[DEBUG] Nach external_id-Filter: ${candidates.length} Server`);
		}

		// Filtere nach Gameserver Nest ID (6 = Minecraft Java) – alle Eggs in diesem Nest zählen
		const gameserverServers = candidates.filter((server: any) => {
			let nestId: number | undefined;
			if (server.nest) {
				nestId = typeof server.nest === 'number' ? server.nest : server.nest.id;
			} else if (server.relationships?.nest?.data?.attributes?.id) {
				nestId = server.relationships.nest.data.attributes.id;
			} else if (server.relationships?.nest?.data?.id) {
				nestId = Number(server.relationships.nest.data.id);
			}
			const isGameserver = nestId === GAMESERVER_NEST_ID;
			if (process.env.DEBUG === 'true') {
				console.log(`Server ${server.id || server.name}: nestId=${nestId}, isGameserver=${isGameserver}`);
			}
			return isGameserver;
		});

		console.log(`[DEBUG] Gameserver gefunden: ${gameserverServers.length} von ${candidates.length} User-Servern`);
		if (process.env.DEBUG === 'true') {
			console.log(`User ${effectiveUserId}: ${gameserverServers.length} Gameserver gefunden von ${candidates.length} gesamt`);
		}

		return gameserverServers;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get user Gameserver servers: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Löscht einen Server in Pterodactyl (verwendet Admin API)
 */
export async function deletePterodactylServer(serverId: number | string): Promise<void> {
	try {
		await pterodactylRequest<void>(
			`/servers/${serverId}`,
			{ method: 'DELETE' },
			true // useAdminKey = true (Admin API)
		);
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to delete Pterodactyl server: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Sendet eine Power-Aktion an einen Server (verwendet User API)
 * @param serverIdentifier - Server Identifier (nicht Server ID) für User API
 */
export async function sendServerPowerAction(
	serverIdentifier: string,
	action: 'start' | 'stop' | 'restart' | 'kill'
): Promise<void> {
	try {
		await pterodactylRequest<void>(
			`/servers/${serverIdentifier}/power`,
			{
				method: 'POST',
				body: JSON.stringify({ signal: action }),
			},
			false // Verwende User API Key für Power-Aktionen
		);
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to send power action: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Konvertiert Server ID zu Server Identifier (für User API)
 */
export async function getServerIdentifierFromId(serverId: number | string): Promise<string> {
	try {
		const server = await getPterodactylServerFromAdmin(serverId);
		return server.identifier;
	} catch (error) {
		if (error instanceof PterodactylApiError) {
			throw error;
		}
		throw new PterodactylApiError(
			`Failed to get server identifier: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

export { PterodactylApiError };

