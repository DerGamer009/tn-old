<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Über uns | TitanNode</title>
	<meta name="description" content="Erfahren Sie mehr über TitanNode - Ihre vertrauenswürdige Plattform für VPS, Gameserver und App Hosting." />
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
					<Icon icon="tabler:info-circle" class="mr-1 h-3 w-3" />
					Über TitanNode
				</Badge>
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Hosting der
					<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						Zukunft
					</span>
				</h1>
				<p class="text-lg text-muted-foreground md:text-xl">
					Wir bieten leistungsstarke, zuverlässige und skalierbare Hosting-Lösungen für 
					Unternehmen, Entwickler und Gaming-Communities weltweit.
				</p>
			</div>
		</div>

		<!-- Decorative Elements -->
		<div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
	</section>

	<!-- Stats Section -->
	<section class="border-y bg-muted/30 py-12">
		<div class="container mx-auto px-4">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">99.9%</div>
					<p class="text-sm text-muted-foreground">Uptime Garantie</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">10k+</div>
					<p class="text-sm text-muted-foreground">Aktive Server</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">24/7</div>
					<p class="text-sm text-muted-foreground">Support</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">2025</div>
					<p class="text-sm text-muted-foreground">Gegründet</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Vision & Mission -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="grid gap-12 lg:grid-cols-2">
				<Card class="border-border/50">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:eye" class="h-6 w-6 text-primary" />
						</div>
						<CardTitle class="text-2xl">Unsere Vision</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-muted-foreground">
							Wir möchten die führende Hosting-Plattform werden, die es jedem ermöglicht, 
							seine digitalen Projekte ohne technische Barrieren zu verwirklichen.
						</p>
						<p class="text-muted-foreground">
							Durch innovative Technologien und erstklassigen Service schaffen wir eine 
							Umgebung, in der Ideen wachsen und Erfolge gefeiert werden können.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:target" class="h-6 w-6 text-primary" />
						</div>
						<CardTitle class="text-2xl">Unsere Mission</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-muted-foreground">
							Hochwertige Hosting-Lösungen bereitzustellen, die durch Leistung, 
							Zuverlässigkeit und herausragenden Kundenservice überzeugen.
						</p>
						<p class="text-muted-foreground">
							Wir setzen auf modernste Infrastruktur, transparente Preisgestaltung und 
							einen Support, der immer für unsere Kunden da ist.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Values -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Unsere Werte</h2>
				<p class="text-muted-foreground">
					Die Prinzipien, die uns jeden Tag leiten
				</p>
			</div>

			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
							<Icon icon="tabler:shield-check" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<CardTitle>Zuverlässigkeit</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							99.9% Uptime-Garantie und redundante Infrastruktur für maximale Verfügbarkeit 
							Ihrer Dienste.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
							<Icon icon="tabler:rocket" class="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<CardTitle>Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Modernste Hardware und optimierte Netzwerkinfrastruktur für 
							blitzschnelle Ladezeiten.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
							<Icon icon="tabler:headset" class="h-6 w-6 text-orange-600 dark:text-orange-400" />
						</div>
						<CardTitle>Support</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							24/7 erreichbares Support-Team mit echten Menschen, die Ihnen kompetent 
							weiterhelfen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
							<Icon icon="tabler:lock" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
						<CardTitle>Sicherheit</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							DDoS-Schutz, automatische Backups und modernste Sicherheitsstandards zum 
							Schutz Ihrer Daten.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/10">
							<Icon icon="tabler:heart" class="h-6 w-6 text-pink-600 dark:text-pink-400" />
						</div>
						<CardTitle>Transparenz</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Keine versteckten Kosten, klare Kommunikation und ehrliche Preisgestaltung 
							ohne Überraschungen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50 hover:border-primary/50 transition-all">
					<CardHeader>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10">
							<Icon icon="tabler:bulb" class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
						</div>
						<CardTitle>Innovation</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Wir nutzen neueste Technologien und entwickeln ständig neue Features für 
							unsere Kunden.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Why TitanNode -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Warum TitanNode?</h2>
				<p class="text-muted-foreground">
					Das macht uns zur ersten Wahl für Ihr Hosting
				</p>
			</div>

			<div class="grid gap-8 lg:grid-cols-2">
				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:bolt" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Blitzschnelle Bereitstellung</h3>
							<p class="text-sm text-muted-foreground">
								Ihre Server sind in wenigen Minuten einsatzbereit. Keine langen Wartezeiten.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:chart-line" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Skalierbar nach Bedarf</h3>
							<p class="text-sm text-muted-foreground">
								Passen Sie Ihre Ressourcen jederzeit an Ihre Anforderungen an - up oder down.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:coin" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Faire Preise</h3>
							<p class="text-sm text-muted-foreground">
								Transparente Preisgestaltung ohne versteckte Kosten. Sie zahlen nur für das, was Sie nutzen.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:world" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Globale Präsenz</h3>
							<p class="text-sm text-muted-foreground">
								Rechenzentren in mehreren Ländern für optimale Latenz weltweit.
							</p>
						</div>
					</div>
				</div>

				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:device-desktop" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Intuitive Verwaltung</h3>
							<p class="text-sm text-muted-foreground">
								Modernes Dashboard mit allen wichtigen Funktionen - einfach zu bedienen.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:clock-24" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">24/7 Monitoring</h3>
							<p class="text-sm text-muted-foreground">
								Wir überwachen Ihre Server rund um die Uhr und reagieren proaktiv auf Probleme.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:database" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Automatische Backups</h3>
							<p class="text-sm text-muted-foreground">
								Tägliche Backups Ihrer Daten - für maximale Sicherheit und Wiederherstellbarkeit.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Icon icon="tabler:users-group" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Community</h3>
							<p class="text-sm text-muted-foreground">
								Teil einer wachsenden Community von Entwicklern, Gamern und Unternehmern.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Timeline -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Unsere Geschichte</h2>
				<p class="text-muted-foreground">
					Von der Idee zur führenden Hosting-Plattform
				</p>
			</div>

			<div class="mx-auto max-w-3xl space-y-8">
				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							2025
						</div>
						<div class="w-0.5 flex-1 bg-border mt-4"></div>
					</div>
					<div class="pb-8">
						<h3 class="mb-2 font-semibold text-lg">Die Gründung</h3>
						<p class="text-sm text-muted-foreground">
							TitanNode wurde mit der Vision gegründet, Hosting einfach und zugänglich zu machen.
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							2025
						</div>
						<div class="w-0.5 flex-1 bg-border mt-4"></div>
					</div>
					<div class="pb-8">
						<h3 class="mb-2 font-semibold text-lg">Erste Kunden</h3>
						<p class="text-sm text-muted-foreground">
							Durch herausragenden Service und Leistung gewinnen wir das Vertrauen unserer ersten Kunden.
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							2026
						</div>
						<div class="w-0.5 flex-1 bg-border mt-4"></div>
					</div>
					<div class="pb-8">
						<h3 class="mb-2 font-semibold text-lg">Wachstum & Expansion</h3>
						<p class="text-sm text-muted-foreground">
							Ausbau der Infrastruktur und Erweiterung unseres Service-Portfolios für noch mehr Kundenzufriedenheit.
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							Heute
						</div>
					</div>
					<div>
						<h3 class="mb-2 font-semibold text-lg">Die Zukunft gestalten</h3>
						<p class="text-sm text-muted-foreground">
							Wir wachsen kontinuierlich und arbeiten täglich daran, die beste Hosting-Erfahrung für unsere Kunden zu schaffen.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-4 text-3xl font-bold">Bereit zu starten?</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					Schließen Sie sich tausenden zufriedenen Kunden an und erleben Sie Hosting, wie es sein sollte.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="/register">
						<Button size="lg" class="gap-2">
							<Icon icon="tabler:rocket" class="h-5 w-5" />
							Jetzt starten
						</Button>
					</a>
					<a href="/our-team">
						<Button size="lg" variant="outline" class="gap-2">
							<Icon icon="tabler:users-group" class="h-5 w-5" />
							Unser Team
						</Button>
					</a>
					<a href="/support">
						<Button size="lg" variant="outline" class="gap-2">
							<Icon icon="tabler:message-circle" class="h-5 w-5" />
							Kontakt
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>

