<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Gamepad2,
		Cpu,
		HardDrive,
		Users,
		CheckCircle2,
		ArrowRight,
		Settings,
		Zap,
		Shield,
		Download
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import * as Select from '$lib/components/ui/select/index.js';
	import minecraftImg from '$lib/assets/gameservers/minecraft.jpg';
	import cs2Img from '$lib/assets/gameservers/cs2.png';
	import arkImg from '$lib/assets/gameservers/ark.jpg';
	import rustImg from '$lib/assets/gameservers/rust.png';

	let { data }: { data: PageData } = $props();

	// Configuration state
	let serverName = $state('');
	let cpuCores = $state(2);
	let ram = $state(4);
	let storage = $state(20);
	let slots = $state(-1); // Default: Unlimited für Minecraft
	let selectedGame = $state('minecraft-java');
	let selectedEgg = $state<string>('16'); // Default: Paper (Nest 6)
	let selectedLocationId = $state<string | undefined>(undefined);
	let selectedJavaVersion = $state<string>('ghcr.io/ptero-eggs/yolks:java_17'); // nur Minecraft Java

	// Java-Versionen für Minecraft (Label | Docker-Image)
	const JAVA_VERSIONS = [
		{ label: 'Java 22', image: 'ghcr.io/ptero-eggs/yolks:java_22' },
		{ label: 'Java 21', image: 'ghcr.io/ptero-eggs/yolks:java_21' },
		{ label: 'Java 17', image: 'ghcr.io/ptero-eggs/yolks:java_17' },
		{ label: 'Java 16', image: 'ghcr.io/ptero-eggs/yolks:java_16' },
		{ label: 'Java 11', image: 'ghcr.io/ptero-eggs/yolks:java_11' },
		{ label: 'Java 8', image: 'ghcr.io/ptero-eggs/yolks:java_8' }
	];

	// Spiele: Nest 6 = Minecraft Java, Nest 7 = Minecraft Bedrock
	const games = [
		{ id: 'minecraft-java', name: 'Minecraft Java', nestId: 6, eggId: 16, image: minecraftImg },
		{ id: 'minecraft-bedrock', name: 'Minecraft Bedrock', nestId: 7, eggId: 23, image: minecraftImg },
	];

	// Nest 6 – Minecraft Java Eggs (Pterodactyl Nest ID 6)
	const minecraftJavaEggs = [
		{ id: 15, name: 'Velocity', description: 'Velocity is a Minecraft server proxy with unparalleled server support, scalability, and flexibility.', servers: 0 },
		{ id: 16, name: 'Paper', description: 'High performance Spigot fork that aims to fix gameplay and mechanics inconsistencies.', servers: 0 },
		{ id: 17, name: 'Folia', description: 'Fork of Paper which adds regionised multithreading to the dedicated server.', servers: 0 },
		{ id: 18, name: 'Purpur', description: 'A drop-in replacement for Paper servers designed for configurability and new gameplay features.', servers: 0 },
		{ id: 19, name: 'SpongeVanilla', description: 'SpongeVanilla is the implementation of the Sponge API on top of Vanilla Minecraft.', servers: 0 },
		{ id: 20, name: 'SpongeForge', description: 'A community-driven open source Minecraft: Java Edition modding platform.', servers: 0 },
		{ id: 21, name: 'Forge Enhanced', description: 'Minecraft Forge Server. Forge is a modding API for mods and compatibility.', servers: 0 },
		{ id: 22, name: 'NeoForge', description: 'NeoForge Server. NeoForge is a modding API, a fork of Minecraft Forge.', servers: 0 },
		{ id: 43, name: 'Fabric', description: 'Fabric is a lightweight, modular mod loader for Minecraft Java Edition.', servers: 0 },
	];

	// Nest 7 – Minecraft Bedrock Eggs (Pterodactyl Nest ID 7)
	const minecraftBedrockEggs = [
		{ id: 23, name: 'Nukkit', description: 'Nukkit is a nuclear-powered server software for Minecraft Bedrock Edition.', servers: 0 },
		{ id: 24, name: 'PowerNukkitX', description: 'PowerNukkitX support for Pterodactyl.', servers: 0 },
		{ id: 25, name: 'Waterdog PE', description: 'Brand new proxy server for Minecraft: Bedrock Edition.', servers: 0 },
	];

	const selectedEggLabel = $derived.by(() => {
		if (selectedGame === 'minecraft-java') {
			return minecraftJavaEggs.find((e) => e.id.toString() === selectedEgg)?.name ?? 'Paper';
		}
		if (selectedGame === 'minecraft-bedrock') {
			return minecraftBedrockEggs.find((e) => e.id.toString() === selectedEgg)?.name ?? 'Nukkit';
		}
		return selectedEgg;
	});

	// Price calculation - angepasst für Max-Konfiguration (8 Cores, 16 GB RAM, 200 GB) = 39.99€
	// 8 * 1.50 = 12.00€, 16 * 0.80 = 12.80€, 200 * 0.07595 = 15.19€, Summe = 39.99€
	const basePrices = {
		cpu: 1.50,    // pro vCore
		ram: 0.80,    // pro GB
		storage: 0.07595, // pro GB (angepasst für genau 39.99€ bei Max-Konfiguration)
		slots: 0.20   // pro Slot
	};

	const isMinecraft = $derived(selectedGame === 'minecraft-java' || selectedGame === 'minecraft-bedrock');

	let totalPrice = $derived.by(() => {
		const cpuPrice = cpuCores * basePrices.cpu;
		const ramPrice = ram * basePrices.ram;
		const storagePrice = storage * basePrices.storage;
		const slotsPrice = isMinecraft ? 0 : slots * basePrices.slots;
		const subtotal = cpuPrice + ramPrice + storagePrice + slotsPrice;
		const discountedPrice = subtotal * 0.75;
		return discountedPrice.toFixed(2);
	});

	let originalPrice = $derived.by(() => {
		const cpuPrice = cpuCores * basePrices.cpu;
		const ramPrice = ram * basePrices.ram;
		const storagePrice = storage * basePrices.storage;
		const slotsPrice = isMinecraft ? 0 : slots * basePrices.slots;
		const total = cpuPrice + ramPrice + storagePrice + slotsPrice;
		return total.toFixed(2);
	});

	// CPU options
	const cpuOptions = [1, 2, 4, 6, 8];
	// RAM options
	const ramOptions = [2, 4, 6, 8, 12, 16];
	// Storage options
	const storageOptions = [10, 20, 30, 50, 75, 100, 150, 200];
	// Slot options
	const slotOptions = [5, 10, 15, 20, 25, 30, 50, 100];
	const minecraftSlotOptions = [10, 20, 50, 100, 200, 500, 1000, -1]; // -1 = Unlimited

	function handleGameSelect(gameId: string) {
		selectedGame = gameId;
		const game = games.find((g) => g.id === gameId);
		if (game) {
			selectedEgg = game.eggId.toString(); // Minecraft Java: 16 (Paper), Bedrock: 23 (Nukkit)
		}
	}

	function handleEggSelect(eggId: number | string) {
		selectedEgg = typeof eggId === 'string' ? eggId : eggId.toString();
	}

	function proceedToCheckout() {
		if (!serverName.trim()) {
			alert('Bitte gib einen Server-Namen ein');
			return;
		}

		const slotsValue = isMinecraft && slots === -1 ? 9999 : slots;
		const eggIdNum = parseInt(selectedEgg, 10);
		// Eine Location: automatisch erste/ einzige verwenden oder Fallback
		const firstLocId = data.locations?.[0]?.id;
		const locationIdNum = selectedLocationId ? parseInt(selectedLocationId, 10) : (firstLocId != null ? (typeof firstLocId === 'number' ? firstLocId : parseInt(String(firstLocId), 10)) : (data.defaultLocationId ?? 2));
		const game = games.find((g) => g.id === selectedGame);
		const nestId = game?.nestId ?? 6;

		const params = new URLSearchParams({
			name: serverName,
			cpu: cpuCores.toString(),
			ram: ram.toString(),
			storage: storage.toString(),
			slots: slotsValue.toString(),
			game: selectedGame,
			eggId: eggIdNum.toString(),
			nestId: nestId.toString(),
			locationId: locationIdNum.toString(),
			price: totalPrice
		});
		if (selectedGame === 'minecraft-java') {
			params.set('javaVersion', selectedJavaVersion);
		}

		goto(`/gameserver/checkout?${params.toString()}`);
	}

	// Nur eine Location: automatisch ersten/ einzigen Standort verwenden
	$effect(() => {
		if (data.locations && data.locations.length > 0) {
			selectedLocationId = data.locations[0].id.toString();
		}
	});
</script>

<svelte:head>
	<title>Gameserver Konfigurator - Individuelle Konfiguration | TitanNode</title>
	<meta name="description" content="Konfiguriere deinen perfekten Gameserver nach deinen Anforderungen. CPU, RAM, Storage und mehr individuell wählbar." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-12 sm:py-20">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="secondary" class="mb-4 px-4 py-2">
				<Settings class="mr-2 h-4 w-4" />
				Gameserver Konfigurator
			</Badge>

			<h1 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
				Konfiguriere deinen
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					individuellen Gameserver
				</span>
			</h1>

			<p class="mb-8 text-lg text-muted-foreground sm:text-xl">
				Stelle dir deinen perfekten Gameserver zusammen. 
				Wähle Spiel, CPU, RAM, Storage und mehr nach deinen Bedürfnissen.
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
				<!-- Server Name -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Gamepad2 class="h-5 w-5 text-primary" />
							Server-Name
						</CardTitle>
						<CardDescription>
							Gib deinem Server einen Namen
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							bind:value={serverName}
							placeholder="z.B. Mein Minecraft Server"
							maxlength={50}
						/>
					</CardContent>
				</Card>

				<!-- Game Selection -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Gamepad2 class="h-5 w-5 text-primary" />
							Spiel auswählen
						</CardTitle>
						<CardDescription>
							Wähle das Spiel für deinen Server
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
							{#each games as game}
								<button
									class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {selectedGame === game.id ? 'border-primary bg-primary/10' : 'border-border'}"
									onclick={() => handleGameSelect(game.id)}
								>
									{#if selectedGame === game.id}
										<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
									{/if}
									{#if game.image}
										<img
											src={game.image}
											alt={game.name}
											class="mx-auto mb-2 h-12 w-12 rounded-md object-cover shadow-sm"
											loading="lazy"
										/>
									{/if}
									<div class="text-sm font-semibold">{game.name}</div>
								</button>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Minecraft Java – Nest Eggs + Java-Version -->
				{#if selectedGame === 'minecraft-java'}
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Settings class="h-5 w-5 text-primary" />
								Server-Typ (Nest 6)
							</CardTitle>
							<CardDescription>
								Wähle den Minecraft-Java-Server-Typ
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Select.Root type="single" bind:value={selectedEgg}>
								<Select.Trigger class="w-full">
									{selectedEggLabel}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Minecraft Java</Select.Label>
										{#each minecraftJavaEggs as egg (egg.id)}
											<Select.Item value={egg.id.toString()} label={egg.name}>
												<div class="flex flex-col">
													<span class="font-medium">{egg.name}</span>
													<span class="text-xs text-muted-foreground">{egg.description}</span>
												</div>
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Settings class="h-5 w-5 text-primary" />
								Java-Version
							</CardTitle>
							<CardDescription>
								Wähle die Java-Version für deinen Minecraft-Java-Server
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Select.Root type="single" bind:value={selectedJavaVersion}>
								<Select.Trigger class="w-full">
									{JAVA_VERSIONS.find((j) => j.image === selectedJavaVersion)?.label ?? 'Java 17'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Java-Version</Select.Label>
										{#each JAVA_VERSIONS as java (java.image)}
											<Select.Item value={java.image} label={java.label}>
												{java.label}
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</CardContent>
					</Card>
				{/if}

				<!-- Minecraft Bedrock – Nest Eggs (Nest 7) -->
				{#if selectedGame === 'minecraft-bedrock'}
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Settings class="h-5 w-5 text-primary" />
								Server-Typ (Nest 7)
							</CardTitle>
							<CardDescription>
								Wähle den Minecraft-Bedrock-Server-Typ
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Select.Root type="single" bind:value={selectedEgg}>
								<Select.Trigger class="w-full">
									{selectedEggLabel}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Minecraft Bedrock</Select.Label>
										{#each minecraftBedrockEggs as egg (egg.id)}
											<Select.Item value={egg.id.toString()} label={egg.name}>
												<div class="flex flex-col">
													<span class="font-medium">{egg.name}</span>
													<span class="text-xs text-muted-foreground">{egg.description}</span>
												</div>
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</CardContent>
					</Card>
				{/if}

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
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
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

				<!-- Slots Configuration -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Users class="h-5 w-5 text-primary" />
							Spieler-Slots
						</CardTitle>
						<CardDescription>
							{#if isMinecraft}
								Unbegrenzte Spieler-Slots – kostenlos!
							{:else}
								Wähle die maximale Anzahl an Spielern
							{/if}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
								{#if isMinecraft}
									{#each minecraftSlotOptions as option}
										<button
											class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {slots === option ? 'border-primary bg-primary/10' : 'border-border'}"
											onclick={() => (slots = option)}
										>
											{#if slots === option}
												<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
											{/if}
											<div class="text-lg font-bold">
												{option === -1 ? '∞' : option}
											</div>
											<div class="text-xs text-muted-foreground">
												{option === -1 ? 'Unlimited' : 'Slots'}
											</div>
										</button>
									{/each}
								{:else}
									{#each slotOptions as option}
										<button
											class="relative rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50 {slots === option ? 'border-primary bg-primary/10' : 'border-border'}"
											onclick={() => (slots = option)}
										>
											{#if slots === option}
												<CheckCircle2 class="absolute -top-2 -right-2 h-5 w-5 text-primary" />
											{/if}
											<div class="text-lg font-bold">{option}</div>
											<div class="text-xs text-muted-foreground">Slots</div>
										</button>
									{/each}
								{/if}
							</div>
							<div class="text-sm text-muted-foreground">
								{#if isMinecraft}
									<strong>Unbegrenzte Spieler-Slots</strong> – kostenlos!
								{:else}
									Gewählt: <strong>{slots} Spieler-Slots</strong> (+{(slots * basePrices.slots).toFixed(2)}€/Monat)
								{/if}
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
								<Gamepad2 class="h-5 w-5" />
								Deine Konfiguration
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-6">
							<!-- Configuration Summary -->
							<div class="space-y-3">
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Spiel:</span>
									<span class="font-semibold">{games.find(g => g.id === selectedGame)?.name || selectedGame}</span>
								</div>
								{#if selectedGame === 'minecraft-java' || selectedGame === 'minecraft-bedrock'}
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Server-Typ:</span>
										<span class="font-semibold">{selectedEggLabel}</span>
									</div>
								{/if}
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
									<span class="text-muted-foreground">Slots:</span>
									<span class="font-semibold">
										{#if isMinecraft && slots === -1}
											Unlimited
										{:else}
											{slots}
										{/if}
									</span>
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
									<span class="text-sm text-muted-foreground">One-Click-Installation</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">Mod/Plugin-Support</span>
								</div>
								<div class="flex items-start gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary mt-0.5 shrink-0" />
									<span class="text-sm text-muted-foreground">24/7 Support</span>
								</div>
							</div>

							<Separator />

							<!-- Total Price -->
							<div class="space-y-2">
								{#if parseFloat(originalPrice) > parseFloat(totalPrice)}
									<div class="flex justify-between items-center text-sm">
										<span class="text-muted-foreground">Ursprünglicher Preis:</span>
										<span class="line-through text-muted-foreground">{originalPrice}€</span>
									</div>
									<div class="flex items-center gap-2">
										<Badge variant="destructive" class="px-2 py-1">-25%</Badge>
										<span class="text-xs text-muted-foreground">Rabatt</span>
									</div>
								{/if}
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
								<Button variant="ghost" size="sm" href="/gameserver">
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
