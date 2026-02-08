import type { PageServerLoad } from './$types';
import { getDatalixProducts } from '$lib/server/datalix';

// Statische Datalix-Pakete (basierend auf https://datalix.de)
// Preise sind um 1€ teurer als bei Datalix

interface StaticPackage {
	id: string;
	name: string;
	cpu: number;
	ram: number; // in GB
	storage: number; // in GB
	bandwidth: number; // in Gbit/s
	priceMonthly: number;
	processor: 'xeon' | 'ryzen' | 'epic';
	location?: string;
	soldOut?: boolean; // Ausverkauft-Flag
}

// Xeon KVM Server Pakete (https://datalix.de/xeon-kvm-server-mieten)
// Alle Xeon-Pakete sind ausverkauft
const xeonPackages: StaticPackage[] = [
	{
		id: 'xeon-s',
		name: 'KVM Server S',
		cpu: 4,
		ram: 8,
		storage: 50,
		bandwidth: 1,
		priceMonthly: 6.99, // 5.99€ + 1€
		processor: 'xeon',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'xeon-m',
		name: 'KVM Server M',
		cpu: 6,
		ram: 16,
		storage: 100,
		bandwidth: 1,
		priceMonthly: 10.99, // 9.99€ + 1€
		processor: 'xeon',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'xeon-l',
		name: 'KVM Server L',
		cpu: 8,
		ram: 32,
		storage: 200,
		bandwidth: 1,
		priceMonthly: 20.99, // 19.99€ + 1€
		processor: 'xeon',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'xeon-xl',
		name: 'KVM Server XL',
		cpu: 10,
		ram: 64,
		storage: 400,
		bandwidth: 1,
		priceMonthly: 35.99, // 34.99€ + 1€
		processor: 'xeon',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	}
];

// Ryzen KVM Server Pakete (https://datalix.de/ryzen-kvm-server-mieten)
// Alle 8 Pakete von der Datalix-Seite, Preise jeweils +1€
const ryzenPackages: StaticPackage[] = [
	{
		id: 'ryzen-small',
		name: 'Ryzen GEN 2 Small',
		cpu: 1,
		ram: 2,
		storage: 20,
		bandwidth: 1,
		priceMonthly: 3.45, // 2.45€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-starter',
		name: 'Ryzen GEN 2 Starter',
		cpu: 1,
		ram: 4,
		storage: 25,
		bandwidth: 1,
		priceMonthly: 4.95, // 3.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-new',
		name: 'Ryzen GEN 2 New',
		cpu: 2,
		ram: 6,
		storage: 50,
		bandwidth: 1,
		priceMonthly: 5.95, // 4.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-boost',
		name: 'Ryzen GEN 2 Boost',
		cpu: 2,
		ram: 8,
		storage: 50,
		bandwidth: 1,
		priceMonthly: 8.45, // 7.45€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-super',
		name: 'Ryzen GEN 2 Super',
		cpu: 3,
		ram: 12,
		storage: 75,
		bandwidth: 1,
		priceMonthly: 10.95, // 9.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-expert',
		name: 'Ryzen GEN 2 Expert',
		cpu: 4,
		ram: 16,
		storage: 120,
		bandwidth: 1,
		priceMonthly: 15.95, // 14.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: false
	},
	{
		id: 'ryzen-big',
		name: 'Ryzen GEN 2 Big',
		cpu: 6,
		ram: 24,
		storage: 160,
		bandwidth: 1,
		priceMonthly: 20.95, // 19.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'ryzen-mega',
		name: 'Ryzen GEN 2 Mega',
		cpu: 6,
		ram: 32,
		storage: 200,
		bandwidth: 1,
		priceMonthly: 25.95, // 24.95€ + 1€
		processor: 'ryzen',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	}
];

// EPYC KVM Server Pakete (https://datalix.de/epyc-kvm-server-mieten)
// Alle EPYC-Pakete sind ausverkauft
const epicPackages: StaticPackage[] = [
	{
		id: 'epic-s',
		name: 'EPYC KVM Server S',
		cpu: 4,
		ram: 8,
		storage: 50,
		bandwidth: 1,
		priceMonthly: 6.99, // 5.99€ + 1€ (ähnlich Xeon)
		processor: 'epic',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'epic-m',
		name: 'EPYC KVM Server M',
		cpu: 6,
		ram: 16,
		storage: 100,
		bandwidth: 1,
		priceMonthly: 10.99, // 9.99€ + 1€ (ähnlich Xeon)
		processor: 'epic',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'epic-l',
		name: 'EPYC KVM Server L',
		cpu: 8,
		ram: 32,
		storage: 200,
		bandwidth: 1,
		priceMonthly: 20.99, // 19.99€ + 1€ (ähnlich Xeon)
		processor: 'epic',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	},
	{
		id: 'epic-xl',
		name: 'EPYC KVM Server XL',
		cpu: 10,
		ram: 64,
		storage: 400,
		bandwidth: 1,
		priceMonthly: 35.99, // 34.99€ + 1€ (ähnlich Xeon)
		processor: 'epic',
		location: 'Frankfurt am Main, Deutschland',
		soldOut: true // Ausverkauft
	}
];

export const load: PageServerLoad = async () => {
	try {
		// Versuche, Produkte von der Datalix API abzurufen
		const apiProducts = await getDatalixProducts();

		// Kombiniere API-Produkte mit statischen Paketen
		// Konvertiere statische Pakete zu DatalixProduct-Format
		const staticProducts = [
			...xeonPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024, // GB zu MB
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			})),
			...ryzenPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024,
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			})),
			...epicPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024,
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			}))
		];

		// Kombiniere API-Produkte (falls vorhanden) mit statischen Paketen
		const allProducts = [...apiProducts, ...staticProducts];

		// Gruppiere nach Prozessortyp
		const productsByProcessor = {
			xeon: allProducts.filter(p => 
				p.processor && (
					p.processor.toLowerCase() === 'xeon' || 
					p.processor.toLowerCase().includes('intel')
				)
			),
			ryzen: allProducts.filter(p => 
				p.processor && (
					p.processor.toLowerCase() === 'ryzen' || 
					(p.processor.toLowerCase().includes('amd') && !p.processor.toLowerCase().includes('epic'))
				)
			),
			epic: allProducts.filter(p => 
				p.processor && p.processor.toLowerCase() === 'epic'
			),
			all: allProducts
		};

		return {
			products: allProducts,
			productsByProcessor,
			hasProducts: allProducts.length > 0
		};
	} catch (error) {
		// Bei Fehler verwende nur statische Pakete
		if (process.env.NODE_ENV === 'development') {
			console.error('Fehler beim Laden der VPS-Pakete von Datalix API:', error);
		}

		// Konvertiere statische Pakete zu DatalixProduct-Format
		const staticProducts = [
			...xeonPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024,
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			})),
			...ryzenPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024,
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			})),
			...epicPackages.map(p => ({
				id: p.id,
				name: p.name,
				cpu: p.cpu,
				ram: p.ram * 1024,
				disk: p.storage,
				bandwidth: p.bandwidth,
				priceMonthly: p.priceMonthly,
				processor: p.processor,
				location: p.location,
				soldOut: p.soldOut || false
			}))
		];

		const productsByProcessor = {
			xeon: staticProducts.filter(p => p.processor === 'xeon'),
			ryzen: staticProducts.filter(p => p.processor === 'ryzen'),
			epic: staticProducts.filter(p => p.processor === 'epic'),
			all: staticProducts
		};

		return {
			products: staticProducts,
			productsByProcessor,
			hasProducts: staticProducts.length > 0
		};
	}
};

