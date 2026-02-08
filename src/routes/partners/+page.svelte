<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Partner werden | TitanNode</title>
	<meta name="description" content="Werden Sie TitanNode Partner und profitieren Sie von attraktiven Konditionen und exklusivem Support." />
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
					<Icon icon="tabler:handshake" class="mr-1 h-3 w-3" />
					Partnerprogramm
				</Badge>
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Gemeinsam
					<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						erfolgreich
					</span>
				</h1>
				<p class="text-lg text-muted-foreground md:text-xl">
					Werden Sie TitanNode Partner und profitieren Sie von attraktiven Provisionen, 
					exklusivem Support und erstklassigen Hosting-Lösungen für Ihre Kunden.
				</p>
			</div>
		</div>

		<!-- Decorative Elements -->
		<div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
	</section>

	<!-- Partner Types -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Partner-Programme</h2>
				<p class="text-muted-foreground">
					Wählen Sie das passende Programm für Ihr Business
				</p>
			</div>

			<div class="grid gap-8 lg:grid-cols-3">
				<!-- Affiliate Partner -->
				<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader>
						<Icon icon="tabler:link" class="h-12 w-12 text-primary mb-4" />
						<CardTitle class="text-2xl">Affiliate Partner</CardTitle>
						<p class="text-sm text-muted-foreground">Für Content Creator & Influencer</p>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3">
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Bis zu 20% Provision</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Lifetime-Vergütung</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Marketing-Materialien</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Tracking-Dashboard</span>
							</div>
						</div>
						<Button class="w-full mt-6">
							<Icon icon="tabler:rocket" class="mr-2 h-4 w-4" />
							Jetzt bewerben
						</Button>
					</CardContent>
				</Card>

				<!-- Reseller Partner -->
				<Card class="border-primary/50 border-2 shadow-lg relative">
					<div class="absolute -top-4 left-1/2 -translate-x-1/2">
						<Badge class="bg-primary text-primary-foreground">Beliebt</Badge>
					</div>
					<CardHeader>
						<Icon icon="tabler:building-store" class="h-12 w-12 text-primary mb-4" />
						<CardTitle class="text-2xl">Reseller Partner</CardTitle>
						<p class="text-sm text-muted-foreground">Für Agenturen & Wiederverkäufer</p>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3">
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Bis zu 30% Rabatt</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>White-Label Option</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Dedicated Account Manager</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Priority Support</span>
							</div>
						</div>
						<Button class="w-full mt-6">
							<Icon icon="tabler:rocket" class="mr-2 h-4 w-4" />
							Jetzt bewerben
						</Button>
					</CardContent>
				</Card>

				<!-- Technology Partner -->
				<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
					<CardHeader>
						<Icon icon="tabler:code" class="h-12 w-12 text-primary mb-4" />
						<CardTitle class="text-2xl">Technology Partner</CardTitle>
						<p class="text-sm text-muted-foreground">Für Software-Anbieter</p>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3">
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>API-Integration</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Co-Marketing</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Technical Support</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Icon icon="tabler:check" class="h-5 w-5 text-green-500" />
								<span>Revenue Share</span>
							</div>
						</div>
						<Button class="w-full mt-6">
							<Icon icon="tabler:rocket" class="mr-2 h-4 w-4" />
							Jetzt bewerben
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Benefits -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Partner-Vorteile</h2>
				<p class="text-muted-foreground">
					Das erwartet Sie als TitanNode Partner
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:coin" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Attraktive Provisionen</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Verdienen Sie bis zu 30% an jedem Kunden - lebenslang.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:headset" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Priority Support</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Dedicated Support-Team für alle Ihre Fragen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:chart-line" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Marketing-Support</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Professionelle Marketing-Materialien und Co-Marketing.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:dashboard" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Partner-Dashboard</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Übersicht über alle Verkäufe und Provisionen in Echtzeit.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Contact Form -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-2xl">
				<div class="mb-8 text-center">
					<h2 class="mb-4 text-3xl font-bold">Jetzt Partner werden</h2>
					<p class="text-muted-foreground">
						Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.
					</p>
				</div>

				<Card class="border-border/50">
					<CardContent class="p-8">
						<form class="space-y-6">
							<div class="grid gap-6 sm:grid-cols-2">
								<div class="space-y-2">
									<Label for="firstname">Vorname</Label>
									<Input id="firstname" placeholder="Max" required />
								</div>
								<div class="space-y-2">
									<Label for="lastname">Nachname</Label>
									<Input id="lastname" placeholder="Mustermann" required />
								</div>
							</div>

							<div class="space-y-2">
								<Label for="email">E-Mail</Label>
								<Input id="email" type="email" placeholder="max@beispiel.de" required />
							</div>

							<div class="space-y-2">
								<Label for="company">Unternehmen</Label>
								<Input id="company" placeholder="Musterfirma GmbH" />
							</div>

							<div class="space-y-2">
								<Label for="website">Website</Label>
								<Input id="website" type="url" placeholder="https://beispiel.de" />
							</div>

							<div class="space-y-2">
								<Label for="partner-type">Partner-Typ</Label>
								<select id="partner-type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
									<option value="">Bitte wählen...</option>
									<option value="affiliate">Affiliate Partner</option>
									<option value="reseller">Reseller Partner</option>
									<option value="technology">Technology Partner</option>
								</select>
							</div>

							<div class="space-y-2">
								<Label for="message">Nachricht</Label>
								<textarea id="message" rows="4" class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Erzählen Sie uns mehr über Ihr Unternehmen..."></textarea>
							</div>

							<Button type="submit" size="lg" class="w-full gap-2">
								<Icon icon="tabler:send" class="h-5 w-5" />
								Bewerbung absenden
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>
</div>

