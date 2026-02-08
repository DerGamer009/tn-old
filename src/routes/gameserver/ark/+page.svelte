<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Bone,
		Shield,
		Zap,
		CheckCircle2,
		ArrowRight,
		Users,
		Settings,
		Globe,
		Gauge,
		Database,
		Tag
	} from '@lucide/svelte';
</script>

<svelte:head>
	<title>ARK: Survival Server Hosting - Evolved & Ascended | TitanNode</title>
	<meta name="description" content="Premium ARK-Server mit hoher Performance, Mod-Support und automatischen Updates. Für Evolved & Ascended." />
</svelte:head>

<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-green-500/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Bone class="mr-2 h-4 w-4" />
				ARK Server
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				ARK: Survival
				<span class="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
					Server Hosting
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Leistungsstarke ARK-Server für Evolved und Ascended. Mit Mod-Support, 
				Cluster-Funktion und automatischen Updates.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
					Server jetzt erstellen
					<ArrowRight class="h-5 w-5" />
				</Button>
			</div>

			<div class="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">100+</div>
					<div class="text-sm text-muted-foreground">Mods</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">Maps</div>
					<div class="text-sm text-muted-foreground">Alle verfügbar</div>
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

<section id="packages" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">ARK Server Pakete</Badge>
			<div class="mb-4 flex items-center justify-center gap-3">
				<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Für jede Tribegröße
				</h2>
				<Badge variant="default" class="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold">
					<Tag class="mr-1 h-3 w-3" />
					25% Sale
				</Badge>
			</div>
		</div>

		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Small Tribe</CardTitle>
					<CardDescription>Bis zu 10 Spieler</CardDescription>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">14,99€</span>
								<span class="text-4xl font-bold text-foreground">11,24€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">8 GB RAM</span>
					</div>
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">100 GB NVMe SSD</span>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-primary/50 relative overflow-hidden shadow-lg">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg z-10">
					BELIEBT
				</div>
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Medium Tribe</CardTitle>
					<CardDescription>Bis zu 30 Spieler</CardDescription>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">24,99€</span>
								<span class="text-4xl font-bold text-foreground">18,74€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">16 GB RAM</span>
					</div>
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">200 GB NVMe SSD</span>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Large Tribe</CardTitle>
					<CardDescription>Bis zu 70 Spieler</CardDescription>
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
				<CardContent class="space-y-3">
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">32 GB RAM</span>
					</div>
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">400 GB NVMe SSD</span>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Mega Tribe</CardTitle>
					<CardDescription>100+ Spieler</CardDescription>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">59,99€</span>
								<span class="text-4xl font-bold text-foreground">44,99€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">64 GB RAM</span>
					</div>
					<div class="flex items-start gap-2">
						<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
						<span class="text-sm">1 TB NVMe SSD</span>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-500/10 mx-auto">
				<Bone class="h-10 w-10 text-emerald-600" />
			</div>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Starte dein ARK-Abenteuer
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Dein ARK-Server mit allen Maps und Mods in unter 10 Minuten online.
			</p>
			<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
				Server erstellen
				<ArrowRight class="h-5 w-5" />
			</Button>
		</div>
	</div>
</section>

