<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Widerrufsrecht | TitanNode</title>
	<meta name="description" content="Widerrufsbelehrung für Verbraucher - Informationen zu Ihrem Widerrufsrecht bei TitanNode." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 py-20">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="mb-10 text-center md:text-left">
			<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
				<Icon icon="tabler:file-info" class="mr-1 h-3 w-3" />
				Rechtliches
			</Badge>
			<h1 class="text-3xl md:text-4xl font-bold mb-3">Widerrufsbelehrung</h1>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl">
				Hinweise zu deinem gesetzlichen Widerrufsrecht als Verbraucher bei Verträgen mit TitanNode.
			</p>
		</div>

		<Card class="border-border/50 bg-card/95 shadow-sm hover:shadow-md transition-shadow mb-8">
			<CardContent class="p-8 prose prose-slate dark:prose-invert max-w-none">
				<h2>Widerrufsrecht</h2>
				<p>
					Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
				</p>
				<p>
					Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
				</p>
				<p>
					Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
				</p>
				<div class="bg-muted p-4 rounded-lg my-4">
					<p class="mb-0">
						<strong>TitanNode</strong><br />
						Karl-Liebknecht-Ring 2<br />
						06679 Hohenmölsen<br />
						Deutschland<br />
						E-Mail: contact@titannode.com
					</p>
				</div>
				<p>
					mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über 
					Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte 
					Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
				</p>
				<p>
					Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des 
					Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
				</p>

				<h2>Folgen des Widerrufs</h2>
				<p>
					Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten 
					haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus 
					ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste 
					Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag 
					zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
				</p>
				<p>
					Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen 
					Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; 
					in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
				</p>

				<h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
				<p>
					Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben 
					Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie 
					uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits 
					erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen 
					Dienstleistungen entspricht.
				</p>

				<h2>Muster-Widerrufsformular</h2>
				<div class="bg-muted p-6 rounded-lg my-4">
					<p class="text-sm">
						(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden 
						Sie es zurück.)
					</p>
					<div class="mt-4 space-y-2 text-sm">
						<p>An:</p>
						<p>
							<strong>TitanNode</strong><br />
							Karl-Liebknecht-Ring 2<br />
							06679 Hohenmölsen<br />
							Deutschland<br />
							E-Mail: contact@titannode.com
						</p>
						<p class="mt-4">
							Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf 
							der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
						</p>
						<p>
							Bestellt am (*)/erhalten am (*)
						</p>
						<p>
							Name des/der Verbraucher(s)
						</p>
						<p>
							Anschrift des/der Verbraucher(s)
						</p>
						<p>
							Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
						</p>
						<p>
							Datum
						</p>
						<p class="mt-4 text-xs">
							(*) Unzutreffendes streichen
						</p>
					</div>
				</div>

				<h2>Besondere Hinweise</h2>
				<p>
					<strong>Vorzeitige Vertragserfüllung:</strong> Ihr Widerrufsrecht erlischt vorzeitig, wenn wir 
					mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche 
					Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr 
					Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren.
				</p>

				<h2>Ausschluss bzw. vorzeitiges Erlöschen des Widerrufsrechts</h2>
				<p>
					Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt 
					sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher 
					maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten 
					sind.
				</p>

				<h2>Kontakt bei Fragen</h2>
				<p>
					Wenn Sie Fragen zum Widerrufsrecht haben, können Sie uns jederzeit kontaktieren:
				</p>
				<p>
					E-Mail: contact@titannode.com
				</p>
			</CardContent>
		</Card>
	</div>
</div>

