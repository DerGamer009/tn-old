<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Rechenzentren | TitanNode</title>
	<meta name="description" content="Entdecken Sie unsere hochmodernen Equinix-Rechenzentren in Frankfurt, Deutschland. Erstklassige Infrastruktur mit höchsten Sicherheitsstandards." />
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
					<Icon icon="tabler:building" class="mr-1 h-3 w-3" />
					Equinix-Rechenzentren
				</Badge>
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Rechenzentren
				</h1>
				<p class="text-lg text-muted-foreground md:text-xl">
					Entdecken Sie unsere hochmodernen Equinix-Rechenzentren in Frankfurt, Deutschland. 
					Erstklassige Infrastruktur mit höchsten Sicherheitsstandards.
				</p>
			</div>
		</div>

		<!-- Decorative Elements -->
		<div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
	</section>

	<!-- Stats -->
	<section class="border-y bg-muted/30 py-12">
		<div class="container mx-auto px-4">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">99.99%</div>
					<p class="text-sm text-muted-foreground">Verfügbarkeit</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">3</div>
					<p class="text-sm text-muted-foreground">Equinix-Rechenzentren</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">24/7</div>
					<p class="text-sm text-muted-foreground">Sicherheitspersonal</p>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-primary">Tier III</div>
					<p class="text-sm text-muted-foreground">Design</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Equinix Rechenzentren -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Equinix-Rechenzentren</h2>
				<p class="text-muted-foreground">
					Hochmoderne Infrastruktur auf Unternehmensniveau mit außergewöhnlichen Konnektivitäts- und Sicherheitsstandards
				</p>
			</div>

			<div class="grid gap-8 lg:grid-cols-3">
				<!-- Equinix FR5 -->
				<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader>
						<div class="mb-4 flex items-center justify-between">
							<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
								<Icon icon="tabler:activity" class="mr-1 h-3 w-3" />
								Online
							</Badge>
							<Icon icon="tabler:flag-de" class="h-8 w-8" />
						</div>
						<CardTitle class="text-xl mb-2">Equinix FR5</CardTitle>
						<CardDescription>
							Frankfurt am Main, Deutschland
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Hochmodernes Rechenzentrum mit Infrastruktur auf Unternehmensniveau und außergewöhnlichen Konnektivitäts- und Sicherheitsstandards.
						</p>
						<div class="space-y-3 pt-4 border-t">
							<div class="flex items-start gap-3">
								<Icon icon="tabler:building" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Betonkonstruktion</p>
									<p class="text-xs text-muted-foreground">Doppelboden</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:ruler" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">5,957 m²</p>
									<p class="text-xs text-muted-foreground">Collocation Space</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:bolt" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">25.2 MW</p>
									<p class="text-xs text-muted-foreground">Leistungskapazität</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:leaf" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">100% erneuerbare Energie</p>
									<p class="text-xs text-muted-foreground">PUE von 1.2</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:shield-check" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Brandbekämpfung</p>
									<p class="text-xs text-muted-foreground">Mehrzonen-Ansaugung (FM-200 und Novec 1230)</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:plug" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">2 unabhängige Versorgungsleitungen</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:certificate" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Zertifizierungen</p>
									<p class="text-xs text-muted-foreground">SOC1 / SOC2, PCI DSS, ISO 14001, 50001</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:snowflake" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Kühlung</p>
									<p class="text-xs text-muted-foreground">Gekühltes Wasser und freie Kühlung sowie adiabatische Option</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Equinix FR7 -->
				<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader>
						<div class="mb-4 flex items-center justify-between">
							<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
								<Icon icon="tabler:activity" class="mr-1 h-3 w-3" />
								Online
							</Badge>
							<Icon icon="tabler:flag-de" class="h-8 w-8" />
						</div>
						<CardTitle class="text-xl mb-2">Equinix FR7</CardTitle>
						<CardDescription>
							Frankfurt am Main, Deutschland
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Erstklassige Colocation-Services mit modernster Technologie und einer Carrier-neutralen Infrastruktur.
						</p>
						<div class="space-y-3 pt-4 border-t">
							<div class="flex items-start gap-3">
								<Icon icon="tabler:building" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">2 Stockwerke</p>
									<p class="text-xs text-muted-foreground">Blech-Sandwichpaneel, Stahlrahmenkonstruktion, Doppelboden</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:ruler" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">6,600 m²</p>
									<p class="text-xs text-muted-foreground">Collocation Space</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:bolt" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">13 MW</p>
									<p class="text-xs text-muted-foreground">Leistungskapazität</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:leaf" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">100% erneuerbare Energie</p>
									<p class="text-xs text-muted-foreground">PUE von 1.3</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:shield-check" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Brandbekämpfung</p>
									<p class="text-xs text-muted-foreground">VESDA, HSSD, FM200-Gas, Doppelknock-Aktivierung, Hochdruck-Wassernebelsystem</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:plug" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">2 unabhängige Versorgungsleitungen</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:certificate" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Zertifizierungen</p>
									<p class="text-xs text-muted-foreground">SOC1 / SOC2, PCI DSS, ISO 14001, 50001</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:snowflake" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Kühlung</p>
									<p class="text-xs text-muted-foreground">Gekühltes Wasser und freie Kühlung sowie adiabatische Option</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Equinix FR8 -->
				<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader>
						<div class="mb-4 flex items-center justify-between">
							<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
								<Icon icon="tabler:activity" class="mr-1 h-3 w-3" />
								Online
							</Badge>
							<Icon icon="tabler:flag-de" class="h-8 w-8" />
						</div>
						<CardTitle class="text-xl mb-2">Equinix FR8</CardTitle>
						<CardDescription>
							Frankfurt am Main, Deutschland
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Eines der neuesten nachhaltigen Rechenzentren von Equinix mit modernster grüner Technologie und Energieeffizienz.
						</p>
						<div class="space-y-3 pt-4 border-t">
							<div class="flex items-start gap-3">
								<Icon icon="tabler:building" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Vierstöckiges Gebäude</p>
									<p class="text-xs text-muted-foreground">Betonkonstruktion, Doppelboden</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:ruler" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">4,800 m²</p>
									<p class="text-xs text-muted-foreground">Collocation Space</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:bolt" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">13.5 MW</p>
									<p class="text-xs text-muted-foreground">Leistungskapazität</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:leaf" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">100% erneuerbare Energie</p>
									<p class="text-xs text-muted-foreground">PUE von 1.05</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:shield-check" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Brandbekämpfung</p>
									<p class="text-xs text-muted-foreground">Trockensprinkleranlage mit doppelter Verriegelung und Voraktivierung</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:plug" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">2 unabhängige Versorgungsleitungen</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:certificate" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Zertifizierungen</p>
									<p class="text-xs text-muted-foreground">ISO 50600 & TSI, SOC1 / SOC2, PCI DSS, ISO 14001, 50001</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Icon icon="tabler:snowflake" class="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
								<div>
									<p class="text-sm font-medium">Kühlung</p>
									<p class="text-xs text-muted-foreground">Hybride trockene adiabatische Kühltürme mit zentraler wassergekühlter Kälteanlage für mechanische Trimmung, mit High-Density-Kühlung</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Technische Daten -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Technische Daten</h2>
				<p class="text-muted-foreground">
					Branchenführende Infrastruktur, die auf maximale Leistung, Zuverlässigkeit und Sicherheit ausgelegt ist.
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:bolt" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Energieinfrastruktur</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Redundante Stromversorgungssysteme mit N+1-USV und Notstromaggregaten gewährleisten eine Verfügbarkeit von 99.99 %.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:lock" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Sicherheitssysteme</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Mehrschichtige physische Sicherheit mit biometrischem Zugang, Überwachung rund um die Uhr. 24/7 Sicherheitspersonal vor Ort und Überwachung durch Video.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:snowflake" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Kühlsysteme</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Fortschrittliche Kühltechnologie, die optimale Temperatur- und Feuchtigkeitswerte effizient aufrechterhält.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:network" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Netzwerkverbindung</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Direkter Zugang zu den wichtigsten Cloud-Anbietern und Internetknoten mit Verbindungen mit geringer Latenz.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Compliance und Zertifizierungen -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Compliance und Zertifizierungen</h2>
				<p class="text-muted-foreground">
					Unsere Rechenzentren erfüllen die höchsten internationalen Standards in Bezug auf Sicherheit, Qualität und Umweltmanagement.
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:shield-check" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Hohe Sicherheitsstandards</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Das Rechenzentrum hält sich an strenge Sicherheitsprotokolle und bewährte Verfahren der Branche, um die Sicherheit Ihrer Daten zu gewährleisten.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:file-shield" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>DSGVO-konform</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Vollständige Einhaltung der europäischen Datenschutzbestimmungen und Datenschutzanforderungen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:certificate" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Tier III Design</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Parallel wartbare Infrastruktur mit mehreren unabhängigen Verteilungswegen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:chart-line" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Uptime</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Zertifizierte Einrichtungen, die auf maximale Verfügbarkeit und betriebliche Effizienz ausgelegt sind.
						</p>
					</CardContent>
				</Card>
			</div>

			<!-- Zertifizierungs-Badges -->
			<div class="mt-12 flex flex-wrap justify-center gap-4">
				<Badge variant="outline" class="px-4 py-2 text-sm">SOC1 / SOC2</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">PCI DSS</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">ISO 14001</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">ISO 50001</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">ISO 50600</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">TSI</Badge>
				<Badge variant="outline" class="px-4 py-2 text-sm">DSGVO</Badge>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-4 text-3xl font-bold">Bereit für Enterprise-Performance?</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					Starten Sie noch heute mit unserer erstklassigen Infrastruktur in den Equinix-Rechenzentren.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="/register">
						<Button size="lg" class="gap-2">
							<Icon icon="tabler:rocket" class="h-5 w-5" />
							Jetzt starten
						</Button>
					</a>
					<a href="/support">
						<Button size="lg" variant="outline" class="gap-2">
							<Icon icon="tabler:message-circle" class="h-5 w-5" />
							Kontakt aufnehmen
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>
