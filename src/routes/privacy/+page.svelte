<svelte:head>
	<title>Datenschutzerklärung | TitanNode</title>
	<meta
		name="description"
		content="Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten bei TitanNode."
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
				<Icon icon="tabler:shield-lock" class="mr-1 h-3 w-3" />
				Rechtliches
			</Badge>
			<h1 class="text-3xl md:text-4xl font-bold mb-3">Datenschutzerklärung</h1>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl">
				Informationen darüber, welche personenbezogenen Daten bei der Nutzung von TitanNode verarbeitet werden und welche Rechte du hast.
			</p>
		</div>

		<Card class="border-border/50 bg-card/95 shadow-sm hover:shadow-md transition-shadow mb-8">
			<CardContent class="p-8 prose prose-slate dark:prose-invert max-w-none">
				<h2>1. Datenschutz auf einen Blick</h2>
				
				<h3>Allgemeine Hinweise</h3>
				<p>
					Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
					Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit 
					denen Sie persönlich identifiziert werden können.
				</p>

				<h3>Datenerfassung auf dieser Website</h3>
				<h4>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
				<p>
					Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
					können Sie dem Impressum dieser Website entnehmen.
				</p>

				<h4>Wie erfassen wir Ihre Daten?</h4>
				<p>
					Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
					z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
				</p>
				<p>
					Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
					IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem 
					oder Uhrzeit des Seitenaufrufs).
				</p>

				<h4>Wofür nutzen wir Ihre Daten?</h4>
				<p>
					Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
					Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
				</p>

				<h4>Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
				<p>
					Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
					gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung 
					oder Löschung dieser Daten zu verlangen.
				</p>

				<h2>2. Hosting und Content Delivery Networks (CDN)</h2>
				
				<h3>Externes Hosting</h3>
				<p>
					Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, 
					die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann 
					es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, 
					Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, 
					handeln.
				</p>

				<h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
				
				<h3>Datenschutz</h3>
				<p>
					Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
					Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften 
					sowie dieser Datenschutzerklärung.
				</p>

				<h3>Hinweis zur verantwortlichen Stelle</h3>
				<p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
				<p>
					TitanNode<br />
					Karl-Liebknecht-Ring 2<br />
					06679 Hohenmölsen<br />
					Deutschland
				</p>
				<p>
					E-Mail: contact@titannode.com
				</p>

				<h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
				<p>
					Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können 
					eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf 
					erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
				</p>

				<h3>Recht auf Datenübertragbarkeit</h3>
				<p>
					Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines 
					Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, 
					maschinenlesbaren Format aushändigen zu lassen.
				</p>

				<h3>SSL- bzw. TLS-Verschlüsselung</h3>
				<p>
					Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine 
					SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die 
					Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer 
					Browserzeile.
				</p>

				<h2>4. Datenerfassung auf dieser Website</h2>
				
				<h3>Cookies</h3>
				<p>
					Unsere Internetseiten verwenden so genannte "Cookies". Cookies sind kleine Textdateien und richten 
					auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung 
					(Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
				</p>

				<h3>Server-Log-Dateien</h3>
				<p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien:</p>
				<ul>
					<li>Browsertyp und Browserversion</li>
					<li>verwendetes Betriebssystem</li>
					<li>Referrer URL</li>
					<li>Hostname des zugreifenden Rechners</li>
					<li>Uhrzeit der Serveranfrage</li>
					<li>IP-Adresse</li>
				</ul>

				<h3>Kontaktformular</h3>
				<p>
					Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
					Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der 
					Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
				</p>

				<h3>Registrierung auf dieser Website</h3>
				<p>
					Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen. 
					Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder 
					Dienstes, für den Sie sich registriert haben.
				</p>

				<h2>5. Plugins und Tools</h2>
				
				<h3>Google Fonts (lokales Hosting)</h3>
				<p>
					Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts. Die 
					Google Fonts sind lokal installiert. Eine Verbindung zu Servern von Google findet dabei nicht statt.
				</p>

				<h2>6. Ihre Rechte</h2>
				
				<p>Sie haben folgende Rechte:</p>
				<ul>
					<li>Recht auf Auskunft (Art. 15 DSGVO)</li>
					<li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
					<li>Recht auf Löschung (Art. 17 DSGVO)</li>
					<li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
					<li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
					<li>Widerspruchsrecht (Art. 21 DSGVO)</li>
					<li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
				</ul>

				<h2>7. Kontakt</h2>
				<p>
					Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:
				</p>
				<p>
					E-Mail: contact@titannode.com
				</p>
			</CardContent>
		</Card>
	</div>
</div>

