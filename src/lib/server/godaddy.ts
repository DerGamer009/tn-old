/**
 * GoDaddy Domains API – nur serverseitig nutzen (Keys aus $env).
 * Basis: https://developer.godaddy.com/doc/endpoint/domains
 *
 * Umgebung:
 * - Production: https://api.godaddy.com (Standard)
 * - OTE (Test): https://api.ote-godaddy.com – setze GODADDY_USE_OTE=true in .env,
 *   wenn deine Keys aus dem GoDaddy Developer Portal „OTE“ sind (sonst: „Authenticated user is not allowed access“).
 */

import { env } from '$env/dynamic/private';

function getGodaddyBase(): string {
	if (env.GODADDY_USE_OTE === 'true' || env.GODADDY_USE_OTE === '1') {
		return 'https://api.ote-godaddy.com';
	}
	return 'https://api.godaddy.com';
}

/** Response von GET /v1/domains/available (GoDaddy Domains API) */
export type GodaddyAvailableResponse = {
	available: boolean;
	domain: string;
	definitive?: boolean;
	/** Preis in kleinsten Einheiten (API: oft 1/100.000 der Währung, z.B. 7490000 = 74,90) */
	price?: number;
	currency?: string;
	/** Registrierungszeitraum in Jahren (1, 2, …) */
	period?: number;
};

export type GodaddyDomainCheckResult =
	| { ok: true; data: GodaddyAvailableResponse }
	| { ok: false; error: string };

/**
 * Domain-Verfügbarkeit prüfen (einzelne Domain).
 * Keys müssen in .env als GODADDY_API_KEY und GODADDY_API_SECRET gesetzt sein.
 */
export async function checkDomainAvailability(
	domain: string,
	apiKey: string,
	apiSecret: string
): Promise<GodaddyDomainCheckResult> {
	const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
	if (!normalized || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(normalized)) {
		return { ok: false, error: 'Bitte eine gültige Domain eingeben (z.B. example.com).' };
	}

	const base = getGodaddyBase();
	const url = new URL(`${base}/v1/domains/available`);
	url.searchParams.set('domain', normalized);
	// Nur domain setzen – checkType/forTransfer können in Production „Bad Request“ auslösen
	// Optional: checkType=FAST, forTransfer=false je nach GoDaddy-Doku

	const auth = `sso-key ${apiKey}:${apiSecret}`;
	const res = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: auth,
			Accept: 'application/json'
		}
	});

	if (!res.ok) {
		const text = await res.text();
		let message = `GoDaddy API Fehler (${res.status}).`;
		try {
			const json = JSON.parse(text);
			if (json.message) message = json.message;
			else if (json.error) message = json.error;
		} catch {
			if (text) message = text.slice(0, 200);
		}
		// Hinweis bei typischem Key/Umgebung-Mismatch
		if (
			res.status === 403 &&
			(message.includes('not allowed access') || message.toLowerCase().includes('authenticated'))
		) {
			const useOte = env.GODADDY_USE_OTE === 'true' || env.GODADDY_USE_OTE === '1';
			message += useOte
				? ' Deine Keys sind vermutlich Production-Keys. In .env GODADDY_USE_OTE entfernen oder auf false setzen.'
				: ' Deine Keys sind vermutlich OTE (Test)-Keys. In .env GODADDY_USE_OTE=true setzen.';
		}
		return { ok: false, error: message };
	}

	const data = (await res.json()) as GodaddyAvailableResponse;
	return { ok: true, data };
}

/**
 * Preis aus GoDaddy-Response formatieren.
 * GoDaddy liefert Preis in kleinsten Einheiten: oft 1/100.000 (7490000 = 74,90)
 * oder 1/100 (7490 = 74,90). Wir probieren 100000 zuerst, bei sehr kleinem Wert 100.
 */
export function formatGodaddyPrice(price: number | undefined, currency: string = 'USD'): string {
	if (price == null || price <= 0) return '–';
	const curr = currency === 'EUR' ? 'EUR' : 'USD';
	let value: number;
	if (price >= 100_000) value = price / 100_000;
	else if (price >= 100) value = price / 100;
	else value = price;
	return new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: curr,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/** Standard-TLDs, die bei Namens-Eingabe geprüft werden */
export const DEFAULT_TLDS = ['.de', '.com', '.net', '.org', '.io', '.eu', '.co', '.info'] as const;

export type DomainCheckItem = {
	domain: string;
	available: boolean;
	/** Formatierter Preis (z.B. "74,90 €") */
	priceFormatted?: string;
	/** Währung aus API (USD, EUR, …) */
	currency?: string;
	/** Laufzeit in Jahren (1, 2, …) */
	period?: number;
	/** Fehlermeldung wenn diese Domain nicht geprüft werden konnte */
	error?: string;
};

/**
 * Mehrere Domains prüfen (Name + TLD-Liste). Führt parallele Einzelabfragen aus.
 */
export async function checkMultipleDomains(
	name: string,
	tlds: readonly string[],
	apiKey: string,
	apiSecret: string
): Promise<DomainCheckItem[]> {
	const normalizedName = name.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/\./g, '');
	if (!normalizedName || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(normalizedName)) {
		return [];
	}
	const domains = tlds.map((tld) => normalizedName + tld.replace(/^\.?/, '.'));
	const results = await Promise.all(
		domains.map(async (domain): Promise<DomainCheckItem> => {
			const result = await checkDomainAvailability(domain, apiKey, apiSecret);
			if (!result.ok) {
				return { domain, available: false, error: result.error };
			}
			const d = result.data;
			const currency = d.currency ?? 'USD';
			const priceFormatted =
				d.available && d.price != null && d.price > 0
					? formatGodaddyPrice(d.price, currency)
					: undefined;
			return {
				domain: d.domain,
				available: d.available,
				priceFormatted,
				currency,
				period: d.period
			};
		})
	);
	return results;
}
