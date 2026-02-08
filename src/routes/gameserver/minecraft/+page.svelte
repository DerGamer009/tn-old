<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Pickaxe,
		Shield,
		Zap,
		CheckCircle2,
		ArrowRight,
		Users,
		Server,
		Settings,
		Download,
		Rocket,
		Gauge,
		Globe,
		Lock,
		Database,
		Tag
	} from '@lucide/svelte';

	// Minecraft-spezifische Versionen/Modi
	const minecraftVersions = [
		{
			name: 'Java Edition',
			icon: Server,
			description: 'Klassischer Minecraft-Server',
			features: ['Vanilla', 'Spigot', 'Paper', 'Bukkit', 'Forge', 'Fabric']
		},
		{
			name: 'Bedrock Edition',
			icon: Globe,
			description: 'Crossplay mit Konsolen & Mobile',
			features: ['PocketMine', 'Nukkit', 'BDS (Official)']
		},
		{
			name: 'Modpacks',
			icon: Rocket,
			description: 'Beliebte Modpack-Server',
			features: ['FTB', 'CurseForge', 'Tekkit', 'RLCraft', 'SkyFactory']
		}
	];
</script>

<svelte:head>
	<title>Minecraft Server Hosting - Java & Bedrock | TitanNode</title>
	<meta name="description" content="Premium Minecraft-Server mit DDoS-Schutz, Mod-Support und One-Click-Installation. Java & Bedrock Edition." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Pickaxe class="mr-2 h-4 w-4" />
				Minecraft Server
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Minecraft Server
				<span class="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
					ohne Limits
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Erstelle deinen eigenen Minecraft-Server mit Java oder Bedrock Edition. 
				Mit One-Click-Mods, automatischen Backups und niedrigster Latenz.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
					Server jetzt erstellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#features">
					<Settings class="h-5 w-5" />
					Features ansehen
				</Button>
			</div>

			<div class="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">1000+</div>
					<div class="text-sm text-muted-foreground">Mods & Plugins</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">&lt;10ms</div>
					<div class="text-sm text-muted-foreground">Ping</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">99.9%</div>
					<div class="text-sm text-muted-foreground">Uptime</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">24/7</div>
					<div class="text-sm text-muted-foreground">Online</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Versions Section -->
<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Versionen</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Alle Minecraft-Versionen
			</h2>
			<p class="text-lg text-muted-foreground">
				Von Vanilla bis zu den größten Modpacks - wir unterstützen alles.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each minecraftVersions as version}
				<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
					<CardHeader>
						<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-green-500/10">
							<svelte:component this={version.icon} class="h-8 w-8 text-green-600" />
						</div>
						<CardTitle>{version.name}</CardTitle>
						<CardDescription>{version.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							{#each version.features as feature}
								<div class="flex items-center gap-2">
									<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
									<span class="text-sm">{feature}</span>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Features</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Perfekt für Minecraft
			</h2>
			<p class="text-lg text-muted-foreground">
				Alle Features, die du für den perfekten Minecraft-Server brauchst.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Download class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>One-Click-Mods</CardTitle>
					<CardDescription>
						Installiere beliebte Plugins und Mods mit nur einem Klick
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Shield class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>DDoS-Schutz</CardTitle>
					<CardDescription>
						Professioneller Schutz gegen Angriffe und Griefing
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Zap class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>High-Performance</CardTitle>
					<CardDescription>
						Optimierte Server für minimalen Lag, selbst mit vielen Plugins
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Database class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>MySQL Datenbank</CardTitle>
					<CardDescription>
						Kostenlose MySQL-Datenbank für Plugins wie CoreProtect inklusive
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Settings class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Volle Kontrolle</CardTitle>
					<CardDescription>
						FTP-Zugriff, File-Manager und vollständige Server-Konfiguration
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Lock class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Automatische Backups</CardTitle>
					<CardDescription>
						Tägliche Backups deiner Welt - stelle sie jederzeit wieder her
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<!-- Packages Section -->
<section id="packages" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Minecraft Server Pakete</Badge>
			<div class="mb-4 flex items-center justify-center gap-3">
				<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Für jede Spielerzahl
				</h2>
				<Badge variant="default" class="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold">
					<Tag class="mr-1 h-3 w-3" />
					25% Sale
				</Badge>
			</div>
			<p class="text-lg text-muted-foreground">
				Von kleinen Survival-Servern bis zu großen Netzwerken mit Hunderten von Spielern.
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Small -->
			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Small</CardTitle>
						<CardDescription>Für Freunde & Familie</CardDescription>
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
								<p class="font-medium">2 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">25 GB NVMe SSD</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 10 Spieler</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Vanilla & Spigot</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Medium -->
			<Card class="border-primary/50 relative overflow-hidden shadow-lg">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg z-10">
					BELIEBT
				</div>
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Medium</CardTitle>
						<CardDescription>Für kleine Communities</CardDescription>
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
								<p class="font-medium">4 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">50 GB NVMe SSD</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 30 Spieler</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Alle Versionen & Mods</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Large -->
			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Large</CardTitle>
						<CardDescription>Für große Server</CardDescription>
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
								<p class="font-medium">8 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">100 GB NVMe SSD</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Bis zu 100 Spieler</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Modpacks & BungeeCord</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<!-- Network -->
			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Network</CardTitle>
						<CardDescription>Für Netzwerke</CardDescription>
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
								<p class="font-medium">16 GB RAM</p>
								<p class="text-sm text-muted-foreground">DDR4</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">200 GB NVMe SSD</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">200+ Spieler</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Premium Support</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>
		</div>

		<div class="mt-16">
			<Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
				<CardContent class="p-8">
					<h3 class="text-xl font-bold mb-6 text-center">In allen Paketen inklusive:</h3>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Sofortige Aktivierung</span>
						</div>
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
							<span class="text-sm">MySQL-Datenbank</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">FTP & File-Manager</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">24/7 Support</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- Popular Plugins Section -->
<section class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Beliebte Plugins</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
				One-Click-Installation
			</h2>
			<p class="text-lg text-muted-foreground">
				Installiere die beliebtesten Minecraft-Plugins mit nur einem Klick.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
			{#each ['EssentialsX', 'WorldEdit', 'LuckPerms', 'Vault', 'PlaceholderAPI', 'CoreProtect', 'WorldGuard', 'Multiverse-Core'] as plugin}
				<Card class="border-border/50">
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="text-base">{plugin}</CardTitle>
							<Download class="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
				</Card>
			{/each}
		</div>

		<div class="mt-8 text-center">
			<p class="text-muted-foreground">Und über 1000+ weitere Plugins aus Spigot, Bukkit, Paper und mehr...</p>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-green-500/10 mx-auto">
				<Pickaxe class="h-10 w-10 text-green-600" />
			</div>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Starte deinen Minecraft-Server
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Dein Server ist in unter 5 Minuten online. Keine Vertragslaufzeit, jederzeit kündbar.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
					Server erstellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="/support">
					<Users class="h-5 w-5" />
					Fragen? Support kontaktieren
				</Button>
			</div>
		</div>
	</div>
</section>

