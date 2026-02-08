<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { articles, categories } from '$lib/docs';

	let searchQuery = $state('');
	let activeCategory = $state('all');

	let filteredArticles = $derived(
		articles.filter((article) => {
			const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
			const matchesSearch =
				article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				article.description.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);

	const popularArticles = [
		{ slug: 'vps-einrichten-und-starten', views: '12.5k' },
		{ slug: 'minecraft-server-installieren', views: '10.2k' },
		{ slug: 'ssh-zugriff-konfigurieren', views: '8.7k' },
		{ slug: 'nodejs-app-deployen', views: '7.3k' },
		{ slug: '2-faktor-authentifizierung', views: '6.1k' }
	].map((p) => {
		const article = articles.find((a) => a.slug === p.slug);
		return { title: article?.title ?? p.slug, views: p.views, href: `/docs/${p.slug}` };
	});
</script>

<svelte:head>
	<title>Dokumentation & Wissensdatenbank | TitanNode</title>
	<meta name="description" content="Umfassende Anleitungen, Tutorials und Guides für VPS, Gameserver und App Hosting." />
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
					<Icon icon="tabler:book" class="mr-1 h-3 w-3" />
					Dokumentation
				</Badge>
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Wissensdatenbank &
					<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						Tutorials
					</span>
				</h1>
				<p class="text-lg text-muted-foreground md:text-xl mb-8">
					Alles was Sie wissen müssen, um Ihre Server optimal zu nutzen. Von der 
					Einrichtung bis zur Optimierung.
				</p>

				<!-- Search Bar -->
				<div class="mx-auto max-w-2xl">
					<div class="relative">
						<Icon
							icon="tabler:search"
							class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							placeholder="Suche nach Tutorials, Guides und Anleitungen..."
							bind:value={searchQuery}
							class="h-14 pl-12 text-base"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Decorative Elements -->
		<div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
	</section>

	<!-- Categories -->
	<section class="border-y bg-muted/30 py-8">
		<div class="container mx-auto px-4">
			<div class="flex flex-wrap justify-center gap-4">
				{#each categories as category}
					<button
						onclick={() => activeCategory = category.id}
						class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
							{activeCategory === category.id
								? 'bg-primary text-primary-foreground shadow-md'
								: 'bg-background hover:bg-muted border border-border'}"
					>
						<Icon icon={category.icon} class="h-4 w-4" />
						{category.name}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Main Content -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="grid gap-8 lg:grid-cols-4">
				<!-- Articles -->
				<div class="lg:col-span-3">
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold">
							{filteredArticles.length} Artikel gefunden
						</h2>
					</div>

					{#if filteredArticles.length > 0}
						<div class="grid gap-6 sm:grid-cols-2">
							{#each filteredArticles as article}
								<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
									<CardHeader>
										<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
											<Icon icon={article.icon} class="h-6 w-6 text-primary" />
										</div>
										<CardTitle class="text-xl">{article.title}</CardTitle>
									</CardHeader>
									<CardContent class="space-y-4">
										<p class="text-sm text-muted-foreground">
											{article.description}
										</p>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2 text-xs text-muted-foreground">
												<Icon icon="tabler:clock" class="h-4 w-4" />
												<span>{article.readTime} Lesezeit</span>
											</div>
											<Button variant="ghost" size="sm" class="gap-2" href="/docs/{article.slug}">
												Lesen
												<Icon icon="tabler:arrow-right" class="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>
					{:else}
						<Card class="border-border/50">
							<CardContent class="flex flex-col items-center justify-center py-12">
								<Icon icon="tabler:search-off" class="h-16 w-16 text-muted-foreground mb-4" />
								<h3 class="text-lg font-semibold mb-2">Keine Artikel gefunden</h3>
								<p class="text-sm text-muted-foreground mb-4">
									Versuchen Sie andere Suchbegriffe oder ändern Sie die Kategorie
								</p>
								<Button onclick={() => { searchQuery = ''; activeCategory = 'all'; }}>
									Filter zurücksetzen
								</Button>
							</CardContent>
						</Card>
					{/if}
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Popular Articles -->
					<Card class="border-border/50">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Icon icon="tabler:trending-up" class="h-5 w-5 text-primary" />
								Beliebt
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each popularArticles as article}
								<a href={article.href} class="block group">
									<div class="flex items-start gap-2 text-sm">
										<Icon icon="tabler:file-text" class="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
										<div class="flex-1">
											<p class="font-medium group-hover:text-primary transition-colors">
												{article.title}
											</p>
											<p class="text-xs text-muted-foreground">{article.views} Aufrufe</p>
										</div>
									</div>
								</a>
							{/each}
						</CardContent>
					</Card>

					<!-- Quick Links -->
					<Card class="border-border/50">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Icon icon="tabler:link" class="h-5 w-5 text-primary" />
								Schnellzugriff
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<a href="/support" class="flex items-center gap-2 text-sm hover:text-primary transition-colors">
								<Icon icon="tabler:help-circle" class="h-4 w-4" />
								Support kontaktieren
							</a>
							<a href="/dashboard" class="flex items-center gap-2 text-sm hover:text-primary transition-colors">
								<Icon icon="tabler:dashboard" class="h-4 w-4" />
								Zum Dashboard
							</a>
							<a href="/support#status" class="flex items-center gap-2 text-sm hover:text-primary transition-colors">
								<Icon icon="tabler:activity" class="h-4 w-4" />
								System Status
							</a>
						</CardContent>
					</Card>

					<!-- Help Card -->
					<Card class="border-border/50 bg-primary/5">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Icon icon="tabler:help" class="h-5 w-5 text-primary" />
								Nicht gefunden?
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<p class="text-sm text-muted-foreground">
								Können Sie nicht finden, wonach Sie suchen? Unser Support-Team hilft gerne weiter.
							</p>
							<a href="/support">
								<Button class="w-full gap-2">
									<Icon icon="tabler:message-circle" class="h-4 w-4" />
									Support kontaktieren
								</Button>
							</a>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</section>

	<!-- Video Tutorials -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Video-Tutorials</h2>
				<p class="text-muted-foreground">
					Schritt-für-Schritt Anleitungen in Videoform
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				<Card class="border-border/50 hover:border-primary/50 transition-all cursor-pointer">
					<CardContent class="p-0">
						<div class="aspect-video bg-muted flex items-center justify-center">
							<Icon icon="tabler:player-play" class="h-16 w-16 text-muted-foreground" />
						</div>
						<div class="p-6">
							<Badge variant="outline" class="mb-2">VPS</Badge>
							<h3 class="font-semibold mb-2">VPS Schnellstart-Guide</h3>
							<p class="text-sm text-muted-foreground">Lernen Sie die Grundlagen in unter 10 Minuten</p>
						</div>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all cursor-pointer">
					<CardContent class="p-0">
						<div class="aspect-video bg-muted flex items-center justify-center">
							<Icon icon="tabler:player-play" class="h-16 w-16 text-muted-foreground" />
						</div>
						<div class="p-6">
							<Badge variant="outline" class="mb-2">Gameserver</Badge>
							<h3 class="font-semibold mb-2">Minecraft Server Setup</h3>
							<p class="text-sm text-muted-foreground">Von 0 auf 100 in wenigen Schritten</p>
						</div>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all cursor-pointer">
					<CardContent class="p-0">
						<div class="aspect-video bg-muted flex items-center justify-center">
							<Icon icon="tabler:player-play" class="h-16 w-16 text-muted-foreground" />
						</div>
						<div class="p-6">
							<Badge variant="outline" class="mb-2">Apps</Badge>
							<h3 class="font-semibold mb-2">Docker Container deployen</h3>
							<p class="text-sm text-muted-foreground">Containerisierte Apps bereitstellen</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>
</div>

