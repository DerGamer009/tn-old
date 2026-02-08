<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Server,
		Cpu,
		HardDrive,
		Network,
		CheckCircle2,
		ArrowRight,
		Settings,
		Cloud,
		Zap
	} from '@lucide/svelte';

	// Configuration state
	let cpuCores = $state(4);
	let ram = $state(8);
	let storage = $state(100);
	let bandwidth = $state(2);
	let operatingSystem = $state('ubuntu-22.04');

	// Price calculation
	const basePrices = {
		cpu: 2.50,    // pro vCore
		ram: 1.00,    // pro GB
		storage: 0.05, // pro GB
		bandwidth: 2.00 // pro Gbit/s
	};

	let totalPrice = $derived.by(() => {
		const cpuPrice = cpuCores * basePrices.cpu;
		const ramPrice = ram * basePrices.ram;
		const storagePrice = storage * basePrices.storage;
		const bandwidthPrice = bandwidth * basePrices.bandwidth;
		return (cpuPrice + ramPrice + storagePrice + bandwidthPrice).toFixed(2);
	});

	// CPU options
	const cpuOptions = [2, 4, 6, 8, 12, 16, 24, 32];
	// RAM options
	const ramOptions = [2, 4, 8, 16, 24, 32, 48, 64, 96, 128];
	// Storage options
	const storageOptions = [50, 100, 200, 300, 400, 500, 750, 1000];
	// Bandwidth options
	const bandwidthOptions = [1, 2, 5, 10];

	// Operating systems
	const operatingSystems = [
		{ id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', icon: '🐧' },
		{ id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', icon: '🐧' },
		{ id: 'debian-11', name: 'Debian 11', icon: '🌀' },
		{ id: 'debian-12', name: 'Debian 12', icon: '🌀' },
		{ id: 'centos-9', name: 'CentOS Stream 9', icon: '💠' },
		{ id: 'rocky-9', name: 'Rocky Linux 9', icon: '⛰️' },
		{ id: 'fedora-39', name: 'Fedora 39', icon: '🎩' },
		{ id: 'windows-2022', name: 'Windows Server 2022', icon: '🪟' }
	];
</script>

<svelte:head>
	<title>VPS Konfigurator - Individuelle Konfiguration | TitanNode</title>
	<meta name="description" content="Konfiguriere deinen perfekten VPS nach deinen Anforderungen. CPU, RAM, Storage und mehr individuell wählbar." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-12 sm:py-20">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="secondary" class="mb-4 px-4 py-2">
				<Settings class="mr-2 h-4 w-4" />
				VPS Konfigurator
			</Badge>

			<h1 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
				Konfiguriere deinen
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					individuellen VPS
				</span>
			</h1>

			<p class="mb-8 text-lg text-muted-foreground sm:text-xl">
				Stelle dir deinen perfekten Virtual Private Server zusammen. 
				Wähle CPU, RAM, Storage und mehr nach deinen Bedürfnissen.
			</p>
		</div>
	</div>
</section>

<!-- Configurator Section -->
<section class="w-full py-12 sm:py-20">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Configuration Options - Left/Center -->
			<div class="lg:col-span-2 space-y-8">
				<!-- CPU Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Cpu class="h-5 w-5 text-primary" />
							CPU Cores
						</CardTitle>
						<CardDescription>
							Wähle die Anzahl der vCPU Cores (AMD EPYC / Intel Xeon)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
								{#each cpuOptions as option}
									<button
										class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {cpuCores === option ? 'border-primary bg-primary/10' : 'border-border'}"
										onclick={() => (cpuCores = option)}
									>
										{#if cpuCores === option}
											<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
										{/if}
										<div class="text-lg font-bold">{option}</div>
										<div class="text-xs text-muted-foreground">Cores</div>
									</button>
								{/each}
							</div>
							<div class="text-sm text-muted-foreground">
								Gewählt: <strong>{cpuCores} vCPU Cores</strong> (+{(cpuCores * basePrices.cpu).toFixed(2)}€/Monat)
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- RAM Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Zap class="h-5 w-5 text-primary" />
							Arbeitsspeicher (RAM)
						</CardTitle>
						<CardDescription>
							Wähle die RAM-Größe in GB (DDR4 ECC)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-5 gap-3 sm:grid-cols-10">
								{#each ramOptions as option}
									<button
										class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {ram === option ? 'border-primary bg-primary/10' : 'border-border'}"
										onclick={() => (ram = option)}
									>
										{#if ram === option}
											<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
										{/if}
										<div class="text-lg font-bold">{option}</div>
										<div class="text-xs text-muted-foreground">GB</div>
									</button>
								{/each}
							</div>
							<div class="text-sm text-muted-foreground">
								Gewählt: <strong>{ram} GB RAM</strong> (+{(ram * basePrices.ram).toFixed(2)}€/Monat)
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Storage Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<HardDrive class="h-5 w-5 text-primary" />
							NVMe SSD Storage
						</CardTitle>
						<CardDescription>
							Wähle die Speichergröße in GB (RAID-10)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
								{#each storageOptions as option}
									<button
										class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {storage === option ? 'border-primary bg-primary/10' : 'border-border'}"
										onclick={() => (storage = option)}
									>
										{#if storage === option}
											<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
										{/if}
										<div class="text-lg font-bold">{option}</div>
										<div class="text-xs text-muted-foreground">GB</div>
									</button>
								{/each}
							</div>
							<div class="text-sm text-muted-foreground">
								Gewählt: <strong>{storage} GB NVMe SSD</strong> (+{(storage * basePrices.storage).toFixed(2)}€/Monat)
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Bandwidth Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Network class="h-5 w-5 text-primary" />
							Netzwerk-Anbindung
						</CardTitle>
						<CardDescription>
							Wähle die Bandbreite (Unbegrenzter Traffic inklusive)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
								{#each bandwidthOptions as option}
									<button
										class="relative rounded-lg border-2 p-6 text-center transition-all hover:border-primary/50 {bandwidth === option ? 'border-primary bg-primary/10' : 'border-border'}"
										onclick={() => (bandwidth = option)}
									>
										{#if bandwidth === option}
											<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
										{/if}
										<div class="text-2xl font-bold">{option}</div>
										<div class="text-sm text-muted-foreground">Gbit/s</div>
									</button>
								{/each}
							</div>
							<div class="text-sm text-muted-foreground">
								Gewählt: <strong>{bandwidth} Gbit/s</strong> (+{(bandwidth * basePrices.bandwidth).toFixed(2)}€/Monat)
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Operating System -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Cloud class="h-5 w-5 text-primary" />
							Betriebssystem
						</CardTitle>
						<CardDescription>
							Wähle dein bevorzugtes Betriebssystem
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3">
							{#each operatingSystems as os}
								<button
									class="w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 {operatingSystem === os.id ? 'border-primary bg-primary/10' : 'border-border'}"
									onclick={() => (operatingSystem = os.id)}
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<span class="text-2xl">{os.icon}</span>
											<div>
												<div class="font-semibold">{os.name}</div>
											</div>
										</div>
										{#if operatingSystem === os.id}
											<CheckCircle2 class="h-5 w-5 text-primary" />
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Summary & Price - Right Sidebar -->
			<div class="lg:col-span-1">
				<div class="sticky top-24 space-y-6">
					<!-- Price Summary -->
					<Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Server class="h-5 w-5" />
								Deine Konfiguration
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-6">
							<!-- Configuration Summary -->
							<div class="space-y-3">
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">CPU:</span>
									<span class="font-semibold">{cpuCores} vCores</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">RAM:</span>
									<span class="font-semibold">{ram} GB</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Storage:</span>
									<span class="font-semibold">{storage} GB NVMe</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Netzwerk:</span>
									<span class="font-semibold">{bandwidth} Gbit/s</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">OS:</span>
									<span class="font-semibold">{operatingSystems.find(os => os.id === operatingSystem)?.name.split(' ')[0]}</span>
								</div>
							</div>

							<Separator />

							<!-- Included Features -->
							<div class="space-y-2">
								<div class="text-sm font-semibold mb-3">Inklusive:</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">DDoS-Schutz</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">Automatische Backups</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">IPv4 & IPv6</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">Root-Zugriff</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">Unbegrenzter Traffic</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">99.9% Uptime-Garantie</span>
								</div>
							</div>

							<Separator />

							<!-- Total Price -->
							<div class="space-y-2">
								<div class="flex justify-between items-baseline">
									<span class="text-muted-foreground">Monatlicher Preis:</span>
									<div class="text-right">
										<div class="text-3xl font-bold text-foreground">{totalPrice}€</div>
										<div class="text-xs text-muted-foreground">pro Monat</div>
									</div>
								</div>
								<div class="text-xs text-muted-foreground text-center pt-2">
									Keine Einrichtungsgebühr • Monatlich kündbar
								</div>
							</div>

							<Button class="w-full gap-2" size="lg">
								Jetzt bestellen
								<ArrowRight class="h-5 w-5" />
							</Button>

							<div class="text-center">
								<Button variant="ghost" size="sm" href="/vps">
									Zurück zur Übersicht
								</Button>
							</div>
						</CardContent>
					</Card>

					<!-- Info Card -->
					<Card class="border-border/50">
						<CardContent class="pt-6">
							<div class="space-y-4 text-sm">
								<div class="flex gap-3">
									<CheckCircle2 class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<div>
										<p class="font-semibold mb-1">Sofortige Aktivierung</p>
										<p class="text-muted-foreground text-xs">
											Dein VPS ist in wenigen Minuten einsatzbereit
										</p>
									</div>
								</div>
								<div class="flex gap-3">
									<CheckCircle2 class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<div>
										<p class="font-semibold mb-1">24/7 Support</p>
										<p class="text-muted-foreground text-xs">
											Unser Team hilft dir bei Fragen jederzeit
										</p>
									</div>
								</div>
								<div class="flex gap-3">
									<CheckCircle2 class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<div>
										<p class="font-semibold mb-1">Upgrade jederzeit möglich</p>
										<p class="text-muted-foreground text-xs">
											Ressourcen können jederzeit erweitert werden
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</div>
</section>

