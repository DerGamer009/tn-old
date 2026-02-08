<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Server,
		Cpu,
		HardDrive,
		CheckCircle2,
		ArrowRight,
		Settings,
		Zap,
		Code
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	// Configuration state
	let appName = $state('');
	let cpuCores = $state(1);
	let ram = $state(2);
	let storage = $state(10);
	let selectedApp = $state('nodejs');
	let selectedEgg = $state(32); // Default: Node.js generic (Nest 8)

	// App options with Egg IDs (Nest 8 = App Hosting)
	const apps = [
		{ id: 'code-server', name: 'Code-Server', eggId: 26, icon: '💻', description: 'VS Code im Browser' },
		{ id: 'java', name: 'Generic Java', eggId: 27, icon: '☕', description: 'Java Container' },
		{ id: 'grafana', name: 'Grafana', eggId: 28, icon: '📊', description: 'Observability & Visualisierung' },
		{ id: 'mariadb', name: 'MariaDB', eggId: 29, icon: '🗄️', description: 'MySQL-kompatible Datenbank' },
		{ id: 'mongodb7', name: 'MongoDB 7', eggId: 30, icon: '🍃', description: 'Document Database' },
		{ id: 'mongodb8', name: 'MongoDB 8', eggId: 31, icon: '🍃', description: 'Document Database' },
		{ id: 'nodejs', name: 'Node.js', eggId: 32, icon: '📦', description: 'JavaScript Runtime' },
		{ id: 'postgres', name: 'Postgres 17', eggId: 33, icon: '🐘', description: 'PostgreSQL Datenbank' },
		{ id: 'python', name: 'Python', eggId: 34, icon: '🐍', description: 'Python Runtime' },
		{ id: 'redis6', name: 'Redis 6', eggId: 35, icon: '🔴', description: 'In-Memory Datenbank' },
		{ id: 'redis7', name: 'Redis 7', eggId: 36, icon: '🔴', description: 'In-Memory Datenbank' },
		{ id: 'sftp', name: 'SFTP Storage', eggId: 37, icon: '📁', description: 'Privater SFTP-Speicher' },
		{ id: 'sinusbot', name: 'Sinusbot', eggId: 38, icon: '🎵', description: 'Musicbot Discord/Teamspeak' },
		{ id: 'uptime-kuma', name: 'Uptime Kuma', eggId: 39, icon: '📈', description: 'Monitoring Tool' },
	];

	// Price calculation
	const basePrices = {
		cpu: 2.00,    // pro vCore
		ram: 1.20,    // pro GB
		storage: 0.15 // pro GB
	};

	let totalPrice = $derived.by(() => {
		const cpuPrice = cpuCores * basePrices.cpu;
		const ramPrice = ram * basePrices.ram;
		const storagePrice = storage * basePrices.storage;
		return (cpuPrice + ramPrice + storagePrice).toFixed(2);
	});

	// CPU options
	const cpuOptions = [1, 2, 4, 6, 8];
	// RAM options
	const ramOptions = [1, 2, 4, 6, 8, 12, 16];
	// Storage options
	const storageOptions = [5, 10, 20, 30, 50, 75, 100];

	function handleAppSelect(appId: string) {
		selectedApp = appId;
		const app = apps.find(a => a.id === appId);
		if (app) {
			selectedEgg = app.eggId;
		}
	}

	function proceedToCheckout() {
		if (!appName.trim()) {
			alert('Bitte gib einen App-Namen ein');
			return;
		}

		const params = new URLSearchParams({
			name: appName,
			cpu: cpuCores.toString(),
			ram: ram.toString(),
			storage: storage.toString(),
			app: selectedApp,
			eggId: selectedEgg.toString(),
			price: totalPrice
		});

		goto(`/apps/checkout?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>App Hosting Konfigurator - Individuelle Konfiguration | TitanNode</title>
	<meta name="description" content="Konfiguriere deine perfekte App Hosting Lösung nach deinen Anforderungen. CPU, RAM, Storage und mehr individuell wählbar." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-12 sm:py-20">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="secondary" class="mb-4 px-4 py-2">
				<Settings class="mr-2 h-4 w-4" />
				App Hosting Konfigurator
			</Badge>

			<h1 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
				Konfiguriere deine
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					individuelle App Hosting Lösung
				</span>
			</h1>

			<p class="mb-8 text-lg text-muted-foreground sm:text-xl">
				Stelle dir deine perfekte App Hosting Lösung zusammen. 
				Wähle App-Typ, CPU, RAM, Storage und mehr nach deinen Bedürfnissen.
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
				<!-- App Name -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Server class="h-5 w-5 text-primary" />
							App-Name
						</CardTitle>
						<CardDescription>
							Gib deiner App einen Namen
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							bind:value={appName}
							placeholder="z.B. Meine Node.js App"
							maxlength={50}
						/>
					</CardContent>
				</Card>

				<!-- App Selection -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Code class="h-5 w-5 text-primary" />
							App-Typ auswählen
						</CardTitle>
						<CardDescription>
							Wähle den Typ deiner App
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{#each apps as app}
								<button
									class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {selectedApp === app.id ? 'border-primary bg-primary/10' : 'border-border'}"
									onclick={() => handleAppSelect(app.id)}
								>
									{#if selectedApp === app.id}
										<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
									{/if}
									<div class="text-2xl mb-2">{app.icon}</div>
									<div class="text-sm font-semibold">{app.name}</div>
									<div class="text-xs text-muted-foreground mt-1">{app.description}</div>
								</button>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- CPU Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Cpu class="h-5 w-5 text-primary" />
							CPU Cores
						</CardTitle>
						<CardDescription>
							Wähle die Anzahl der vCPU Cores
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-5 gap-3">
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
							Wähle die RAM-Größe in GB
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-7">
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
							Wähle die Speichergröße in GB
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-7">
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
									<span class="text-muted-foreground">App-Typ:</span>
									<span class="font-semibold">{apps.find(a => a.id === selectedApp)?.name || selectedApp}</span>
								</div>
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
									<span class="text-sm text-muted-foreground">One-Click-Deployment</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">24/7 Support</span>
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

							<Button class="w-full gap-2" size="lg" onclick={proceedToCheckout}>
								Jetzt bestellen
								<ArrowRight class="h-5 w-5" />
							</Button>

							<div class="text-center">
								<Button variant="ghost" size="sm" href="/dashboard/apps">
									Zurück zur Übersicht
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</div>
</section>
