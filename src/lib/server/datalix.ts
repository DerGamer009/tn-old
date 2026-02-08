/**
 * Datalix API Client
 * Integration für VPS-Server-Verwaltung über die Datalix API
 * Dokumentation: https://apidoc.datalix.de/
 */

const DATALIX_API_BASE = process.env.DATALIX_API_BASE || 'https://backend.datalix.de/v1';
const DATALIX_API_KEY = process.env.DATALIX_API_KEY;
const DATALIX_USERNAME = process.env.DATALIX_USERNAME;
const DATALIX_PASSWORD = process.env.DATALIX_PASSWORD;

// Session-Token Cache
let datalixSessionToken: string | null = null;

interface DatalixVps {
	id: string;
	name: string;
	status: 'running' | 'stopped' | 'suspended' | 'pending';
	cpu: number;
	ram: number; // in MB
	disk: number; // in GB
	bandwidth: number; // in Gbit/s
	ipv4?: string;
	ipv6?: string;
	location?: string;
	os?: string;
	createdAt?: string;
	expiresAt?: string; // Laufzeit/Expiration (Unix-Timestamp oder ISO-String)
	serviceId?: string; // Service ID
	hostname?: string;
}

interface DatalixServiceResponse {
	display?: Record<string, any>;
	service?: {
		id: string;
		name?: string | null;
		price?: string;
		expire_at?: number; // Unix-Timestamp
		created_on?: number; // Unix-Timestamp
		[key: string]: any;
	};
	product?: {
		id?: string;
		serviceid?: string;
		cores?: number;
		memory?: number; // in MB
		disk?: number; // in GB
		uplink?: number; // in Mbit/s
		status?: 'running' | 'stopped' | 'suspended' | 'pending';
		hostname?: string;
		location?: string;
		created_on?: string;
		[key: string]: any;
	};
}

interface CreateVpsRequest {
	name: string;
	cpu: number;
	ram: number; // in MB
	disk: number; // in GB
	bandwidth?: number; // in Gbit/s
	location?: string;
	os?: string;
}

interface DatalixApiResponse<T> {
	data?: T;
	error?: string;
	message?: string;
}

class DatalixApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: unknown
	) {
		super(message);
		this.name = 'DatalixApiError';
	}
}


/**
 * Führt einen API-Request an die Datalix API aus
 * Die Datalix API verwendet einen Query-Parameter `token` für die Authentifizierung
 */
async function datalixRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	if (!DATALIX_API_KEY && !DATALIX_USERNAME) {
		throw new Error('DATALIX_API_KEY oder DATALIX_USERNAME/DATALIX_PASSWORD muss gesetzt sein');
	}

	// Bestimme API-Key (entweder direkt oder über Login bei Username/Password)
	let apiKey = DATALIX_API_KEY;

	// Wenn Username/Password gesetzt, versuche Login für Session-Token
	if (!apiKey && DATALIX_USERNAME && DATALIX_PASSWORD) {
		// Versuche Login-Endpunkte
		const loginEndpoints = [
			'/auth/login',
			'/login',
			'/api/auth/login',
			'/api/login',
		];

		for (const loginEndpoint of loginEndpoints) {
			try {
				const loginUrl = `${DATALIX_API_BASE}${loginEndpoint}`;
				console.log(`🔐 Versuche Login über: ${loginUrl}`);
				
				const loginResponse = await fetch(loginUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username: DATALIX_USERNAME,
						password: DATALIX_PASSWORD,
					}),
				});

				if (loginResponse.ok) {
					const loginData = await loginResponse.json();
					console.log(`✅ Login erfolgreich! Response:`, JSON.stringify(loginData, null, 2));
					
					// Versuche verschiedene Token-Felder
					apiKey = loginData.token || loginData.sessionToken || loginData.accessToken || loginData.data?.token || loginData.data || loginData.apiKey || loginData.api_key;
					
					if (apiKey) {
						console.log(`✅ Token erhalten: ${typeof apiKey === 'string' ? apiKey.substring(0, 20) + '...' : String(apiKey).substring(0, 20) + '...'}`);
						datalixSessionToken = String(apiKey);
						break; // Erfolgreich eingeloggt
					} else {
						console.warn(`⚠️ Login erfolgreich, aber kein Token gefunden in Response`);
						console.warn(`   Verfügbare Felder:`, Object.keys(loginData));
					}
				} else {
					const errorText = await loginResponse.text().catch(() => '');
					console.log(`⚠️ Login fehlgeschlagen (${loginResponse.status}): ${errorText}`);
				}
			} catch (error) {
				console.log(`⚠️ Login-Fehler bei ${loginEndpoint}:`, error instanceof Error ? error.message : error);
				// Versuche nächsten Endpunkt
				continue;
			}
		}

		// Wenn Login fehlschlägt, verwende Username als Token
		if (!apiKey) {
			apiKey = DATALIX_USERNAME;
		}
	}

	if (!apiKey) {
		throw new Error('Keine API-Key oder Credentials gefunden');
	}

	// Erstelle URL mit Query-Parameter `token`
	const url = new URL(`${DATALIX_API_BASE}${endpoint}`);
	url.searchParams.append('token', apiKey);
	
	const response = await fetch(url.toString(), {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		
		// Bei 404 nicht loggen, wenn es erwartetes Verhalten ist (z.B. bei Produkt-Endpunkten)
		// Nur loggen bei anderen Fehlern oder wenn DEBUG aktiviert ist
		const shouldLog = response.status !== 404 || process.env.DEBUG === 'true';
		
		if (shouldLog) {
			// Debug: Zeige URL (ohne Token in Log)
			console.error(`❌ API Request fehlgeschlagen: ${response.status} ${response.statusText}`);
			console.error(`   URL: ${endpoint}`);
		}
		
		// Bei 401 mit Username/Password, versuche Session zu erneuern
		if (response.status === 401 && DATALIX_USERNAME && DATALIX_PASSWORD && datalixSessionToken) {
			// Session war nicht erfolgreich, versuche nochmal
			datalixSessionToken = null;
			// Retry ohne Session-Token
			return datalixRequest<T>(endpoint, options);
		}
		
		// Detaillierte Fehlermeldung bei 401
		if (response.status === 401) {
			const authInfo = DATALIX_API_KEY
				? `API-Key als Query-Parameter`
				: DATALIX_USERNAME 
					? `Username/Password (${DATALIX_USERNAME})`
					: `Token nicht gefunden`;
			
			throw new DatalixApiError(
				`Authentifizierung fehlgeschlagen (401). ${authInfo}. ` +
				`Bitte prüfe:\n` +
				`  1. Ist der API-Key/Username/Password korrekt?\n` +
				`  2. Ist der API-Key/Account aktiv?\n` +
				`  3. Hat der Account Zugriff auf diesen Service?\n` +
				`\nOriginal-Fehler: ${errorData.message || errorData.error || response.statusText}`,
				response.status,
				errorData
			);
		}
		
		throw new DatalixApiError(
			errorData.message || errorData.error || `API request failed: ${response.statusText}`,
			response.status,
			errorData
		);
	}

	const data = await response.json();
	
	// Debug: Zeige Response-Struktur (nur bei Bedarf)
	if (process.env.DEBUG === 'true') {
		console.log(`📦 API Response für ${endpoint}:`, JSON.stringify(data, null, 2));
	}
	
	// Wenn Response direkt das erwartete Objekt ist (nicht wrapped)
	if (!data.data && typeof data === 'object' && 'id' in data) {
		return data as T;
	}
	
	// Wenn Response wrapped ist mit `data` Property
	if (data.data !== undefined) {
		return data.data as T;
	}
	
	// Wenn Response ein Array ist
	if (Array.isArray(data)) {
		return data as T;
	}
	
	// Fallback: Gib Response direkt zurück
	return data as T;
}

/**
 * Erstellt einen neuen VPS über die Datalix API
 */
export async function createDatalixVps(config: CreateVpsRequest): Promise<DatalixVps> {
	try {
		const response = await datalixRequest<DatalixApiResponse<DatalixVps>>('/vps', {
			method: 'POST',
			body: JSON.stringify(config),
		});

		if (response.error) {
			throw new DatalixApiError(response.error);
		}

		if (!response.data) {
			throw new DatalixApiError('No data returned from API');
		}

		return response.data;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to create VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Ruft einen VPS anhand der ID ab
 */
export async function getDatalixVps(vpsId: string): Promise<DatalixVps> {
	try {
		const response = await datalixRequest<DatalixApiResponse<DatalixVps>>(`/vps/${vpsId}`);

		if (response.error) {
			throw new DatalixApiError(response.error);
		}

		if (!response.data) {
			throw new DatalixApiError('VPS not found');
		}

		return response.data;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to get VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

interface DatalixIpResponse {
	ipv4?: Array<{
		ip: string;
		gw: string;
		netmask: string;
		subnet: string;
		protstatus: string;
		tenantos?: number;
		rdns?: string;
		note?: string;
	}>;
	ipv6?: Array<{
		subnet: string;
		gw: string;
		netmask: string;
		firstip: string;
	}>;
	ipv6adresslist?: any[];
}

/**
 * Ruft IP-Adressen für einen Service ab
 */
export async function getDatalixServiceIp(serviceId: string): Promise<DatalixIpResponse> {
	const endpoint = `/service/${serviceId}/ip`;
	try {
		const response = await datalixRequest<DatalixIpResponse>(endpoint);
		return response;
	} catch (error) {
		// IP-Endpunkt nicht verfügbar, ignoriere (IP ist optional)
		if (process.env.DEBUG === 'true') {
			console.warn(`Konnte IP-Adressen nicht abrufen:`, error);
		}
		return {};
	}
}

/**
 * Ruft vollständige Service-Daten von Datalix ab (inkl. alle Details)
 * Versucht verschiedene Endpunkte, bis einer funktioniert
 */
export async function getDatalixServiceDetails(serviceId: string): Promise<DatalixServiceResponse & { ipData?: DatalixIpResponse }> {
	const endpoints = [
		`/service/${serviceId}`, // Hauptendpunkt
		`/services/${serviceId}`, // Alternative
	];

	let serviceResponse: DatalixServiceResponse | null = null;

	for (const endpoint of endpoints) {
		try {
			const response = await datalixRequest<DatalixServiceResponse>(endpoint);
			// Prüfe ob Response die erwartete Struktur hat
			if (response && (response.service || response.product)) {
				serviceResponse = response;
				break;
			}
		} catch (error) {
			// Bei 404, versuche nächsten Endpunkt
			if (error instanceof DatalixApiError && error.statusCode === 404) {
				continue;
			}
			// Bei anderen Fehlern, werfe sofort
			if (error instanceof DatalixApiError) {
				throw error;
			}
		}
	}

	if (!serviceResponse) {
		throw new DatalixApiError(`Service Details nicht gefunden für Service ID: ${serviceId}`);
	}

	// Versuche IP-Adressen zu holen
	const ipData = await getDatalixServiceIp(serviceId);

	return {
		...serviceResponse,
		ipData
	};
}

/**
 * Ruft einen VPS anhand der ServiceID ab
 */
export async function getDatalixVpsByServiceId(serviceId: string): Promise<DatalixVps> {
	const endpoints = [
		`/services/${serviceId}`,
		`/vps/${serviceId}`, // Vielleicht ist Service-ID = VPS-ID
		`/vps?serviceId=${serviceId}`,
		`/service/${serviceId}`,
		`/instances/${serviceId}`,
	];

	let lastError: Error | null = null;

		for (const endpoint of endpoints) {
		try {
			if (process.env.DEBUG === 'true') {
				console.log(`🔍 Versuche Endpunkt: ${endpoint}`);
			}
			const response = await datalixRequest<DatalixApiResponse<DatalixVps> | DatalixVps | any>(endpoint);

			// Debug: Zeige Response-Struktur (nur bei Bedarf)
			if (process.env.DEBUG === 'true') {
				console.log(`📦 Response-Typ:`, typeof response);
				console.log(`📦 Response ist Array:`, Array.isArray(response));
				console.log(`📦 Response Keys:`, response && typeof response === 'object' ? Object.keys(response) : 'N/A');
			}

			// Wenn Response wrapped ist (Standard API-Response)
			const wrappedResponse = response as DatalixApiResponse<DatalixVps>;
			if (wrappedResponse.error) {
				throw new DatalixApiError(wrappedResponse.error);
			}

			if (wrappedResponse.data) {
				console.log(`✅ VPS gefunden über Endpunkt: ${endpoint} (wrapped)`);
				return wrappedResponse.data;
			}

			// Wenn Response ein DatalixServiceResponse ist (mit service/product)
			const serviceResponse = response as DatalixServiceResponse;
			if (serviceResponse.service && serviceResponse.product) {
				if (process.env.DEBUG === 'true') {
					console.log(`✅ VPS gefunden über Endpunkt: ${endpoint} (service/product Struktur)`);
				}
				
				// Versuche IP-Adresse zu holen (falls verfügbar)
				let ipv4: string | undefined = undefined;
				try {
					// Versuche IP über separaten Endpunkt
					const ipResponse = await datalixRequest<any>(`/service/${serviceId}/ip`).catch(() => null);
					if (ipResponse) {
						if (process.env.DEBUG === 'true') {
							console.log(`📦 IP-Response:`, JSON.stringify(ipResponse, null, 2));
						}
						if (ipResponse.ip || ipResponse.ipv4 || ipResponse.data?.ip || ipResponse.data?.ipv4) {
							ipv4 = ipResponse.ip || ipResponse.ipv4 || ipResponse.data?.ip || ipResponse.data?.ipv4;
							if (process.env.DEBUG === 'true') {
								console.log(`✅ IP-Adresse gefunden: ${ipv4}`);
							}
						}
					}
				} catch (error) {
					// IP-Endpunkt nicht verfügbar, ignoriere
					if (process.env.DEBUG === 'true') {
						console.log(`⚠️ IP-Endpunkt nicht verfügbar`);
					}
				}
				
				// Mappe Datalix Service Response zu DatalixVps
				const vps: DatalixVps = {
					id: serviceResponse.product.id || serviceResponse.service.id,
					name: serviceResponse.service.name || serviceResponse.product.hostname || `VPS-${serviceResponse.service.id.substring(0, 8)}`,
					status: serviceResponse.product.status || 'pending',
					cpu: serviceResponse.product.cores || 0,
					ram: serviceResponse.product.memory || 0, // in MB
					disk: serviceResponse.product.disk || 0, // in GB
					bandwidth: serviceResponse.product.uplink ? Math.round(serviceResponse.product.uplink / 1000) : 1, // Mbit/s zu Gbit/s
					ipv4: ipv4,
					location: serviceResponse.product.location || undefined,
					hostname: serviceResponse.product.hostname || undefined,
					serviceId: serviceResponse.service.id,
					createdAt: serviceResponse.product.created_on || (serviceResponse.service.created_on ? new Date(serviceResponse.service.created_on * 1000).toISOString() : undefined),
					expiresAt: serviceResponse.service.expire_at ? new Date(serviceResponse.service.expire_at * 1000).toISOString() : undefined,
				};
				
				if (process.env.DEBUG === 'true') {
					console.log(`✅ VPS-Daten gemappt:`, {
						id: vps.id,
						name: vps.name,
						status: vps.status,
						cpu: vps.cpu,
						ram: `${vps.ram} MB (${Math.round(vps.ram / 1024)} GB)`,
						disk: `${vps.disk} GB`,
						bandwidth: `${vps.bandwidth} Gbit/s`,
						ipv4: vps.ipv4 || 'Nicht verfügbar',
						expiresAt: vps.expiresAt || 'Unbegrenzt',
					});
				}
				
				return vps;
			}

			// Wenn Response direkt ein DatalixVps ist (nicht wrapped)
			if (response && typeof response === 'object' && 'id' in response && !Array.isArray(response)) {
				console.log(`✅ VPS gefunden über Endpunkt: ${endpoint} (direkt)`);
				return response as DatalixVps;
			}

			// Wenn Response ein Array ist, nimm erstes Element
			if (Array.isArray(response) && response.length > 0) {
				console.log(`✅ VPS gefunden über Endpunkt: ${endpoint} (Array, erstes Element)`);
				return response[0] as DatalixVps;
			}

			// Wenn Response-Objekt selbst verwendet werden kann (auch ohne 'id', aber mit anderen VPS-Feldern)
			if (response && typeof response === 'object' && ('name' in response || 'cpu' in response || 'ram' in response || 'cores' in response)) {
				console.log(`✅ VPS gefunden über Endpunkt: ${endpoint} (als Objekt)`);
				
				// Mappe zu DatalixVps falls nötig
				const mappedResponse = response as any;
				if ('cores' in mappedResponse || 'memory' in mappedResponse) {
					const vps: DatalixVps = {
						id: mappedResponse.id || serviceId,
						name: mappedResponse.name || mappedResponse.hostname || `VPS-${serviceId.substring(0, 8)}`,
						status: mappedResponse.status || 'pending',
						cpu: mappedResponse.cores || mappedResponse.cpu || 0,
						ram: mappedResponse.memory || mappedResponse.ram || 0,
						disk: mappedResponse.disk || 0,
						bandwidth: mappedResponse.uplink ? Math.round(mappedResponse.uplink / 1000) : (mappedResponse.bandwidth || 1),
						location: mappedResponse.location || undefined,
						hostname: mappedResponse.hostname || undefined,
						serviceId: mappedResponse.serviceid || mappedResponse.serviceId || serviceId,
						createdAt: mappedResponse.created_on || mappedResponse.createdAt,
						expiresAt: mappedResponse.expire_at ? new Date(mappedResponse.expire_at * 1000).toISOString() : mappedResponse.expiresAt,
					};
					return vps;
				}
				
				return response as DatalixVps;
			}

			console.warn(`⚠️ Response-Struktur unerwartet für Endpunkt: ${endpoint}`, response);
			throw new DatalixApiError(`No data returned from API. Response structure: ${JSON.stringify(response)}`);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			// Wenn es ein 404 ist, versuche nächsten Endpunkt
			if (error instanceof DatalixApiError && error.statusCode === 404) {
				console.log(`⚠️ Endpunkt ${endpoint} nicht gefunden (404), versuche nächsten...`);
				continue;
			}
			// Bei anderen Fehlern, werfe sofort
			if (error instanceof DatalixApiError) {
				throw error;
			}
		}
	}

	// Alle Endpunkte fehlgeschlagen
	throw new DatalixApiError(
		`VPS mit Service ID ${serviceId} nicht gefunden. Versuchte Endpunkte: ${endpoints.join(', ')}. Letzter Fehler: ${lastError?.message || 'Unknown error'}`
	);
}

/**
 * Ruft alle VPS eines Benutzers ab
 */
export async function listDatalixVps(): Promise<DatalixVps[]> {
	try {
		const response = await datalixRequest<DatalixApiResponse<DatalixVps[]>>('/vps');

		if (response.error) {
			throw new DatalixApiError(response.error);
		}

		return response.data || [];
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to list VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

interface DatalixProduct {
	id: string;
	name?: string;
	cpu?: number;
	ram?: number; // in MB
	disk?: number; // in GB
	bandwidth?: number; // in Mbit/s
	price?: number;
	priceMonthly?: number;
	processor?: string; // z.B. "xeon", "ryzen", "epic"
	location?: string;
	description?: string;
	soldOut?: boolean; // Ausverkauft-Flag
	[key: string]: any;
}

/**
 * ProductResponse aus DatalixServiceResponse extrahieren
 * Nutzt die product-Struktur aus DatalixServiceResponse
 */
type ProductResponse = DatalixServiceResponse['product'];

/**
 * Mappt DatalixServiceResponse Array zu DatalixProduct[]
 * Nutzt die ProductResponse-Struktur
 */
function mapServiceResponsesToProducts(serviceResponses: DatalixServiceResponse[]): DatalixProduct[] {
	return serviceResponses
		.filter((sr: DatalixServiceResponse) => sr.product && sr.service)
		.map((sr: DatalixServiceResponse) => {
			const product: ProductResponse = sr.product!;
			const service = sr.service!;

			return {
				id: product.id || service.id,
				name: service.name || product.hostname || `VPS ${product.cores || '?'} vCPU`,
				cpu: product.cores,
				ram: product.memory, // in MB
				disk: product.disk, // in GB
				bandwidth: product.uplink ? Math.round(product.uplink / 1000) : 1, // Mbit/s zu Gbit/s
				priceMonthly: service.price ? parseFloat(service.price) : undefined,
				processor: extractProcessorFromProduct(product),
				location: product.location,
			} as DatalixProduct;
		});
}

/**
 * Extrahiert Prozessortyp aus ProductResponse
 */
function extractProcessorFromProduct(product: ProductResponse | undefined): string | undefined {
	if (!product) return undefined;

	// Versuche aus verschiedenen Feldern zu extrahieren
	if (product.processor && typeof product.processor === 'string') {
		const proc = product.processor.toLowerCase();
		if (proc.includes('xeon') || proc.includes('intel')) return 'xeon';
		if (proc.includes('epic')) return 'epic';
		if (proc.includes('ryzen') || proc.includes('amd')) return 'ryzen';
	}

	// Fallback: Versuche aus Location zu extrahieren
	return extractProcessorFromLocation(product.location);
}

/**
 * Mappt verschiedene Response-Formate zu DatalixProduct[]
 */
function mapToProducts(data: any[]): DatalixProduct[] {
	return data.map((item: any) => {
		// Wenn es bereits ein DatalixProduct ist
		if (item.id && (item.cpu !== undefined || item.ram !== undefined || item.disk !== undefined)) {
			return item as DatalixProduct;
		}

		// Wenn es ein Service-Objekt ist (mit service/product Struktur)
		if (item.service && item.product) {
			return {
				id: item.product.id || item.service.id,
				name: item.service.name || item.product.hostname,
				cpu: item.product.cores,
				ram: item.product.memory, // in MB
				disk: item.product.disk, // in GB
				bandwidth: item.product.uplink ? Math.round(item.product.uplink / 1000) : 1, // Mbit/s zu Gbit/s
				priceMonthly: item.service.price ? parseFloat(item.service.price) : undefined,
				processor: item.product.processor || extractProcessorFromLocation(item.product.location),
				location: item.product.location,
			} as DatalixProduct;
		}

		// Wenn es direkt ein Product-Objekt ist
		if (item.cores || item.memory || item.disk) {
			return {
				id: item.id,
				name: item.name || item.hostname,
				cpu: item.cores || item.cpu,
				ram: item.memory || item.ram,
				disk: item.disk,
				bandwidth: item.uplink ? Math.round(item.uplink / 1000) : (item.bandwidth || 1),
				priceMonthly: item.price ? parseFloat(item.price) : undefined,
				processor: item.processor || extractProcessorFromLocation(item.location),
				location: item.location,
			} as DatalixProduct;
		}

		// Fallback: Versuche so viel wie möglich zu extrahieren
		return {
			id: item.id || String(Math.random()),
			name: item.name,
			...item,
		} as DatalixProduct;
	});
}

/**
 * Extrahiert Prozessortyp aus Location-String (falls vorhanden)
 */
function extractProcessorFromLocation(location?: string): string | undefined {
	if (!location) return undefined;
	const loc = location.toLowerCase();
	if (loc.includes('xeon') || loc.includes('intel')) return 'xeon';
	if (loc.includes('epic')) return 'epic';
	if (loc.includes('ryzen') || loc.includes('amd')) return 'ryzen';
	return undefined;
}

/**
 * Ruft verfügbare VPS-Pakete/Produkte von der Datalix API ab
 * 
 * Hinweis: Die Datalix API hat möglicherweise keine dedizierten Produkt-Endpunkte.
 * In diesem Fall werden statische Fallback-Pakete auf der VPS-Seite verwendet.
 * 
 * Basierend auf der Datalix API-Dokumentation: https://apidoc.datalix.de/#/
 */
export async function getDatalixProducts(): Promise<DatalixProduct[]> {
	// Mögliche Produkt-Endpunkte (werden in Reihenfolge versucht)
	const endpoints = [
		'/products',
		'/packages',
		'/products/vps',
		'/packages/vps',
		'/vps/products',
		'/catalog',
		'/services', // Liste aller Services (falls verfügbar)
		// Hinweis: /vps und /service/{id} sind für bestehende VPS/Services, nicht für Produkte
	];

	for (const endpoint of endpoints) {
		try {
			const response = await datalixRequest<DatalixApiResponse<DatalixProduct[]> | DatalixProduct[] | any>(endpoint);

			// Wenn Response wrapped ist
			const wrappedResponse = response as DatalixApiResponse<DatalixProduct[]>;
			if (wrappedResponse.error) {
				continue; // Versuche nächsten Endpunkt
			}

			if (wrappedResponse.data && Array.isArray(wrappedResponse.data)) {
				// Mappe zu DatalixProduct falls nötig
				return mapToProducts(wrappedResponse.data);
			}

			// Wenn Response direkt ein Array ist
			if (Array.isArray(response)) {
				return mapToProducts(response);
			}

			// Wenn Response ein Objekt mit data-Array ist
			if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
				return mapToProducts((response as any).data);
			}

			// Wenn Response ein Objekt mit services-Array ist (z.B. /services)
			if (response && typeof response === 'object' && 'services' in response && Array.isArray((response as any).services)) {
				return mapServiceResponsesToProducts((response as any).services);
			}

			// Wenn Response ein Array von DatalixServiceResponse ist (mit service/product Struktur)
			if (Array.isArray(response) && response.length > 0 && response[0] && typeof response[0] === 'object') {
				const firstItem = response[0];
				if ('service' in firstItem || 'product' in firstItem) {
					return mapServiceResponsesToProducts(response);
				}
			}

			// Wenn Response ein einzelnes DatalixServiceResponse ist
			if (response && typeof response === 'object' && 'service' in response && 'product' in response) {
				return mapServiceResponsesToProducts([response]);
			}
		} catch (error) {
			// Bei 404 oder anderen Fehlern, versuche nächsten Endpunkt
			// 404 ist erwartet, da die Datalix API möglicherweise keine Produkt-Endpunkte hat
			if (error instanceof DatalixApiError) {
				// Nur bei anderen Fehlern als 404 loggen (404 ist erwartetes Verhalten)
				if (error.statusCode !== 404 && process.env.DEBUG === 'true') {
					console.log(`⚠️ Endpunkt ${endpoint} fehlgeschlagen:`, error.message);
				}
				continue;
			}
			// Bei anderen Fehlertypen, logge nur in Debug-Modus
			if (process.env.DEBUG === 'true') {
				console.log(`⚠️ Endpunkt ${endpoint} fehlgeschlagen:`, error);
			}
		}
	}

	// Falls kein Endpunkt funktioniert, gebe leeres Array zurück
	// Die Datalix API hat möglicherweise keine Produkt-Endpunkte
	// In diesem Fall werden statische Fallback-Pakete auf der VPS-Seite angezeigt
	if (process.env.DEBUG === 'true') {
		console.warn('⚠️ Keine verfügbaren Produkte-Endpunkte gefunden. Verwende Fallback-Daten.');
	}
	return [];
}

/**
 * Startet einen VPS
 */
export async function startDatalixVps(vpsId: string): Promise<void> {
	try {
		await datalixRequest<DatalixApiResponse<void>>(`/vps/${vpsId}/start`, {
			method: 'POST',
		});
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to start VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Stoppt einen VPS
 */
export async function stopDatalixVps(vpsId: string): Promise<void> {
	try {
		await datalixRequest<DatalixApiResponse<void>>(`/vps/${vpsId}/stop`, {
			method: 'POST',
		});
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to stop VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Startet einen VPS neu
 */
export async function restartDatalixVps(vpsId: string): Promise<void> {
	try {
		await datalixRequest<DatalixApiResponse<void>>(`/vps/${vpsId}/restart`, {
			method: 'POST',
		});
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to restart VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Löscht einen VPS
 */
export async function deleteDatalixVps(vpsId: string): Promise<void> {
	try {
		await datalixRequest<DatalixApiResponse<void>>(`/vps/${vpsId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to delete VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Aktualisiert die Specs eines VPS (Upgrade/Downgrade)
 */
export async function updateDatalixVps(
	vpsId: string,
	updates: Partial<Pick<CreateVpsRequest, 'cpu' | 'ram' | 'disk' | 'bandwidth'>>
): Promise<DatalixVps> {
	try {
		const response = await datalixRequest<DatalixApiResponse<DatalixVps>>(`/vps/${vpsId}`, {
			method: 'PATCH',
			body: JSON.stringify(updates),
		});

		if (response.error) {
			throw new DatalixApiError(response.error);
		}

		if (!response.data) {
			throw new DatalixApiError('No data returned from API');
		}

		return response.data;
	} catch (error) {
		if (error instanceof DatalixApiError) {
			throw error;
		}
		throw new DatalixApiError(`Failed to update VPS: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export { DatalixApiError };
export type { DatalixVps, CreateVpsRequest };

