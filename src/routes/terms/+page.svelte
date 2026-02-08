<svelte:head>
	<title>Allgemeine Geschäftsbedingungen | TitanNode</title>
	<meta
		name="description"
		content="Allgemeine Geschäftsbedingungen (AGB) von TitanNode."
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
				<Icon icon="tabler:file-text" class="mr-1 h-3 w-3" />
				Rechtliches
			</Badge>
			<h1 class="text-3xl md:text-4xl font-bold mb-3">Allgemeine Geschäftsbedingungen</h1>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl">
				Nachfolgend finden Sie die grundlegenden Bedingungen für die Nutzung der Hosting‑Leistungen von TitanNode.
			</p>
		</div>

		<Card class="border-border/50 bg-card/95 shadow-sm hover:shadow-md transition-shadow mb-8">
			<CardContent class="p-8 prose prose-slate dark:prose-invert max-w-none">
				<h2>§ 1 Geltungsbereich</h2>
				<p>
					(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Bereitstellung 
					von Hosting-Leistungen zwischen TitanNode (nachfolgend "Anbieter") und dem Kunden.
				</p>
				<p>
					(2) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden 
					nur dann und insoweit Vertragsbestandteil, als der Anbieter ihrer Geltung ausdrücklich schriftlich 
					zugestimmt hat.
				</p>

				<h2>§ 2 Vertragsschluss</h2>
				<p>
					(1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern 
					eine Aufforderung zur Bestellung dar.
				</p>
				<p>
					(2) Durch Anklicken des Buttons "Kostenpflichtig bestellen" gibt der Kunde ein verbindliches 
					Angebot zum Abschluss eines Vertrages ab.
				</p>
				<p>
					(3) Der Anbieter bestätigt den Eingang der Bestellung durch Versendung einer Bestätigungs-E-Mail. 
					Diese Bestellbestätigung stellt die Annahme des Angebots dar.
				</p>

				<h2>§ 3 Leistungsumfang</h2>
				<p>
					(1) Der Anbieter erbringt Hosting-Leistungen nach Maßgabe der jeweiligen Leistungsbeschreibung.
				</p>
				<p>
					(2) Der Anbieter ist berechtigt, die vertraglich geschuldete Leistung durch Dritte (Subunternehmer) 
					erbringen zu lassen.
				</p>
				<p>
					(3) Der Anbieter gewährleistet eine Verfügbarkeit der Server von 99,9% im Jahresmittel. Hiervon 
					ausgenommen sind Ausfallzeiten aufgrund von Wartungsarbeiten.
				</p>

				<h2>§ 4 Pflichten des Kunden</h2>
				<p>
					(1) Der Kunde ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu 
					machen und diese bei Änderungen unverzüglich zu aktualisieren.
				</p>
				<p>
					(2) Der Kunde ist verpflichtet, seine Zugangsdaten geheim zu halten und vor dem Zugriff durch 
					unbefugte Dritte zu schützen.
				</p>
				<p>
					(3) Der Kunde verpflichtet sich, die Dienste nicht für rechtswidrige Zwecke zu nutzen und keine 
					Inhalte zu speichern oder zu verbreiten, die gegen geltendes Recht verstoßen.
				</p>

				<h2>§ 5 Preise und Zahlungsbedingungen</h2>
				<p>
					(1) Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise. Alle Preise verstehen sich 
					inklusive der gesetzlichen Mehrwertsteuer.
				</p>
				<p>
					(2) Die Abrechnung erfolgt monatlich oder jährlich im Voraus, je nach gewähltem Abrechnungszeitraum.
				</p>
				<p>
					(3) Der Kunde ist verpflichtet, für eine ausreichende Deckung des angegebenen Zahlungsmittels zu 
					sorgen.
				</p>
				<p>
					(4) Bei Zahlungsverzug ist der Anbieter berechtigt, Verzugszinsen in Höhe von 5 Prozentpunkten 
					über dem Basiszinssatz zu berechnen.
				</p>

				<h2>§ 6 Vertragslaufzeit und Kündigung</h2>
				<p>
					(1) Die Mindestvertragslaufzeit beträgt einen Monat, sofern nicht ausdrücklich anders vereinbart.
				</p>
				<p>
					(2) Der Vertrag verlängert sich automatisch um den gewählten Abrechnungszeitraum, wenn er nicht 
					mit einer Frist von 14 Tagen zum Ende der jeweiligen Laufzeit gekündigt wird.
				</p>
				<p>
					(3) Die Kündigung bedarf der Textform (z.B. E-Mail).
				</p>
				<p>
					(4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
				</p>

				<h2>§ 7 Sperrung</h2>
				<p>
					(1) Der Anbieter ist berechtigt, den Zugang des Kunden zu den Diensten ganz oder teilweise zu 
					sperren, wenn:
				</p>
				<ul>
					<li>der Kunde mit der Zahlung fälliger Beträge in Verzug ist,</li>
					<li>der Kunde gegen diese AGB verstößt,</li>
					<li>der begründete Verdacht besteht, dass die Dienste für rechtswidrige Zwecke genutzt werden.</li>
				</ul>
				<p>
					(2) Die Sperrung ist aufzuheben, sobald der Grund für die Sperrung entfallen ist.
				</p>

				<h2>§ 8 Datensicherung</h2>
				<p>
					(1) Der Anbieter erstellt regelmäßige Backups der Kundendaten.
				</p>
				<p>
					(2) Der Kunde ist verpflichtet, selbst regelmäßig Sicherungskopien seiner Daten zu erstellen.
				</p>

				<h2>§ 9 Haftung</h2>
				<p>
					(1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit.
				</p>
				<p>
					(2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den 
					vertragstypischen, vorhersehbaren Schaden begrenzt.
				</p>
				<p>
					(3) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
				</p>

				<h2>§ 10 Datenschutz</h2>
				<p>
					Der Anbieter verarbeitet personenbezogene Daten des Kunden gemäß den geltenden 
					Datenschutzbestimmungen. Weitere Informationen finden Sie in unserer Datenschutzerklärung.
				</p>

				<h2>§ 11 Änderung der AGB</h2>
				<p>
					(1) Der Anbieter behält sich vor, diese AGB zu ändern.
				</p>
				<p>
					(2) Änderungen werden dem Kunden mindestens vier Wochen vor ihrem Inkrafttreten per E-Mail 
					mitgeteilt.
				</p>
				<p>
					(3) Widerspricht der Kunde der Geltung der neuen AGB nicht innerhalb von vier Wochen nach 
					Zugang der Mitteilung, gelten die geänderten AGB als angenommen.
				</p>

				<h2>§ 12 Schlussbestimmungen</h2>
				<p>
					(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
				</p>
				<p>
					(2) Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist der Sitz des Anbieters, sofern 
					der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches 
					Sondervermögen ist.
				</p>
				<p>
					(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit 
					der übrigen Bestimmungen hiervon unberührt.
				</p>

				<h2>Kontakt</h2>
				<p>
					TitanNode<br />
					Karl-Liebknecht-Ring 2<br />
					06679 Hohenmölsen<br />
					Deutschland
				</p>
				<p>
					E-Mail: contact@titannode.com
				</p>
			</CardContent>
		</Card>
	</div>
</div>

