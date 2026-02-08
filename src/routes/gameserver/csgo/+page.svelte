<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Target,
		Shield,
		Zap,
		CheckCircle2,
		ArrowRight,
		Users,
		Server,
		Settings,
		Gauge,
		Trophy,
		Radio,
		Tag
	} from '@lucide/svelte';
</script>

<svelte:head>
	<title>CS:GO & CS2 Server Hosting | TitanNode</title>
	<meta name="description" content="Premium CS:GO und CS2 Server mit niedrigster Latenz, 128-Tick und DDoS-Schutz." />
</svelte:head>

<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background to-yellow-500/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Target class="mr-2 h-4 w-4" />
				CS:GO / CS2 Server
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Counter-Strike Server
				<span class="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
					für Profis
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Professionelle CS:GO und CS2 Server mit 128-Tick, niedrigster Latenz und vollständiger Mod-Unterstützung.
				Perfekt für Competitive, Community-Server und Custom-Gamemodes.
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
					<div class="text-3xl font-bold text-foreground">128</div>
					<div class="text-sm text-muted-foreground">Tickrate</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">&lt;5ms</div>
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

<section id="features" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Features</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Optimiert für Counter-Strike
			</h2>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Gauge class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>128-Tick Server</CardTitle>
					<CardDescription>
						Professionelle 128-Tick-Server für präzises Competitive-Gaming
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Zap class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Niedrigste Latenz</CardTitle>
					<CardDescription>
						Optimierte Routing für minimalen Ping und keine Lags
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
						Enterprise-Level Schutz gegen Angriffe und Cheater
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Trophy class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Custom Gamemodes</CardTitle>
					<CardDescription>
						Surf, Bhop, Deathrun, Zombie Mod und viele mehr
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Radio class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>GOTV & Demos</CardTitle>
					<CardDescription>
						Automatische Demo-Aufnahme und GOTV-Support
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Settings class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>SourceMod & MetaMod</CardTitle>
					<CardDescription>
						Volle Plugin-Unterstützung mit FTP-Zugriff
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<section id="packages" class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">CS:GO / CS2 Pakete</Badge>
			<div class="mb-4 flex items-center justify-center gap-3">
				<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Für jede Community
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
					<div class="mb-2">
						<CardTitle>10 Slots</CardTitle>
						<CardDescription>Für kleine Teams</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">5,99€</span>
								<span class="text-4xl font-bold text-foreground">4,49€</span>
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
							<span class="text-sm">10 Slots</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">128-Tick</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">DDoS-Schutz</span>
						</div>
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
					<div class="mb-2">
						<CardTitle>32 Slots</CardTitle>
						<CardDescription>Community-Server</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">12,99€</span>
								<span class="text-4xl font-bold text-foreground">9,74€</span>
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
							<span class="text-sm">32 Slots</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">128-Tick</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">GOTV inklusive</span>
						</div>
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
					<div class="mb-2">
						<CardTitle>64 Slots</CardTitle>
						<CardDescription>Große Communities</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">22,99€</span>
								<span class="text-4xl font-bold text-foreground">17,24€</span>
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
							<span class="text-sm">64 Slots</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">128-Tick</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Priority Support</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-border/50 relative overflow-hidden">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Custom</CardTitle>
						<CardDescription>Individuelle Lösung</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-2xl font-bold text-foreground">Auf Anfrage</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unbegrenzte Slots</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Dedicated Hardware</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">24/7 Phone Support</span>
						</div>
					</div>
					<Button class="w-full mt-6" variant="outline">Kontaktieren</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500/10 mx-auto">
				<Target class="h-10 w-10 text-orange-600" />
			</div>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Starte deinen CS:GO/CS2 Server
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Professioneller Counter-Strike Server in unter 5 Minuten. Keine Vertragslaufzeit.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
					Server erstellen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="/support">
					<Users class="h-5 w-5" />
					Support kontaktieren
				</Button>
			</div>
		</div>
	</div>
</section>

