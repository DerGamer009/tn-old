<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import {
		Pickaxe,
		Target,
		Bone,
		Hammer,
		Swords,
		Car,
		Footprints,
		Factory,
		Search,
		Users,
		Gamepad2,
		Tag
	} from '@lucide/svelte';

	// Alle verfügbaren Spiele
	const allGames = [
		{
			name: 'Minecraft',
			icon: Pickaxe,
			iconColor: 'text-green-500',
			players: '2-200',
			description: 'Java & Bedrock Edition mit Mod-Support',
			category: 'Survival',
			popular: true,
			href: '/gameserver/minecraft',
			priceFrom: '3,74€',
			priceFromOriginal: '4,99€'
		},
		{
			name: 'CS:GO / CS2',
			icon: Target,
			iconColor: 'text-orange-500',
			players: '2-64',
			description: '128-Tick Counter-Strike Server',
			category: 'FPS',
			popular: true,
			href: '/gameserver/csgo',
			priceFrom: '4,49€',
			priceFromOriginal: '5,99€'
		},
		{
			name: 'ARK: Survival',
			icon: Bone,
			iconColor: 'text-emerald-500',
			players: '2-100',
			description: 'Evolved & Ascended mit allen Maps',
			category: 'Survival',
			popular: true,
			href: '/gameserver/ark',
			priceFrom: '11,24€',
			priceFromOriginal: '14,99€'
		},
		{
			name: 'Rust',
			icon: Hammer,
			iconColor: 'text-amber-600',
			players: '2-200',
			description: 'Survival Server mit Oxide-Support',
			category: 'Survival',
			popular: false,
			href: '/gameserver/rust',
			priceFrom: '14,99€',
			priceFromOriginal: '19,99€'
		},
		{
			name: 'Valheim',
			icon: Swords,
			iconColor: 'text-blue-500',
			players: '2-10',
			description: 'Viking Survival Multiplayer',
			category: 'Survival',
			popular: false,
			href: '/gameserver/valheim',
			priceFrom: '3,74€',
			priceFromOriginal: '4,99€'
		},
		{
			name: 'FiveM / GTA V',
			icon: Car,
			iconColor: 'text-purple-500',
			players: '2-128',
			description: 'GTA V Roleplay Server',
			category: 'Roleplay',
			popular: true,
			href: '/gameserver/fivem',
			priceFrom: '18,74€',
			priceFromOriginal: '24,99€'
		},
		{
			name: 'Palworld',
			icon: Footprints,
			iconColor: 'text-cyan-500',
			players: '2-32',
			description: 'Multiplayer Survival',
			category: 'Survival',
			popular: false,
			href: '/gameserver/palworld',
			priceFrom: '7,49€',
			priceFromOriginal: '9,99€'
		},
		{
			name: 'Satisfactory',
			icon: Factory,
			iconColor: 'text-yellow-600',
			players: '2-4',
			description: 'Factory Building Coop',
			category: 'Building',
			popular: false,
			href: '/gameserver/satisfactory',
			priceFrom: '5,24€',
			priceFromOriginal: '6,99€'
		}
	];

	// State für Filter und Suche
	let searchQuery = $state('');
	let selectedCategory = $state<string>('all');

	// Kategorien extrahieren
	const categories = ['all', ...new Set(allGames.map(game => game.category))];

	// Gefilterte Spiele
	let filteredGames = $derived.by(() => {
		let games = allGames;

		// Nach Kategorie filtern
		if (selectedCategory !== 'all') {
			games = games.filter(game => game.category === selectedCategory);
		}

		// Nach Suchbegriff filtern
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			games = games.filter(game => 
				game.name.toLowerCase().includes(query) ||
				game.description.toLowerCase().includes(query)
			);
		}

		return games;
	});
</script>

<svelte:head>
	<title>Alle Gameserver - 100+ Spiele verfügbar | TitanNode</title>
	<meta name="description" content="Übersicht aller verfügbaren Gameserver: Minecraft, CS:GO, ARK, Rust und viele mehr." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="default" class="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
				<Tag class="mr-2 h-4 w-4" />
				Sale: 25% billiger auf alle Gameserver!
			</Badge>
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Gamepad2 class="mr-2 h-4 w-4" />
				Alle Gameserver
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Über 100 Spiele
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					verfügbar
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Finde den perfekten Gameserver für dein Lieblingsspiel. 
				Mit DDoS-Schutz, automatischen Backups und 24/7 Support.
			</p>

			<!-- Suchfeld -->
			<div class="max-w-xl mx-auto relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Suche nach Spielen..."
					class="pl-10 py-6 text-lg"
					bind:value={searchQuery}
				/>
			</div>
		</div>
	</div>
</section>

<!-- Filter & Games Section -->
<section class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Filter Badges -->
		<div class="flex flex-wrap gap-3 justify-center mb-12">
			{#each categories as category}
				<button
					onclick={() => (selectedCategory = category)}
					class="transition-all"
				>
					<Badge
						variant={selectedCategory === category ? 'default' : 'outline'}
						class="px-4 py-2 cursor-pointer hover:bg-primary/10"
					>
						{category === 'all' ? 'Alle Spiele' : category}
						{#if category === 'all'}
							<span class="ml-2 opacity-70">({allGames.length})</span>
						{:else}
							<span class="ml-2 opacity-70">
								({allGames.filter(g => g.category === category).length})
							</span>
						{/if}
					</Badge>
				</button>
			{/each}
		</div>

		<!-- Games Grid -->
		{#if filteredGames.length > 0}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filteredGames as game}
					<a href={game.href} class="block group">
						<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg relative overflow-hidden h-full">
							{#if game.popular}
								<div class="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
									BELIEBT
								</div>
							{/if}
							
							<CardHeader>
								<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-muted group-hover:scale-110 transition-transform">
									<game.icon class={`h-8 w-8 ${game.iconColor}`} />
								</div>
								
								<CardTitle class="group-hover:text-primary transition-colors">
									{game.name}
								</CardTitle>
								
								<CardDescription>
									<div class="space-y-2 mt-2">
										<div class="flex items-center gap-2 text-sm">
											<Users class="h-3 w-3" />
											{game.players} Spieler
										</div>
										<div class="text-xs">
											{game.description}
										</div>
										<div class="pt-2 border-t">
											<div class="flex items-center gap-2">
												{#if game.priceFromOriginal}
													<span class="text-xs text-muted-foreground line-through">
														{game.priceFromOriginal}
													</span>
												{/if}
												<span class="text-xs font-semibold text-primary">
													Ab {game.priceFrom}/Monat
												</span>
											</div>
											{#if game.priceFromOriginal}
												<span class="text-[10px] text-green-600 font-semibold mt-0.5 block">
													25% Rabatt
												</span>
											{/if}
										</div>
									</div>
								</CardDescription>
							</CardHeader>
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<!-- Keine Ergebnisse -->
			<div class="text-center py-16">
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
					<Search class="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 class="text-xl font-semibold mb-2">Keine Spiele gefunden</h3>
				<p class="text-muted-foreground mb-6">
					Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie.
				</p>
				<Button variant="outline" onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}>
					Filter zurücksetzen
				</Button>
			</div>
		{/if}
	</div>
</section>

<!-- More Games Section -->
<section class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto max-w-3xl text-center">
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
				Und viele weitere Spiele
			</h2>
			<p class="text-lg text-muted-foreground mb-8">
				Vermisst du ein Spiel? Wir unterstützen über 100 verschiedene Spiele. 
				Hier sind weitere beliebte Titel:
			</p>
			
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto text-left">
				{#each [
					'7 Days to Die', 'Team Fortress 2', 'Left 4 Dead 2',
					'Conan Exiles', 'Project Zomboid', 'Terraria',
					'DayZ', 'Insurgency', 'Squad',
					'V Rising', 'Eco', 'Pavlov VR',
					'Unturned', 'Factorio', 'Space Engineers'
				] as gameName}
					<Card class="border-border/50 p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
								<Gamepad2 class="h-5 w-5 text-primary" />
							</div>
							<div class="font-medium">{gameName}</div>
						</div>
					</Card>
				{/each}
			</div>

			<div class="mt-12">
				<p class="text-muted-foreground mb-4">
					Dein Spiel ist nicht dabei?
				</p>
				<Button size="lg" href="/support">
					Kontaktiere uns
				</Button>
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
				Bereit für deinen Gameserver?
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Wähle dein Lieblingsspiel und starte noch heute. 
				Keine Einrichtungsgebühr, keine Vertragslaufzeit.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
					Spiel auswählen
					<Gamepad2 class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="/support">
					Fragen? Support kontaktieren
				</Button>
			</div>
		</div>
	</div>
</section>

