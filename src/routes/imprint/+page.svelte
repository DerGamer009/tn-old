<svelte:head>
	<title>Impressum | TitanNode</title>
	<meta
		name="description"
		content="Impressum und gesetzliche Angaben zu TitanNode."
	/>
</svelte:head>

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 py-20">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="mb-10 text-center md:text-left">
			<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
				<Icon icon="tabler:info-circle" class="mr-1 h-3 w-3" />
				Rechtliches
			</Badge>
			<h1 class="text-3xl md:text-4xl font-bold mb-3">Impressum</h1>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl">
				Angaben gemäß § 5 TMG und Informationen zum Diensteanbieter von TitanNode.
			</p>
		</div>

		<div class="grid gap-6 md:gap-8 md:grid-cols-2">
			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Anbieter</h2>
					<div class="space-y-2 text-muted-foreground">
						<p class="font-semibold text-foreground">TitanNode</p>
						<p>Karl-Liebknecht-Ring 2</p>
						<p>06679 Hohenmölsen</p>
						<p>Deutschland</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Kontakt</h2>
					<div class="space-y-2 text-muted-foreground">
						<p class="flex items-center gap-2">
							<Icon icon="tabler:mail" class="h-5 w-5 text-primary" />
							<span>E-Mail: contact@titannode.com</span>
						</p>
						<p class="flex items-center gap-2">
							<Icon icon="tabler:world" class="h-5 w-5 text-primary" />
							<span>Website: www.titannode.com</span>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Vertretungsberechtigte Geschäftsführung</h2>
					<div class="space-y-2 text-muted-foreground">
						<p>Phillipp Jäger</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Registereintrag</h2>
					<div class="space-y-2 text-muted-foreground">
						<p>Derzeit kein Eintrag im Handelsregister vorhanden.</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Umsatzsteuer-Identifikationsnummer</h2>
					<div class="space-y-2 text-muted-foreground">
						<p>
							Derzeit keine Umsatzsteuer-Identifikationsnummer vergeben, da TitanNode nicht als
							umsatzsteuerpflichtiges Unternehmen geführt wird (keine Pflicht zur Angabe nach § 27a UStG).
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
					<div class="space-y-2 text-muted-foreground">
						<p>Phillipp Jäger</p>
						<p>Karl-Liebknecht-Ring 2</p>
						<p>06679 Hohenmölsen</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Streitschlichtung</h2>
					<div class="space-y-4 text-muted-foreground">
						<p>
							Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
						</p>
						<p>
							<a href="https://ec.europa.eu/consumers/odr" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
								https://ec.europa.eu/consumers/odr
							</a>
						</p>
						<p>
							Unsere E-Mail-Adresse finden Sie oben im Impressum.
						</p>
						<p>
							Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
							Verbraucherschlichtungsstelle teilzunehmen.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/50 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
				<CardContent class="p-8">
					<h2 class="text-2xl font-bold mb-4">Haftungsausschluss</h2>
					<div class="space-y-4 text-muted-foreground">
						<div>
							<h3 class="font-semibold text-foreground mb-2">Haftung für Inhalte</h3>
							<p class="text-sm">
								Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
								nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
								Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
								Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
								Tätigkeit hinweisen.
							</p>
						</div>
						<div>
							<h3 class="font-semibold text-foreground mb-2">Haftung für Links</h3>
							<p class="text-sm">
								Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
								Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
							</p>
						</div>
						<div>
							<h3 class="font-semibold text-foreground mb-2">Urheberrecht</h3>
							<p class="text-sm">
								Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
								dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
								der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
								Zustimmung des jeweiligen Autors bzw. Erstellers.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>

