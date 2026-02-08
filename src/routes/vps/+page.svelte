<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Server,
		Shield,
		Zap,
		HardDrive,
		Cpu,
		Network,
		CheckCircle2,
		ArrowRight,
		Lock,
		Cloud,
		BarChart3,
		RefreshCw,
		Database,
		Gauge,
		Users,
		Clock,
		Settings,
		Loader2
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Prozessorauswahl State
	let selectedProcessor = $state<'xeon' | 'ryzen' | 'epic' | 'all'>('all');

	// Gefilterte Produkte basierend auf ausgewähltem Prozessor
	let filteredProducts = $derived(() => {
		if (selectedProcessor === 'all') {
			return data.products || [];
		}
		return data.productsByProcessor?.[selectedProcessor] || [];
	});

	// Format Preis
	function formatPrice(price: number | undefined): string {
		if (!price) return 'Auf Anfrage';
		return `${price.toFixed(2).replace('.', ',')}€`;
	}

	// Format RAM (MB zu GB)
	function formatRam(mb: number | undefined): string {
		if (!mb) return 'N/A';
		const gb = Math.round(mb / 1024);
		return `${gb} GB`;
	}

	// Format Bandwidth (Mbit/s zu Gbit/s)
	function formatBandwidth(mbit: number | undefined): string {
		if (!mbit) return '1 Gbit/s';
		const gbit = Math.round(mbit / 1000);
		return `${gbit} Gbit/s`;
	}
</script>

<svelte:head>
	<title>VPS Hosting - Virtual Private Server | TitanNode</title>
	<meta name="description" content="Leistungsstarke VPS mit Root-Zugriff, NVMe SSDs und DDoS-Schutz. Flexible Virtual Private Server ab 4,99€/Monat." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),_transparent_55%)]"></div>
	<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.25))]"></div>

	<div class="container relative mx-auto max-w-screen-2xl px-4 py-16 sm:py-24 lg:py-28">
		<div class="mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
			<!-- Left: Text -->
			<div class="flex-1 text-center lg:text-left">
				<!-- Badge -->
				<Badge variant="secondary" class="mb-6 px-4 py-2">
					<Server class="mr-2 h-4 w-4" />
					VPS Hosting
				</Badge>

				<!-- Headline -->
				<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Virtual Private Server
					<span class="block bg-gradient-to-r from-primary via-sky-400 to-accent bg-clip-text text-transparent">
						mit voller Kontrolle
					</span>
				</h1>

				<!-- Subheadline -->
				<p class="mb-8 text-base text-muted-foreground sm:text-lg lg:text-xl">
					Leistungsstarke VPS mit Root-Zugriff, NVMe Storage und DDoS‑Schutz – perfekt für Webhosting,
					Entwicklung, Gameserver und Business‑Anwendungen.
				</p>

				<!-- CTA Buttons -->
				<div class="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
					<Button size="lg" class="gap-2 px-8 py-6 text-lg shadow-md shadow-primary/20" href="#packages">
						VPS jetzt bestellen
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						class="gap-2 px-8 py-6 text-lg border-border/70 bg-background/70 hover:bg-background"
						href="#features"
					>
						<BarChart3 class="h-5 w-5" />
						Features ansehen
					</Button>
				</div>
			</div>

			<!-- Right: VPS Highlight Card -->
			<div class="flex-1 w-full lg:max-w-md">
				<Card class="border-border/60 bg-background/80 shadow-xl shadow-slate-950/30 backdrop-blur">
					<CardContent class="p-6 sm:p-7">
						<div class="mb-4 flex items-center justify-between">
							<div>
								<p class="text-xs uppercase tracking-wide text-muted-foreground">
									Empfohlenes Paket
								</p>
								<p class="mt-1 text-sm font-medium text-foreground">
									VPS M – ideal für Gameserver & Web‑Apps
								</p>
							</div>
							<span class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								<span class="h-2 w-2 rounded-full bg-primary"></span>
								BELIEBT
							</span>
						</div>

						<div class="grid grid-cols-2 gap-4 text-sm">
							<div class="rounded-xl border border-border/60 bg-muted/40 p-4">
								<p class="text-xs text-muted-foreground">Ressourcen</p>
								<p class="mt-1 text-xl font-semibold text-foreground">4 vCPU</p>
								<p class="text-sm text-muted-foreground">8 GB RAM · 100 GB NVMe</p>
							</div>
							<div class="rounded-xl border border-border/60 bg-muted/40 p-4">
								<p class="text-xs text-muted-foreground">Preis</p>
								<p class="mt-1 text-xl font-semibold text-foreground">9,99€</p>
								<p class="text-sm text-muted-foreground">monatlich · jederzeit kündbar</p>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
							<div class="flex items-center gap-2">
								<Shield class="h-4 w-4 text-primary" />
								<span>DDoS‑Schutz inklusive</span>
							</div>
							<div class="flex items-center gap-2">
								<Network class="h-4 w-4 text-primary" />
								<span>1–2 Gbit/s Anbindung</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="w-full py-20 sm:py-28">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">VPS Features</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Professionelle VPS-Infrastruktur
			</h2>
			<p class="text-lg text-muted-foreground">
				Alle VPS-Pakete beinhalten Premium-Features für maximale Performance und Sicherheit.
			</p>
		</div>

		<!-- Feature Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Cpu class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>High-Performance CPUs</CardTitle>
					<CardDescription>
						Modernste AMD EPYC und Intel Xeon Prozessoren mit dedizierten vCores
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 2 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<HardDrive class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>NVMe SSD Storage</CardTitle>
					<CardDescription>
						Ultraschnelle NVMe SSDs mit bis zu 10x höherer Performance als SATA SSDs
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 3 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Network class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Premium Netzwerk</CardTitle>
					<CardDescription>
						1-10 Gbit/s Anbindung mit unbegrenztem Traffic und niedrigen Latenzen
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 4 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Shield class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>DDoS-Schutz</CardTitle>
					<CardDescription>
						Professioneller DDoS-Schutz gegen Angriffe bis zu mehreren Terabits
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 5 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Lock class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Root-Zugriff</CardTitle>
					<CardDescription>
						Volle Kontrolle über deinen Server mit vollständigem Root-/Admin-Zugriff
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 6 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<RefreshCw class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Automatische Backups</CardTitle>
					<CardDescription>
						Tägliche Backups deiner Daten mit einfacher Wiederherstellung
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<!-- Packages Section -->
<section id="packages" class="w-full bg-gradient-to-b from-background via-background to-muted/40 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<Card class="border-border/60 bg-card/95 shadow-sm">
			<CardContent class="p-6 sm:p-8 lg:p-10">
		<!-- Section Header -->
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">VPS Pakete</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Finde deinen perfekten VPS
			</h2>
			<p class="text-lg text-muted-foreground">
				Alle Pakete mit vollständigem Root-Zugriff, DDoS-Schutz und automatischen Backups.
			</p>
		</div>

		<!-- Prozessorauswahl -->
		<div class="mx-auto mb-10 max-w-2xl">
			<div class="inline-flex flex-wrap justify-center gap-2 rounded-full bg-muted/60 px-2 py-2">
				<Button 
					variant={selectedProcessor === 'all' ? 'default' : 'outline'}
					onclick={() => selectedProcessor = 'all'}
					class="min-w-[120px] rounded-full"
				>
					Alle
				</Button>
				<Button 
					variant={selectedProcessor === 'xeon' ? 'default' : 'outline'}
					onclick={() => selectedProcessor = 'xeon'}
					class="min-w-[120px] rounded-full"
				>
					Intel Xeon
				</Button>
				<Button 
					variant={selectedProcessor === 'ryzen' ? 'default' : 'outline'}
					onclick={() => selectedProcessor = 'ryzen'}
					class="min-w-[120px] rounded-full"
				>
					AMD Ryzen
				</Button>
				<Button 
					variant={selectedProcessor === 'epic' ? 'default' : 'outline'}
					onclick={() => selectedProcessor = 'epic'}
					class="min-w-[120px] rounded-full"
				>
					AMD EPYC
				</Button>
			</div>
		</div>

		<!-- Pricing Grid -->
		{#if !data.hasProducts}
			<!-- Fallback: Statische Pakete, wenn keine Daten von API -->
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- VPS S -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>VPS S</CardTitle>
						<CardDescription>Ideal für Einsteiger</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">4,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">2 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">AMD EPYC / Intel Xeon</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4 ECC</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">50 GB NVMe SSD</p>
								<p class="text-sm text-muted-foreground">RAID-10</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">1 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzter Traffic</span>
						</div>
					</div>
					<Button class="w-full mt-6">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- VPS M -->
			<Card class="border-primary/60 bg-background relative overflow-hidden shadow-lg hover:-translate-y-1.5 transition-transform">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
					BELIEBT
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>VPS M</CardTitle>
						<CardDescription>Für anspruchsvolle Projekte</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">9,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">AMD EPYC / Intel Xeon</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4 ECC</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">100 GB NVMe SSD</p>
								<p class="text-sm text-muted-foreground">RAID-10</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">2 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzter Traffic</span>
						</div>
					</div>
					<Button class="w-full mt-6">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- VPS L -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>VPS L</CardTitle>
						<CardDescription>High-Performance Server</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">19,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">AMD EPYC / Intel Xeon</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4 ECC</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">200 GB NVMe SSD</p>
								<p class="text-sm text-muted-foreground">RAID-10</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">5 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzter Traffic</span>
						</div>
					</div>
					<Button class="w-full mt-6">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- VPS XL -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>VPS XL</CardTitle>
						<CardDescription>Enterprise-Level</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">39,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">AMD EPYC / Intel Xeon</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">32 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4 ECC</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">400 GB NVMe SSD</p>
								<p class="text-sm text-muted-foreground">RAID-10</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">10 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzter Traffic</span>
						</div>
					</div>
					<Button class="w-full mt-6">Jetzt bestellen</Button>
				</CardContent>
			</Card>
			</div>
		{:else}
			<!-- Dynamische Pakete von Datalix API -->
			{#if filteredProducts().length === 0}
				<div class="text-center py-12">
					<p class="text-muted-foreground mb-4">
						Keine Pakete für den ausgewählten Prozessor verfügbar.
					</p>
					<Button variant="outline" onclick={() => selectedProcessor = 'all'}>
						Alle Pakete anzeigen
					</Button>
				</div>
			{:else}
				<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each filteredProducts() as product}
						<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform {product.soldOut ? 'opacity-75' : ''}">
							{#if product.soldOut}
								<div class="absolute top-0 right-0 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-bl-lg z-10">
									AUSVERKAUFT
								</div>
							{:else if product.priceMonthly && product.priceMonthly < 15}
								<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
									BELIEBT
								</div>
							{/if}
							<CardHeader>
								<div class="mb-2">
									<CardTitle>{product.name || `VPS ${product.cpu || '?'} vCPU`}</CardTitle>
									<CardDescription>
										{product.processor ? `${product.processor.toUpperCase()}` : 'VPS Paket'}
										{#if product.location}
											• {product.location}
										{/if}
									</CardDescription>
								</div>
								<div class="mt-4">
									<div class="flex items-baseline">
										<span class="text-4xl font-bold text-foreground">
											{formatPrice(product.priceMonthly)}
										</span>
										<span class="ml-2 text-muted-foreground">/Monat</span>
									</div>
								</div>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="space-y-3">
									{#if product.cpu}
										<div class="flex items-start gap-2">
											<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
											<div>
												<p class="font-medium">{product.cpu} vCPU Cores</p>
												<p class="text-sm text-muted-foreground">
													{product.processor ? product.processor.toUpperCase() : 'High-Performance'}
												</p>
											</div>
										</div>
									{/if}
									{#if product.ram}
										<div class="flex items-start gap-2">
											<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
											<div>
												<p class="font-medium">{formatRam(product.ram)} RAM</p>
												<p class="text-sm text-muted-foreground">DDR4 ECC</p>
											</div>
										</div>
									{/if}
									{#if product.disk}
										<div class="flex items-start gap-2">
											<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
											<div>
												<p class="font-medium">{product.disk} GB NVMe SSD</p>
												<p class="text-sm text-muted-foreground">RAID-10</p>
											</div>
										</div>
									{/if}
									<div class="flex items-start gap-2">
										<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
										<span class="text-sm">{formatBandwidth(product.bandwidth)} Anbindung</span>
									</div>
									<div class="flex items-start gap-2">
										<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
										<span class="text-sm">Unbegrenzter Traffic</span>
									</div>
									<div class="flex items-start gap-2">
										<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
										<span class="text-sm">Root-Zugriff</span>
									</div>
									<div class="flex items-start gap-2">
										<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
										<span class="text-sm">DDoS-Schutz</span>
									</div>
								</div>
								<Button 
									class="w-full mt-6" 
									href="/vps/konfigurator"
									disabled={product.soldOut}
									variant={product.soldOut ? 'outline' : 'default'}
								>
									{product.soldOut ? 'Ausverkauft' : 'Jetzt bestellen'}
									{#if !product.soldOut}
										<ArrowRight class="ml-2 h-4 w-4" />
									{/if}
								</Button>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Custom VPS -->
		<div class="mt-12 text-center">
			<Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 max-w-2xl mx-auto">
				<CardContent class="p-8">
					<Server class="h-12 w-12 text-primary mx-auto mb-4" />
					<h3 class="text-2xl font-bold mb-2">Individuelle Konfiguration benötigt?</h3>
					<p class="text-muted-foreground mb-6">
						Stelle dir deinen perfekten VPS nach deinen Anforderungen zusammen. 
						Wähle CPU, RAM, Storage und mehr selbst aus.
					</p>
					<Button size="lg" href="/vps/konfigurator" class="gap-2">
						<Settings class="h-5 w-5" />
						Zum VPS-Konfigurator
						<ArrowRight class="h-5 w-5" />
					</Button>
				</CardContent>
			</Card>
		</div>
			</CardContent>
		</Card>
	</div>
</section>

<!-- Technical Specs Section -->
<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
			<!-- Left Column -->
			<div class="space-y-8">
				<div>
					<Badge variant="secondary" class="mb-4">Technische Details</Badge>
					<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Enterprise Hardware & Software
					</h2>
					<p class="text-lg text-muted-foreground">
						Unsere VPS-Server laufen auf modernster Enterprise-Hardware in deutschen Rechenzentren.
					</p>
				</div>

				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Database class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">KVM Virtualisierung</h3>
							<p class="text-muted-foreground">
								Vollständige Virtualisierung mit dedizierten Ressourcen und garantierter Performance.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Cloud class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Betriebssystem-Auswahl</h3>
							<p class="text-muted-foreground">
								Ubuntu, Debian, CentOS, Rocky Linux, Windows Server und viele weitere OS zur Auswahl.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Gauge class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">IPv4 & IPv6</h3>
							<p class="text-muted-foreground">
								Jeder VPS kommt mit mindestens einer dedizierten IPv4 und IPv6-Adresse.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Clock class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Sofortige Bereitstellung</h3>
							<p class="text-muted-foreground">
								Dein VPS ist innerhalb von Minuten nach der Bestellung einsatzbereit.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column - Use Cases -->
			<div class="space-y-6">
				<Card class="border-border/50 bg-card">
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Zap class="h-5 w-5" />
							Perfekt geeignet für
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-4">
							<div class="p-4 rounded-lg bg-muted/50">
								<h4 class="font-semibold mb-2">Webhosting & Websites</h4>
								<p class="text-sm text-muted-foreground">
									Hoste deine Websites, WordPress, E-Commerce-Shops und Webanwendungen.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<h4 class="font-semibold mb-2">Entwicklung & Testing</h4>
								<p class="text-sm text-muted-foreground">
									Perfekte Entwicklungsumgebung mit vollständigem Root-Zugriff.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<h4 class="font-semibold mb-2">Datenbanken & APIs</h4>
								<p class="text-sm text-muted-foreground">
									Betreibe MySQL, PostgreSQL, MongoDB oder eigene REST APIs.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<h4 class="font-semibold mb-2">VPN & Proxy Server</h4>
								<p class="text-sm text-muted-foreground">
									Sichere VPN-Verbindungen und Proxy-Server für dein Netzwerk.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<h4 class="font-semibold mb-2">Docker & Container</h4>
								<p class="text-sm text-muted-foreground">
									Volle Docker-Unterstützung für containerisierte Anwendungen.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="w-full border-t bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<Server class="h-16 w-16 text-primary mx-auto mb-6" />
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Starte jetzt mit deinem VPS
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Bestelle deinen Virtual Private Server noch heute. Keine Einrichtungsgebühr, 
				keine Mindestvertragslaufzeit, jederzeit kündbar.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="#packages">
					VPS bestellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#contact">
					<Users class="h-5 w-5" />
					Beratung anfragen
				</Button>
			</div>
		</div>
	</div>
</section>

