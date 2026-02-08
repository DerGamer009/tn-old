<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Zap,
		Shield,
		Gauge,
		Code2,
		Database,
		Cloud,
		Lock,
		Rocket,
		Users,
		BarChart3,
		CheckCircle2,
		ArrowRight,
		Star
	} from '@lucide/svelte';
</script>

<svelte:head>
	<title>TitanNode - Premium Hosting für VPS, Gameserver & Apps</title>
	<meta name="description" content="Leistungsstarkes Hosting für VPS, Gameserver und Anwendungen. Schnell, sicher und zuverlässig." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),_transparent_55%)] dark:bg-[linear-gradient(135deg,_#1e293b_0%,_#0f172a_50%,_#1a2332_100%)]"></div>
	<div class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.25))] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(56,189,248,0.1),_transparent),_linear-gradient(to_bottom,transparent_0%,_rgba(15,23,42,0.5)_100%)]"></div>

	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-28 lg:py-32">
		<div class="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-5 lg:items-start">
			<!-- Left: Text -->
			<div class="lg:col-span-3 text-center lg:text-left">
				<Badge variant="secondary" class="mb-6 inline-flex items-center gap-2 px-4 py-2 shadow-sm border border-primary/20">
					<Star class="h-4 w-4 fill-primary text-primary" />
					Jetzt in der Beta-Phase
				</Badge>

				<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Premium Hosting für
					<span class="block bg-gradient-to-r from-primary via-sky-400 to-accent bg-clip-text text-transparent">
						VPS, Gameserver & Apps
					</span>
				</h1>

				<p class="mb-10 text-base text-muted-foreground sm:text-lg lg:text-xl max-w-xl lg:max-w-none">
					Leistungsstarke Infrastruktur in deutschen Rechenzentren – mit DDoS-Schutz, NVMe Storage
					und einem modernen Control Panel für alle deine Projekte.
				</p>

				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
					<Button size="lg" class="gap-2 px-8 py-6 text-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-shadow" href="/register">
						Server jetzt bestellen
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						class="gap-2 px-8 py-6 text-lg border-border/70 bg-background/80 hover:bg-background backdrop-blur-sm"
						href="#pricing"
					>
						<BarChart3 class="h-5 w-5" />
						Preise vergleichen
					</Button>
				</div>
			</div>

			<!-- Right: Status-Box -->
			<div class="w-full lg:col-span-2">
				<Card class="rounded-2xl border-border/60 bg-card/80 shadow-xl shadow-slate-950/20 dark:shadow-slate-950/40 backdrop-blur-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-950/25 dark:hover:shadow-slate-950/50">
					<CardContent class="p-6 sm:p-7">
						<div class="mb-5 flex items-center justify-between">
							<div>
								<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Plattform‑Status
								</p>
								<p class="mt-1.5 text-sm font-semibold text-foreground">
									Alle Systeme <span class="text-emerald-500 dark:text-emerald-400">online</span>
								</p>
							</div>
							<span class="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
								<span class="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
								99,9% Uptime
							</span>
						</div>

						<div class="grid grid-cols-2 gap-4 text-sm">
							<div class="rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
								<p class="text-xs text-muted-foreground">Durchschnittslatenz</p>
								<p class="mt-1 text-xl font-bold text-foreground">&lt; 50 ms</p>
								<p class="mt-1 text-[11px] text-muted-foreground">DE / AT / CH</p>
							</div>
							<div class="rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
								<p class="text-xs text-muted-foreground">Anwendungen online</p>
								<p class="mt-1 text-xl font-bold text-foreground">10k+</p>
								<p class="mt-1 text-[11px] text-muted-foreground">Gameserver & Apps</p>
							</div>
						</div>

						<div class="mt-5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-5">
							<span class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
								Technologie‑Stack
							</span>
							<div class="flex flex-wrap gap-2">
								<span class="rounded-full bg-muted/60 px-3 py-1.5 text-[11px] font-medium text-foreground/90">NVMe</span>
								<span class="rounded-full bg-muted/60 px-3 py-1.5 text-[11px] font-medium text-foreground/90">AMD & Intel</span>
								<span class="rounded-full bg-muted/60 px-3 py-1.5 text-[11px] font-medium text-foreground/90">DDoS‑Schutz</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="w-full py-24 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4 px-4 py-2 font-medium border border-primary/20">Unsere Services</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Hosting-Lösungen für jeden Bedarf
			</h2>
			<p class="text-lg text-muted-foreground">
				Von leistungsstarken VPS über optimierte Gameserver bis hin zu flexiblem App-Hosting – wir haben die perfekte Lösung für dein Projekt.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Cloud class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">VPS Hosting</CardTitle>
					<CardDescription class="text-base/relaxed">
						Leistungsstarke Virtual Private Server mit Root-Zugriff und voller Kontrolle über deine Umgebung
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Gauge class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">Gameserver</CardTitle>
					<CardDescription class="text-base/relaxed">
						Optimierte Server für Minecraft, CS:GO, ARK und viele weitere Games mit niedrigster Latenz
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Code2 class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">App Hosting</CardTitle>
					<CardDescription class="text-base/relaxed">
						Deploy deine Anwendungen mit Docker, Node.js, Python und mehr – einfach und schnell
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Zap class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">Höchste Performance</CardTitle>
					<CardDescription class="text-base/relaxed">
						NVMe SSDs, High-End CPUs und schnelle Netzwerkanbindung für optimale Geschwindigkeit
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Shield class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">DDoS-Schutz</CardTitle>
					<CardDescription class="text-base/relaxed">
						Professioneller DDoS-Schutz und Firewall inklusive – deine Server sind sicher
					</CardDescription>
				</CardHeader>
			</Card>

			<Card class="group rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<CardTitle class="text-xl">24/7 Support</CardTitle>
					<CardDescription class="text-base/relaxed">
						Unser deutschsprachiges Support-Team hilft dir jederzeit bei Fragen und Problemen
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<!-- Benefits Section -->
<section class="w-full border-y bg-muted/15 py-24 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm overflow-hidden">
			<CardContent class="p-8 sm:p-12 lg:p-14">
				<div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
					<!-- Left Column -->
					<div class="space-y-10">
						<div>
							<Badge variant="secondary" class="mb-4 px-4 py-2 font-medium border border-primary/20">Vorteile</Badge>
							<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Warum TitanNode?
							</h2>
							<p class="text-lg text-muted-foreground">
								Tausende Kunden vertrauen auf unsere zuverlässige Server-Infrastruktur.
							</p>
						</div>

						<div class="space-y-6">
							<div class="flex gap-4 rounded-xl border border-border/40 bg-background/60 p-4 transition-colors hover:bg-background/80">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10">
									<CheckCircle2 class="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-foreground">Sofortige Aktivierung</h3>
									<p class="text-sm text-muted-foreground">
										Dein Server ist innerhalb weniger Minuten nach Bestellung einsatzbereit.
									</p>
								</div>
							</div>
							<div class="flex gap-4 rounded-xl border border-border/40 bg-background/60 p-4 transition-colors hover:bg-background/80">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10">
									<CheckCircle2 class="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-foreground">Premium Hardware</h3>
									<p class="text-sm text-muted-foreground">
										Modernste Prozessoren, NVMe SSDs und schnelle Netzwerkanbindung.
									</p>
								</div>
							</div>
							<div class="flex gap-4 rounded-xl border border-border/40 bg-background/60 p-4 transition-colors hover:bg-background/80">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10">
									<CheckCircle2 class="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-foreground">Deutsches Rechenzentrum</h3>
									<p class="text-sm text-muted-foreground">
										Server in Deutschland mit DSGVO-konformer Datenhaltung und niedrigen Latenzen.
									</p>
								</div>
							</div>
							<div class="flex gap-4 rounded-xl border border-border/40 bg-background/60 p-4 transition-colors hover:bg-background/80">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10">
									<CheckCircle2 class="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-foreground">Transparente Preise</h3>
									<p class="text-sm text-muted-foreground">
										Faire Preise ohne versteckte Kosten. Monatlich kündbar.
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Column - Inkludierte Features -->
					<div>
						<Card class="rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur-sm overflow-hidden h-full">
							<CardHeader class="pb-4">
								<CardTitle class="flex items-center gap-2 text-xl">
									<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<Rocket class="h-5 w-5 text-primary" />
									</div>
									Inkludierte Features
								</CardTitle>
								<CardDescription>Bei jedem Server inklusive</CardDescription>
							</CardHeader>
							<CardContent class="space-y-5">
								<div class="flex items-start gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
									<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<p class="font-semibold text-foreground">DDoS-Schutz</p>
										<p class="text-sm text-muted-foreground">Automatischer Schutz gegen Angriffe</p>
									</div>
								</div>
								<div class="flex items-start gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
									<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<p class="font-semibold text-foreground">Automatische Backups</p>
										<p class="text-sm text-muted-foreground">Tägliche Sicherungen deiner Daten</p>
									</div>
								</div>
								<div class="flex items-start gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
									<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<p class="font-semibold text-foreground">Modernes Control Panel</p>
										<p class="text-sm text-muted-foreground">Einfache Verwaltung über Web-Interface</p>
									</div>
								</div>
								<div class="flex items-start gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50">
									<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
									<div>
										<p class="font-semibold text-foreground">99.9% Uptime-Garantie</p>
										<p class="text-sm text-muted-foreground">Zuverlässige Verfügbarkeit</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</CardContent>
		</div>
	</div>
</section>

<!-- Pricing Section -->
<section id="pricing" class="w-full bg-gradient-to-b from-background via-background to-muted/30 py-24 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4 px-4 py-2 font-medium border border-primary/20">Preise</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Transparente Preise für jeden Bedarf
			</h2>
			<p class="text-lg text-muted-foreground">
				Wähle das passende Paket für dein Projekt. Alle Preise verstehen sich monatlich und sind jederzeit kündbar.
			</p>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<!-- VPS Basic -->
			<Card class="group rounded-2xl border-border/60 bg-card/80 relative overflow-hidden shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-2 flex items-center gap-2">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
							<Cloud class="h-5 w-5 text-primary" />
						</div>
						<CardTitle class="text-xl">VPS Basic</CardTitle>
					</div>
					<CardDescription>Perfekt für kleine Projekte</CardDescription>
					<div class="mt-5">
						<div class="flex items-baseline gap-1">
							<span class="text-4xl font-bold tracking-tight text-foreground">4,99€</span>
							<span class="text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-5">
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">2 vCPU Cores</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">4 GB RAM</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">50 GB NVMe SSD</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">1 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">DDoS-Schutz inklusive</span>
						</div>
					</div>
					<Button class="w-full mt-6 h-11 font-medium" href="/register">
						Jetzt bestellen
					</Button>
				</CardContent>
			</Card>

			<!-- Gameserver (Beliebt) -->
			<Card class="group rounded-2xl border-2 border-primary/50 bg-card/90 relative overflow-hidden shadow-lg shadow-primary/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/15">
				<div class="absolute top-0 right-0 rounded-bl-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
					BELIEBT
				</div>
				<CardHeader class="pb-4 pt-6">
					<div class="mb-2 flex items-center gap-2">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-2 ring-primary/20">
							<Gauge class="h-5 w-5 text-primary" />
						</div>
						<CardTitle class="text-xl">Gameserver</CardTitle>
					</div>
					<CardDescription>Optimiert für Gaming</CardDescription>
					<div class="mt-5">
						<div class="flex items-baseline gap-1">
							<span class="text-4xl font-bold tracking-tight text-foreground">9,99€</span>
							<span class="text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-5">
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">4 vCPU Cores (High-Freq)</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">8 GB RAM</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">100 GB NVMe SSD</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">1 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">Game-Panel inklusive</span>
						</div>
					</div>
					<Button class="w-full mt-6 h-11 font-medium shadow-md shadow-primary/20" href="/register">
						Jetzt bestellen
					</Button>
				</CardContent>
			</Card>

			<!-- App Hosting Pro -->
			<Card class="group rounded-2xl border-border/60 bg-card/80 relative overflow-hidden shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
				<CardHeader class="pb-4">
					<div class="mb-2 flex items-center gap-2">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
							<Code2 class="h-5 w-5 text-primary" />
						</div>
						<CardTitle class="text-xl">App Hosting Pro</CardTitle>
					</div>
					<CardDescription>Für anspruchsvolle Apps</CardDescription>
					<div class="mt-5">
						<div class="flex items-baseline gap-1">
							<span class="text-4xl font-bold tracking-tight text-foreground">14,99€</span>
							<span class="text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-5">
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">6 vCPU Cores</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">16 GB RAM</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">200 GB NVMe SSD</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">2 Gbit/s Anbindung</span>
						</div>
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-4 w-4 text-primary shrink-0" />
							<span class="text-sm">Docker & CI/CD</span>
						</div>
					</div>
					<Button class="w-full mt-6 h-11 font-medium" href="/register">
						Jetzt bestellen
					</Button>
				</CardContent>
			</Card>
		</div>

		<div class="mt-14 text-center">
			<p class="text-muted-foreground">
				Benötigst du eine individuelle Lösung?
				<a href="/support" class="font-medium text-primary hover:underline">Kontaktiere uns</a> für ein maßgeschneidertes Angebot.
			</p>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="relative w-full overflow-hidden py-24 sm:py-32">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,var(--primary)/0.12,transparent)]"></div>
	<div class="container relative mx-auto max-w-screen-2xl px-4">
		<Card class="rounded-2xl border-border/60 bg-card/70 shadow-xl shadow-slate-950/20 dark:shadow-slate-950/40 backdrop-blur-sm overflow-hidden">
			<CardContent class="flex flex-col items-center justify-center space-y-8 p-10 sm:p-14 text-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-2 ring-primary/20">
					<Rocket class="h-8 w-8 text-primary" />
				</div>
				<h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Bereit für deinen Server?
				</h2>
				<p class="max-w-2xl text-lg text-muted-foreground leading-relaxed">
					Starte noch heute mit deinem eigenen VPS, Gameserver oder App-Hosting.
					Faire Preise, keine Mindestvertragslaufzeit.
				</p>
				<div class="flex flex-col gap-4 sm:flex-row">
					<Button size="lg" class="gap-2 px-8 py-6 text-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-shadow" href="/register">
						Jetzt Server bestellen
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg border-border/70 bg-background/80 hover:bg-background backdrop-blur-sm" href="/support">
						<Users class="h-5 w-5" />
						Support kontaktieren
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</section>
