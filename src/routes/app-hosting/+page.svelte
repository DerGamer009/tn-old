<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Code2,
		Shield,
		Zap,
		CheckCircle2,
		ArrowRight,
		Rocket,
		Server,
		Cloud,
		Database,
		GitBranch,
		Container,
		Globe,
		Lock,
		Gauge,
		Users,
		Settings,
		RefreshCw,
		Terminal,
		Layers
	} from '@lucide/svelte';

	// Unterstützte Technologien
	const technologies = [
		{
			name: 'Node.js',
			icon: Server,
			iconColor: 'text-green-600',
			description: 'Express, NestJS, Next.js',
			popular: true
		},
		{
			name: 'Python',
			icon: Code2,
			iconColor: 'text-blue-500',
			description: 'Django, Flask, FastAPI',
			popular: true
		},
		{
			name: 'Docker',
			icon: Container,
			iconColor: 'text-blue-400',
			description: 'Container-basiertes Deployment',
			popular: true
		},
		{
			name: 'PHP',
			icon: Code2,
			iconColor: 'text-purple-500',
			description: 'Laravel, Symfony, WordPress',
			popular: false
		},
		{
			name: 'Go',
			icon: Zap,
			iconColor: 'text-cyan-500',
			description: 'High-Performance Apps',
			popular: false
		},
		{
			name: 'Ruby',
			icon: Code2,
			iconColor: 'text-red-500',
			description: 'Rails, Sinatra',
			popular: false
		},
		{
			name: 'Java',
			icon: Code2,
			iconColor: 'text-orange-600',
			description: 'Spring Boot, Quarkus',
			popular: false
		},
		{
			name: 'Static Sites',
			icon: Globe,
			iconColor: 'text-pink-500',
			description: 'React, Vue, Angular, Svelte',
			popular: true
		}
	];
</script>

<svelte:head>
	<title>App Hosting - Deploy deine Apps schnell & einfach | TitanNode</title>
	<meta name="description" content="Professionelles App-Hosting mit Docker, CI/CD und automatischer Skalierung. Node.js, Python, PHP und mehr." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Badge -->
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Rocket class="mr-2 h-4 w-4" />
				App Hosting
			</Badge>

			<!-- Headline -->
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Deploy deine Apps
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					in Sekunden
				</span>
			</h1>

			<!-- Subheadline -->
			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				Professionelles Hosting für moderne Webanwendungen. Mit Docker, CI/CD, automatischer Skalierung 
				und Support für alle gängigen Frameworks und Sprachen.
			</p>

			<!-- CTA Buttons -->
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/apps/konfigurator">
					Jetzt deployen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#technologies">
					<Code2 class="h-5 w-5" />
					Technologien ansehen
				</Button>
			</div>

			<!-- Quick Stats -->
			<div class="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">&lt;60s</div>
					<div class="text-sm text-muted-foreground">Deploy-Zeit</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">Auto</div>
					<div class="text-sm text-muted-foreground">Skalierung</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">99.9%</div>
					<div class="text-sm text-muted-foreground">Uptime</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">SSL</div>
					<div class="text-sm text-muted-foreground">Gratis</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Technologies Section -->
<section id="technologies" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Technologien</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Alle gängigen Technologien
			</h2>
			<p class="text-lg text-muted-foreground">
				Deploye deine Apps mit deinem bevorzugten Framework und deiner Lieblings-Programmiersprache.
			</p>
		</div>

		<!-- Technologies Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each technologies as tech}
				<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg relative overflow-hidden">
					{#if tech.popular}
						<div class="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
							BELIEBT
						</div>
					{/if}
					<CardHeader>
						<div class="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
							<svelte:component this={tech.icon} class="h-8 w-8 {tech.iconColor}" />
						</div>
						<CardTitle>{tech.name}</CardTitle>
						<CardDescription>{tech.description}</CardDescription>
					</CardHeader>
				</Card>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<p class="text-muted-foreground mb-4">
				Und viele weitere: Rust, .NET, Elixir, Kotlin, Scala und mehr...
			</p>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Features</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Alles für moderne Apps
			</h2>
			<p class="text-lg text-muted-foreground">
				Von der Entwicklung bis zur Produktion - wir bieten alle Tools, die du brauchst.
			</p>
		</div>

		<!-- Feature Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<GitBranch class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Git-Integration</CardTitle>
					<CardDescription>
						Automatisches Deployment bei jedem Push zu GitHub, GitLab oder Bitbucket
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 2 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Container class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Docker Support</CardTitle>
					<CardDescription>
						Volle Docker-Unterstützung für containerisierte Anwendungen
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 3 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Gauge class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Auto-Scaling</CardTitle>
					<CardDescription>
						Automatische Skalierung basierend auf CPU- und Memory-Nutzung
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 4 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Lock class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>SSL-Zertifikate</CardTitle>
					<CardDescription>
						Kostenlose Let's Encrypt SSL-Zertifikate mit automatischer Erneuerung
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 5 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Database class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Managed Databases</CardTitle>
					<CardDescription>
						PostgreSQL, MySQL, MongoDB und Redis - vollständig verwaltet
					</CardDescription>
				</CardHeader>
			</Card>

			<!-- Feature 6 -->
			<Card class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Terminal class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>CLI & API</CardTitle>
					<CardDescription>
						Leistungsstarke CLI und REST API für komplette Automatisierung
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<!-- Packages Section -->
<section id="packages" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<!-- Section Header -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">App-Hosting Pakete</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Flexibles Hosting für jede App
			</h2>
			<p class="text-lg text-muted-foreground">
				Von Hobby-Projekten bis zu Enterprise-Anwendungen - wir haben das richtige Paket.
			</p>
		</div>

		<!-- Pricing Grid -->
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Hobby -->
			<Card class="border-border/50 relative overflow-hidden">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Hobby</CardTitle>
						<CardDescription>Perfekt für Side-Projects</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">7,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">2 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">Shared</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">2 GB RAM</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">25 GB Storage</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">3 Apps</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Git-Deployment</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/apps/konfigurator">Jetzt starten</Button>
				</CardContent>
			</Card>

			<!-- Starter -->
			<Card class="border-primary/50 relative overflow-hidden shadow-lg">
				<div class="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
					BELIEBT
				</div>
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Starter</CardTitle>
						<CardDescription>Für produktive Apps</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">14,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">Dedicated</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">4 GB RAM</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">50 GB Storage</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">10 Apps</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Auto-Scaling</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/apps/konfigurator">Jetzt starten</Button>
				</CardContent>
			</Card>

			<!-- Business -->
			<Card class="border-border/50 relative overflow-hidden">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Business</CardTitle>
						<CardDescription>Für wachsende Teams</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">29,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">Dedicated</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">8 GB RAM</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">100 GB Storage</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unlimited Apps</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Priority Support</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/apps/konfigurator">Jetzt starten</Button>
				</CardContent>
			</Card>

			<!-- Enterprise -->
			<Card class="border-border/50 relative overflow-hidden">
				<CardHeader>
					<div class="mb-2">
						<CardTitle>Enterprise</CardTitle>
						<CardDescription>Maximale Performance</CardDescription>
					</div>
					<div class="mt-4">
						<div class="flex items-baseline">
							<span class="text-4xl font-bold text-foreground">59,99€</span>
							<span class="ml-2 text-muted-foreground">/Monat</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 vCPU Cores</p>
								<p class="text-sm text-muted-foreground">Dedicated</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">16 GB RAM</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<div>
								<p class="font-medium">200 GB Storage</p>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Unlimited Apps</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">24/7 Phone Support</span>
						</div>
					</div>
					<Button class="w-full mt-6" href="/apps/konfigurator">Jetzt starten</Button>
				</CardContent>
			</Card>
		</div>

		<!-- All included -->
		<div class="mt-16">
			<Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
				<CardContent class="p-8">
					<h3 class="text-xl font-bold mb-6 text-center">In allen Paketen inklusive:</h3>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Kostenlose SSL-Zertifikate</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">DDoS-Schutz</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Automatische Backups</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">CI/CD Pipeline</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Monitoring & Logs</span>
						</div>
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-5 w-5 text-primary mt-0.5 shrink-0" />
							<span class="text-sm">Custom Domains</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- Workflow Section -->
<section class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
			<!-- Left Column -->
			<div class="space-y-8">
				<div>
					<Badge variant="secondary" class="mb-4">Deploy-Workflow</Badge>
					<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Von Code zu Production in Minuten
					</h2>
					<p class="text-lg text-muted-foreground">
						Unser optimierter Workflow macht das Deployment so einfach wie nie zuvor.
					</p>
				</div>

				<div class="space-y-6">
					<div class="flex gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							1
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Repository verbinden</h3>
							<p class="text-muted-foreground">
								Verbinde dein GitHub, GitLab oder Bitbucket Repository mit einem Klick.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							2
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Konfiguration anpassen</h3>
							<p class="text-muted-foreground">
								Wähle dein Framework, setze Umgebungsvariablen und konfiguriere Build-Commands.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							3
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Deployen</h3>
							<p class="text-muted-foreground">
								Drücke auf Deploy und deine App ist in unter 60 Sekunden live.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							4
						</div>
						<div>
							<h3 class="mb-1 font-semibold text-foreground">Auto-Updates</h3>
							<p class="text-muted-foreground">
								Jeder Push zu deinem Main-Branch triggert automatisch ein neues Deployment.
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
							<Layers class="h-5 w-5" />
							Enterprise Features
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-4">
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<RefreshCw class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Zero-Downtime Deployments</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Deploye neue Versionen ohne Ausfallzeiten durch Rolling Updates.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Gauge class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Health Checks</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Automatische Überwachung und Neustart bei Problemen.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<GitBranch class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Preview Deployments</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Automatische Preview-URLs für jeden Pull Request.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Shield class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Secrets Management</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Sichere Verwaltung von API-Keys und Credentials.
								</p>
							</div>
							<div class="p-4 rounded-lg bg-muted/50">
								<div class="flex items-start gap-3 mb-2">
									<Settings class="h-5 w-5 text-primary shrink-0 mt-0.5" />
									<h4 class="font-semibold">Custom Build Pipelines</h4>
								</div>
								<p class="text-sm text-muted-foreground">
									Definiere eigene Build-Steps und Post-Deploy-Hooks.
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
			<Rocket class="h-16 w-16 text-primary mx-auto mb-6" />
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Bereit für dein erstes Deployment?
			</h2>
			<p class="mb-8 text-lg text-muted-foreground">
				Starte noch heute und deploye deine erste App in unter einer Minute. 
				Keine Kreditkarte für den Start erforderlich.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="/apps/konfigurator">
					Jetzt kostenlos starten
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#contact">
					<Users class="h-5 w-5" />
					Demo anfragen
				</Button>
			</div>
		</div>
	</div>
</section>

