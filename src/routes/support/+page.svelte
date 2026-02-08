<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '$lib/components/ui/accordion';
	import {
		Headphones,
		Mail,
		MessageCircle,
		Clock,
		CheckCircle2,
		ArrowRight,
		FileText,
		BookOpen,
		Search,
		Phone,
		Ticket,
		Send,
		HelpCircle,
		Globe,
		Activity
	} from '@lucide/svelte';

	const STATUS_PAGE_URL = 'https://status.titannode.org/';

	// FAQ-Daten
	const faqCategories = [
		{
			title: 'Allgemeine Fragen',
			faqs: [
				{
					question: 'Welche Zahlungsmethoden akzeptiert ihr?',
					answer: 'Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte (Visa, Mastercard, American Express), PayPal, SEPA-Lastschrift und Sofortüberweisung. Bei Enterprise-Paketen ist auch Zahlung auf Rechnung möglich.'
				},
				{
					question: 'Gibt es eine Geld-zurück-Garantie?',
					answer: 'Ja, wir bieten eine 14-tägige Geld-zurück-Garantie auf alle unsere Dienste. Wenn du innerhalb der ersten 14 Tage nicht zufrieden bist, erstatten wir dir den vollen Betrag.'
				},
				{
					question: 'Kann ich mein Paket jederzeit upgraden?',
					answer: 'Absolut! Du kannst dein Paket jederzeit upgraden. Die Änderung wird sofort wirksam und die Abrechnung erfolgt anteilig.'
				},
				{
					question: 'Wo befinden sich eure Rechenzentren?',
					answer: 'Unsere Server befinden sich in hochmodernen Rechenzentren in Deutschland (Frankfurt, Nürnberg). Alle Daten werden DSGVO-konform in Deutschland gespeichert.'
				}
			]
		},
		{
			title: 'VPS & Server',
			faqs: [
				{
					question: 'Habe ich Root-Zugriff auf meinen VPS?',
					answer: 'Ja, bei allen VPS-Paketen erhältst du vollständigen Root-Zugriff (Linux) bzw. Administrator-Zugriff (Windows). Du hast die volle Kontrolle über deinen Server.'
				},
				{
					question: 'Wie schnell wird mein Server bereitgestellt?',
					answer: 'Die Bereitstellung erfolgt in der Regel innerhalb von 5-10 Minuten nach Zahlungseingang. Bei Windows-Servern kann es bis zu 30 Minuten dauern.'
				},
				{
					question: 'Kann ich mein Betriebssystem jederzeit wechseln?',
					answer: 'Ja, du kannst über unser Control Panel jederzeit ein neues Betriebssystem installieren. Beachte, dass dabei alle Daten gelöscht werden - erstelle vorher ein Backup!'
				},
				{
					question: 'Sind Backups inklusive?',
					answer: 'Ja, automatische tägliche Backups sind in allen Paketen enthalten. Die letzten 7 Backups werden aufbewahrt und können jederzeit wiederhergestellt werden.'
				}
			]
		},
		{
			title: 'Gameserver',
			faqs: [
				{
					question: 'Welche Spiele werden unterstützt?',
					answer: 'Wir unterstützen über 100 verschiedene Spiele, darunter Minecraft, CS:GO/CS2, ARK, Rust, Valheim, FiveM und viele mehr. Eine vollständige Liste findest du auf unserer Gameserver-Seite.'
				},
				{
					question: 'Kann ich Mods und Plugins installieren?',
					answer: 'Ja! Unser Game Panel bietet One-Click-Installation für beliebte Mods und Plugins. Du hast auch vollständigen FTP-Zugriff für manuelle Installationen.'
				},
				{
					question: 'Wie funktioniert der DDoS-Schutz?',
					answer: 'Alle Gameserver sind durch unseren professionellen DDoS-Schutz abgesichert, der Angriffe bis zu mehreren Terabits abwehren kann. Der Schutz ist automatisch aktiv und kostenlos.'
				},
				{
					question: 'Kann ich die Slot-Anzahl ändern?',
					answer: 'Ja, du kannst die Slot-Anzahl jederzeit über das Game Panel anpassen (je nach Paket und verfügbaren Ressourcen).'
				}
			]
		},
		{
			title: 'App-Hosting',
			faqs: [
				{
					question: 'Wie funktioniert das Deployment?',
					answer: 'Verbinde einfach dein Git-Repository (GitHub, GitLab, Bitbucket) und wähle den Branch aus. Bei jedem Push wird automatisch ein neues Deployment ausgelöst.'
				},
				{
					question: 'Welche Programmiersprachen werden unterstützt?',
					answer: 'Wir unterstützen Node.js, Python, PHP, Go, Ruby, Java, .NET und viele mehr. Du kannst auch eigene Docker-Container verwenden.'
				},
				{
					question: 'Sind SSL-Zertifikate inklusive?',
					answer: 'Ja, kostenlose Let\'s Encrypt SSL-Zertifikate sind in allen Paketen enthalten und werden automatisch erneuert.'
				},
				{
					question: 'Kann ich eine eigene Domain verwenden?',
					answer: 'Ja, du kannst beliebig viele eigene Domains verwenden. Einfach einen A-Record auf unsere IP setzen und die Domain in den Einstellungen hinzufügen.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Support & Hilfe - TitanNode</title>
	<meta name="description" content="24/7 Support für alle deine Fragen. FAQ, Wissensdatenbank, Ticket-System und Live-Chat." />
</svelte:head>

<!-- Hero Section -->
<section class="relative w-full overflow-hidden border-b bg-background">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
	
	<div class="container relative mx-auto max-w-screen-2xl px-4 py-20 sm:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<Badge variant="secondary" class="mb-6 px-4 py-2">
				<Headphones class="mr-2 h-4 w-4" />
				Support Center
			</Badge>

			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
				Wir sind für dich
				<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					da
				</span>
			</h1>

			<p class="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
				24/7 Support von echten Menschen. Egal ob technische Frage, Problem oder Beratung – 
				unser Team hilft dir schnell und kompetent weiter.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="gap-2 px-8 py-6 text-lg" href="#contact">
					Ticket erstellen
					<Send class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg" href="#faq">
					<HelpCircle class="h-5 w-5" />
					FAQ durchsuchen
				</Button>
			</div>

			<div class="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">24/7</div>
					<div class="text-sm text-muted-foreground">Verfügbar</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">&lt;5min</div>
					<div class="text-sm text-muted-foreground">Ø Antwortzeit</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">98%</div>
					<div class="text-sm text-muted-foreground">Zufriedenheit</div>
				</div>
				<div class="space-y-2">
					<div class="text-3xl font-bold text-foreground">DE</div>
					<div class="text-sm text-muted-foreground">Deutschsprachig</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Support Channels Section -->
<section id="contact" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Kontaktmöglichkeiten</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Wähle deinen bevorzugten Kanal
			</h2>
			<p class="text-lg text-muted-foreground">
				Egal wie du uns kontaktierst - wir sind schnell und hilfsbereit zur Stelle.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Ticket System -->
			<Card class="border-primary/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Ticket class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Ticket-System</CardTitle>
					<CardDescription>
						Erstelle ein Support-Ticket für technische Fragen und Probleme
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<Clock class="h-4 w-4 text-muted-foreground" />
							<span>Antwort innerhalb von 5 Minuten</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<CheckCircle2 class="h-4 w-4 text-primary" />
							<span>24/7 verfügbar</span>
						</div>
					</div>
					<Button class="w-full" href="https://ticket.titannode.com">
						Ticket erstellen
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Live Chat -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<MessageCircle class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Live-Chat</CardTitle>
					<CardDescription>
						Chatte direkt mit unserem Support-Team in Echtzeit
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<Clock class="h-4 w-4 text-muted-foreground" />
							<span>Sofortige Antworten</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<CheckCircle2 class="h-4 w-4 text-primary" />
							<span>Mo-Fr 9-22 Uhr, Sa-So 10-20 Uhr</span>
						</div>
					</div>
					<Button class="w-full" variant="outline">
						Chat starten
						<MessageCircle class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Email Support -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Mail class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Email-Support</CardTitle>
					<CardDescription>
						Sende uns eine Email für weniger dringende Anfragen
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<Clock class="h-4 w-4 text-muted-foreground" />
							<span>Antwort innerhalb von 24 Stunden</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<Mail class="h-4 w-4 text-muted-foreground" />
							<span class="break-all">support@titannode.com</span>
						</div>
					</div>
					<Button class="w-full" variant="outline" href="mailto:support@titannode.com">
						Email senden
						<Mail class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Phone Support -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Phone class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Telefon-Support</CardTitle>
					<CardDescription>
						Ruf uns an für dringende Probleme (Enterprise-Kunden)
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<Clock class="h-4 w-4 text-muted-foreground" />
							<span>Mo-Fr 9-18 Uhr</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<Phone class="h-4 w-4 text-muted-foreground" />
							<span>+49 (0) 123 456789</span>
						</div>
					</div>
					<Button class="w-full" variant="outline" href="tel:+49123456789">
						Anrufen
						<Phone class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- System Status -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
						<Activity class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
					</div>
					<CardTitle>System-Status</CardTitle>
					<CardDescription>
						Echtzeit-Status aller Dienste: Infrastructure, Hosting und aktuelle Meldungen
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
							<span>Alle Systeme im Überblick</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<CheckCircle2 class="h-4 w-4 text-primary" />
							<span>Updates per E-Mail oder Discord</span>
						</div>
					</div>
					<Button class="w-full" variant="outline" href={STATUS_PAGE_URL} target="_blank" rel="noopener noreferrer">
						Status anzeigen (status.titannode.org)
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Knowledge Base -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<BookOpen class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Wissensdatenbank</CardTitle>
					<CardDescription>
						Durchsuche unsere ausführlichen Tutorials und Anleitungen
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<FileText class="h-4 w-4 text-muted-foreground" />
							<span>200+ Artikel</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<Search class="h-4 w-4 text-muted-foreground" />
							<span>Durchsuchbar</span>
						</div>
					</div>
					<Button class="w-full" variant="outline" href="/docs">
						Zur Wissensdatenbank
						<BookOpen class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Community -->
			<Card class="border-border/50 transition-all hover:shadow-lg">
				<CardHeader>
					<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Globe class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Community-Forum</CardTitle>
					<CardDescription>
						Tausche dich mit anderen Nutzern aus und finde Lösungen
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm">
							<MessageCircle class="h-4 w-4 text-muted-foreground" />
							<span>Aktive Community</span>
						</div>
						<div class="flex items-center gap-2 text-sm">
							<CheckCircle2 class="h-4 w-4 text-primary" />
							<span>Schnelle Antworten</span>
						</div>
					</div>
					<Button class="w-full" variant="outline" href="https://community.titannode.com">
						Zum Forum
						<Globe class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section id="faq" class="w-full border-y bg-muted/50 py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">FAQ</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
				Häufig gestellte Fragen
			</h2>
			<p class="text-lg text-muted-foreground">
				Finde schnelle Antworten auf die häufigsten Fragen zu unseren Diensten.
			</p>
		</div>

		<div class="mx-auto max-w-4xl space-y-8">
			{#each faqCategories as category}
				<div>
					<h3 class="mb-4 text-xl font-bold text-foreground">{category.title}</h3>
					<Accordion type="single" class="w-full">
						{#each category.faqs as faq, index}
							<AccordionItem value={`${category.title}-${index}`}>
								<AccordionTrigger class="text-left">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent>
									<p class="text-muted-foreground">
										{faq.answer}
									</p>
								</AccordionContent>
							</AccordionItem>
						{/each}
					</Accordion>
				</div>
			{/each}
		</div>

		<div class="mt-16 text-center">
			<p class="mb-4 text-muted-foreground">
				Hast du weitere Fragen? Wir helfen dir gerne weiter!
			</p>
			<Button size="lg" href="#contact">
				<MessageCircle class="mr-2 h-5 w-5" />
				Kontaktiere uns
			</Button>
		</div>
	</div>
</section>

<!-- Status Section -->
<section id="status" class="w-full py-20 sm:py-32">
	<div class="container mx-auto max-w-screen-2xl px-4">
		<div class="mx-auto mb-10 max-w-3xl text-center">
			<Badge variant="secondary" class="mb-4">Live-Status</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
				System-Status
			</h2>
			<p class="text-lg text-muted-foreground">
				Echtzeit-Übersicht aller TitanNode-Dienste: Infrastructure, Hosting und aktuelle Meldungen.
			</p>
		</div>
		<Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 max-w-3xl mx-auto overflow-hidden">
			<CardContent class="p-0">
				<div class="p-8 sm:p-10 text-center">
					<div class="flex items-center justify-center gap-2 mb-4">
						<div class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></div>
						<Badge variant="secondary" class="font-medium">All systems operational</Badge>
					</div>
					<p class="text-muted-foreground mb-6">
						Alle Dienste werden auf unserer offiziellen Status-Seite angezeigt. Bei Wartungen oder Störungen findest du dort aktuelle Meldungen und kannst Updates per E-Mail oder Discord abonnieren.
					</p>
					<Button size="lg" href={STATUS_PAGE_URL} target="_blank" rel="noopener noreferrer" class="gap-2">
						<CheckCircle2 class="h-5 w-5 text-emerald-500" />
						Status-Seite öffnen (status.titannode.org)
					</Button>
				</div>
				<div class="border-t border-border/50 bg-muted/30 px-6 py-3 text-center text-sm text-muted-foreground">
					Powered by Instatus
				</div>
			</CardContent>
		</Card>
	</div>
</section>

