<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Footprints, CheckCircle2, ArrowRight, Tag } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Palworld Server Hosting | TitanNode</title>
</svelte:head>

<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-background to-blue-500/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Footprints class="mr-2 h-4 w-4" />
				Palworld Server
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Palworld Server
				<span class="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
					Hosting
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Leistungsstarke Palworld-Server mit optimierter Performance für das beste Multiplayer-Erlebnis.
			</p>

			<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/gameserver/konfigurator">
				Server jetzt erstellen
				<ArrowRight class="h-5 w-5" />
			</Button>
		</div>
	</div>
</section>

<section id="packages" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Small</CardTitle>
					<CardDescription>8 Spieler</CardDescription>
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
				<CardContent>
					<div class="space-y-2 mb-4">
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">4 GB RAM</span></div>
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">50 GB SSD</span></div>
					</div>
					<Button class="w-full" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-primary/50 shadow-lg relative overflow-hidden">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg z-10">BELIEBT</div>
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Medium</CardTitle>
					<CardDescription>16 Spieler</CardDescription>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">16,99€</span>
								<span class="text-4xl font-bold text-foreground">12,74€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 mb-4">
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">8 GB RAM</span></div>
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">100 GB SSD</span></div>
					</div>
					<Button class="w-full" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>

			<Card class="border-border/50 relative overflow-hidden">
				<div class="absolute top-0 left-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-br-lg z-10">
					<Tag class="inline h-3 w-3 mr-1" />
					25% Sale
				</div>
				<CardHeader>
					<CardTitle>Large</CardTitle>
					<CardDescription>32 Spieler</CardDescription>
					<div class="mt-4">
						<div class="flex flex-col">
							<div class="flex items-baseline gap-2">
								<span class="text-lg text-muted-foreground line-through">29,99€</span>
								<span class="text-4xl font-bold text-foreground">22,49€</span>
								<span class="ml-2 text-muted-foreground">/Monat</span>
							</div>
							<span class="text-sm text-green-600 font-semibold mt-1">25% Rabatt</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 mb-4">
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">16 GB RAM</span></div>
						<div class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /><span class="text-sm">200 GB SSD</span></div>
					</div>
					<Button class="w-full" href="/gameserver/konfigurator">Jetzt bestellen</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

