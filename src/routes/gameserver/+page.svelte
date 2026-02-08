<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Gamepad2,
		Shield,
		Zap,
		Users,
		Globe,
		CheckCircle2,
		ArrowRight,
		Gauge,
		Server,
		Rocket,
		Trophy,
		Headphones,
		Settings,
		Clock,
		HardDrive,
		Pickaxe,
		Target,
		Bone,
		Hammer,
		Swords,
		Car,
		Footprints,
		Factory,
		Tag
	} from '@lucide/svelte';

	// Beliebte Spiele
	const popularGames = [
		{
			name: 'Minecraft',
			icon: Pickaxe,
			iconColor: 'text-green-500',
			players: '2-200',
			description: 'Java & Bedrock Edition',
			popular: true,
			href: '/gameserver/minecraft'
		},
		{
			name: 'CS:GO / CS2',
			icon: Target,
			iconColor: 'text-orange-500',
			players: '2-64',
			description: 'Counter-Strike Server',
			popular: true,
			href: '/gameserver/csgo'
		},
		{
			name: 'ARK: Survival',
			icon: Bone,
			iconColor: 'text-emerald-500',
			players: '2-100',
			description: 'Evolved & Ascended',
			popular: true,
			href: '/gameserver/ark'
		},
		{
			name: 'Rust',
			icon: Hammer,
			iconColor: 'text-amber-600',
			players: '2-200',
			description: 'Survival Multiplayer',
			popular: false,
			href: '/gameserver/rust'
		},
		{
			name: 'Valheim',
			icon: Swords,
			iconColor: 'text-blue-500',
			players: '2-10',
			description: 'Viking Survival',
			popular: false,
			href: '/gameserver/valheim'
		},
		{
			name: 'FiveM / GTA V',
			icon: Car,
			iconColor: 'text-purple-500',
			players: '2-128',
			description: 'GTA Roleplay',
			popular: true,
			href: '/gameserver/fivem'
		},
		{
			name: 'Palworld',
			icon: Footprints,
			iconColor: 'text-cyan-500',
			players: '2-32',
			description: 'Multiplayer Server',
			popular: false,
			href: '/gameserver/palworld'
		},
		{
			name: 'Satisfactory',
			icon: Factory,
			iconColor: 'text-yellow-600',
			players: '2-4',
			description: 'Factory Building',
			popular: false,
			href: '/gameserver/satisfactory'
		}
	];
</script>

<svelte:head>
	<title>Gameserver Hosting - Minecraft, CS:GO, ARK & mehr | TitanNode</title>
	<meta name="description" content="Premium Gameserver mit niedrigster Latenz, DDoS-Schutz und 24/7 Support. Minecraft, CS:GO, ARK, Rust und viele mehr." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(244,114,182,0.16),_transparent_55%)]"></div>
	<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.25))]"></div>

	<div class="container relative mx-auto max-w-screen-2xl px-4 py-16 sm:py-24 lg:py-28">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Sale Badge -->
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			
			<!-- Badge -->
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Gamepad2 class="mr-2 h-4 w-4" />
				Gameserver Hosting
			</Badge>

			<!-- Headline -->
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Gaming ohne
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					Kompromisse
				</span>
			</h1>

			<!-- Subheadline -->
			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Professionelle Gameserver mit niedrigster Latenz, High-End Hardware und automatischer Installation.
				Perfekt für Minecraft, CS:GO, ARK und über 100 weitere Spiele.
			</p>

			<!-- CTA Buttons -->
			<div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg shadow-md shadow-primary/20" href="/gameserver/konfigurator">
					Server jetzt bestellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="gap-2 px-8 py-6 text-lg border-border/70 bg-background/70 hover:bg-background"
					href="#games"
				>
					<Gamepad2 class="h-5 w-5" />
					Spiele ansehen
				</Button>
			</div>

			<!-- Quick Stats -->
			<div class="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">&lt;10ms</div>
					<div class="text-sm text-muted-foreground">Ping (Inland)</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">100+</div>
					<div class="text-sm text-muted-foreground">Spiele</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">99.9%</div>
					<div class="text-sm text-muted-foreground">Uptime</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">24/7</div>
					<div class="text-sm text-muted-foreground">Support</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Popular Games Section -->
<section id="games" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Beliebte Spiele</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Über 100 Spiele verfügbar
			</h2>
			<p class="text-lg text-muted-foreground">
				One-Click-Installation für die beliebtesten Multiplayer-Spiele. Dein Server ist in Minuten startklar.
			</p>
		</div>

		<!-- Games Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each popularGames as game}
				<a href={game.href || '#packages'} class="block">
					<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg relative overflow-hidden h-full cursor-pointer">
						{#if game.popular}
							<div class="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
								BELIEBT
							</div>
						{/if}
						<CardHeader>
							<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
								<svelte:component this={game.icon} class="h-8 w-8 {game.iconColor}" />
							</div>
							<CardTitle>{game.name}</CardTitle>
							<CardDescription>
								<div class="space-y-1">
									<div class="flex items-center gap-2 text-sm">
										<Users class="h-3 w-3" />
										{game.players} Spieler
									</div>
									<div class="text-xs">{game.description}</div>
								</div>
							</CardDescription>
						</CardHeader>
					</Card>
				</a>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<p class="text-muted-foreground mb-4">
				Und viele weitere: Terraria, 7 Days to Die, Project Zomboid, Conan Exiles, DayZ, Eco, Factorio, Insurgency, Left 4 Dead 2, Pavlov VR, Squad, Team Fortress 2, Unturned, V Rising und mehr...
			</p>
			<Button variant="outline" size="lg" href="/gameserver/games">
				<Gamepad2 class="mr-2 h-5 w-5" />
				Alle Spiele anzeigen
			</Button>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="w-full border-y bg-background py-20 sm:py-28">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Features</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Gaming auf höchstem Niveau
			</h2>
			<p class="text-lg text-muted-foreground">
				Unsere Gameserver bieten alles, was du für das perfekte Gaming-Erlebnis brauchst.
			</p>
		</div>

		<!-- Feature Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Zap class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>High-Frequency CPUs</CardTitle>
					<CardDescription>
						Prozessoren mit bis zu 5.0 GHz für maximale Gaming-Performance
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 2 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Gauge class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Niedrigste Latenz</CardTitle>
					<CardDescription>
						Optimierte Routing und Premium-Anbindung für minimalen Ping
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 3 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Shield class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>DDoS-Schutz</CardTitle>
					<CardDescription>
						Professioneller Schutz gegen Angriffe - dein Server bleibt online
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 4 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Rocket class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Sofort-Start</CardTitle>
					<CardDescription>
						One-Click-Installation - dein Server ist in wenigen Minuten online
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 5 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Settings class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Game Panel</CardTitle>
					<CardDescription>
						Modernes Web-Interface für einfache Server-Verwaltung und Konfiguration
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 6 -->
			<Card class="border-border/50 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
						<Headphones class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Gamer-Support</CardTitle>
					<CardDescription>
						24/7 Support von echten Gamern, die deine Probleme verstehen
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
			<Badge variant="secondary" class="mb-4">Gameserver Pakete</Badge>
			<div class="mb-4 flex items-center justify-center gap-3">
				<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Perfekt für jede Spielergröße
				</h2>
				<Badge variant="default" class="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold">
					<Tag class="mr-1 h-3 w-3" />
					25% Sale
				</Badge>
			</div>
			<p class="text-lg text-muted-foreground">
				Von kleinen Private-Servern bis zu großen Communities – wir haben das richtige Paket.
			</p>
		</div>

		<!-- Pricing Grid -->
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Starter -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Starter</CardTitle>
						<CardDescription>Perfekt für kleine Gruppen</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">4,99€</span>
								<span class="text-4xl font-bold text-foreground">3,74€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">2 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">High-Frequency</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
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
							<span class="text-sm">1 Gbit/s Port</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 10 Slots</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Gamer -->
			<Card class="border-primary/60 bg-background relative overflow-hidden shadow-lg hover:-translate-y-1.5 transition-transform">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg z-10">
					BELIEBT
				</div>
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Gamer</CardTitle>
						<CardDescription>Für aktive Communities</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">9,99€</span>
								<span class="text-4xl font-bold text-foreground">7,49€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">High-Frequency</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
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
							<span class="text-sm">2 Gbit/s Port</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 30 Slots</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Pro -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Pro</CardTitle>
						<CardDescription>Große Server & Mods</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">19,99€</span>
								<span class="text-4xl font-bold text-foreground">14,99€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">High-Frequency</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
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
							<span class="text-sm">5 Gbit/s Port</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 100 Slots</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Elite -->
			<Card class="border-border/60 bg-background/80 relative overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-transform">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Elite</CardTitle>
						<CardDescription>Premium-Communities</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">39,99€</span>
								<span class="text-4xl font-bold text-foreground">29,99€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">High-Frequency</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">32 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
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
							<span class="text-sm">10 Gbit/s Port</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzte Slots</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>
		</div>

		<!-- All included -->
		<div class="mt-16">
			<Card class="border-primary/25 bg-gradient-to-br from-primary/10 to-accent/10">
				<CardContent class="p-8">
					<h3 class="text-xl font-bold mb-6 text-center">In allen Paketen inklusive:</h3>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">DDoS-Schutz inklusive</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Automatische Backups</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">One-Click-Installation</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Modernes Game Panel</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">FTP & MySQL Zugriff</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">24/7 Support</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
			</CardContent>
		</Card>
	</div>
</section>

<!-- Why Section -->
<section class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
			<!-- Left Column -->
			<div class="space-y-8">
				<div>
					<Badge variant="secondary" class="mb-4">Warum TitanNode?</Badge>
					<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Von Gamern für Gamer
					</h2>
					<p class="text-lg text-muted-foreground">
						Wir wissen, worauf es beim Gaming ankommt. Deshalb setzen wir auf High-End Hardware 
						und optimierte Netzwerkrouten für das beste Gaming-Erlebnis.
					</p>
				</div>

				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Trophy class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Premium-Standorte</h3>
							<p class="text-muted-foreground">
								Server in deutschen Rechenzentren mit direkter Anbindung an die wichtigsten Internet-Knoten.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Globe class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Niedrigste Latenz</h3>
							<p class="text-muted-foreground">
								Optimiertes Routing für minimalen Ping - selbst zu internationalen Spielern.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Clock class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Sofort startklar</h3>
							<p class="text-muted-foreground">
								Dein Server ist innerhalb von Minuten online - keine komplizierten Setups nötig.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Headphones class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Gamer-Support</h3>
							<p class="text-muted-foreground">
								Unser Support-Team besteht aus echten Gamern, die deine Probleme verstehen.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column - Features -->
			<div class="space-y-6">
				<Card class="border-border/50 bg-card">
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Settings class="h-5 w-5" />
							Game Panel Features
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-4">
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Gamepad2 class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">One-Click-Mods</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Installiere beliebte Mods und Plugins mit nur einem Klick - keine FTP nötig.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Gauge class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Live-Monitoring</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Überwache CPU, RAM und Spieleranzahl in Echtzeit.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Rocket class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Auto-Updates</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Halte dein Spiel automatisch auf dem neuesten Stand.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<HardDrive class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Datei-Manager</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Bearbeite Konfigurationsdateien direkt im Browser.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Zap class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Snapshots</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Erstelle Backups und stelle sie mit einem Klick wieder her.
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
<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<Gamepad2 class="h-16 w-16 text-primary mx-auto mb-6" />
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Bereit für den perfekten Gameserver?
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Starte noch heute mit deinem eigenen Gameserver. 
				Keine Einrichtungsgebühr, keine Vertragslaufzeit.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
					Server bestellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#contact">
					<Headphones class="h-5 w-5" />
					Beratung anfragen
				</Button>
			</div>
		</div>
	</div>
</section>

