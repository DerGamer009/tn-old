/**
 * Dokumentations-Artikel: zentrale Definition für /docs und /docs/[slug].
 */

export type DocCategoryId = 'vps' | 'gameserver' | 'apps' | 'billing' | 'security';

export type DocArticle = {
	slug: string;
	title: string;
	description: string;
	category: DocCategoryId;
	icon: string;
	readTime: string;
	/** Optional: Markdown oder HTML für die Artikelseite (Placeholder bis Inhalte da sind) */
	content?: string;
};

function slugFromTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/&/g, 'und')
		.replace(/['']/g, '')
		.replace(/[^a-z0-9äöüß-]/g, (c) => {
			const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
			return map[c] ?? '';
		});
}

export const categories: { id: string; name: string; icon: string }[] = [
	{ id: 'all', name: 'Alle', icon: 'tabler:list' },
	{ id: 'vps', name: 'VPS', icon: 'tabler:server' },
	{ id: 'gameserver', name: 'Gameserver', icon: 'tabler:device-gamepad-2' },
	{ id: 'apps', name: 'App Hosting', icon: 'tabler:apps' },
	{ id: 'billing', name: 'Abrechnung', icon: 'tabler:credit-card' },
	{ id: 'security', name: 'Sicherheit', icon: 'tabler:shield-lock' }
];

const articlesData: Omit<DocArticle, 'slug'>[] = [
	// VPS
	{
		title: 'VPS einrichten und starten',
		description: 'Schritt-für-Schritt Anleitung zur ersten VPS-Einrichtung',
		category: 'vps',
		icon: 'tabler:rocket',
		readTime: '5 min',
		content: `<h2>Übersicht</h2>
<p>Nach der Bestellung Ihres VPS erhalten Sie die Zugangsdaten per E-Mail. Mit dieser Anleitung richten Sie Ihren Server in wenigen Minuten ein.</p>
<h2>Schritt 1: Zugangsdaten prüfen</h2>
<p>In der Bestätigungs-E-Mail finden Sie:</p>
<ul><li>IP-Adresse des Servers</li><li>Root-Passwort oder Hinweis auf SSH-Key</li><li>Link zum TitanNode-Dashboard</li></ul>
<h2>Schritt 2: Erste Anmeldung per SSH</h2>
<p>Verbinden Sie sich von Ihrem Rechner aus per SSH:</p>
<pre><code>ssh root@Ihre-Server-IP</code></pre>
<p>Geben Sie bei Aufforderung das Passwort ein (oder nutzen Sie Ihren SSH-Key).</p>
<h2>Schritt 3: System aktualisieren</h2>
<p>Direkt nach der ersten Anmeldung empfehlen wir ein Update:</p>
<pre><code>apt update && apt upgrade -y</code></pre>
<p><strong>Hinweis:</strong> Bei Ubuntu/Debian-Systemen. Bei anderen Distributionen nutzen Sie die jeweiligen Paketmanager.</p>
<h2>Schritt 4: Benutzer anlegen (empfohlen)</h2>
<p>Arbeiten Sie nicht dauerhaft als root. Legen Sie einen Benutzer mit sudo-Rechten an:</p>
<pre><code>adduser meinuser
usermod -aG sudo meinuser</code></pre>
<p>Ab dann über SSH z. B. <code>ssh meinuser@Ihre-Server-IP</code> verwenden.</p>
<h2>Weitere Schritte</h2>
<p>Im Dashboard können Sie den Server starten, stoppen und neu starten. Für SSH-Keys und Firewall siehe die Artikel „SSH-Zugriff konfigurieren“ und „Firewall einrichten“.</p>`
	},
	{
		title: 'SSH-Zugriff konfigurieren',
		description: 'SSH-Keys erstellen und sicher auf Ihren VPS zugreifen',
		category: 'vps',
		icon: 'tabler:key',
		readTime: '3 min',
		content: `<h2>Warum SSH-Keys?</h2>
<p>SSH-Keys sind sicherer als Passwörter: Sie werden nicht über das Netz übertragen und sind gegen Brute-Force geschützt.</p>
<h2>Schlüssel auf Ihrem Rechner erstellen</h2>
<p>Unter Linux/macOS oder in der Windows-Eingabeaufforderung (OpenSSH):</p>
<pre><code>ssh-keygen -t ed25519 -C "ihre-email@beispiel.de"</code></pre>
<p>Speichern Sie den Key z. B. unter <code>~/.ssh/id_ed25519</code>. Optional können Sie eine Passphrase vergeben.</p>
<h2>Public Key auf den Server kopieren</h2>
<p>Mit einem Befehl den öffentlichen Schlüssel auf den VPS legen:</p>
<pre><code>ssh-copy-id root@Ihre-Server-IP</code></pre>
<p>Ohne <code>ssh-copy-id</code>: Inhalt von <code>~/.ssh/id_ed25519.pub</code> in <code>~/.ssh/authorized_keys</code> auf dem Server eintragen.</p>
<h2>Anmeldung nur mit Key erlauben</h2>
<p>Auf dem Server in <code>/etc/ssh/sshd_config</code> setzen:</p>
<pre><code>PasswordAuthentication no
PubkeyAuthentication yes</code></pre>
<p>Danach SSH-Dienst neu starten: <code>systemctl restart sshd</code>. <strong>Wichtig:</strong> Prüfen Sie vorher, dass der Key-Login funktioniert.</p>`
	},
	{
		title: 'VPS skalieren und upgraden',
		description: 'Ressourcen flexibel an Ihre Bedürfnisse anpassen',
		category: 'vps',
		icon: 'tabler:chart-line',
		readTime: '4 min',
		content: `<h2>Wann upgraden?</h2>
<p>Wenn Ihre Anwendung mehr RAM, CPU oder Speicher braucht, können Sie Ihren VPS im TitanNode-Dashboard hochstufen.</p>
<h2>Upgrade über das Dashboard</h2>
<ol><li>Im Dashboard unter „VPS“ Ihren Server auswählen.</li><li>„Upgrade“ oder „Tarif ändern“ wählen.</li><li>Neuen Tarif (z. B. mehr RAM, mehr vCPUs) auswählen und bestätigen.</li></ol>
<p>Die Änderung wird nach Bestätigung umgesetzt. Kurze Downtime ist je nach Infrastruktur möglich.</p>
<h2>Was passiert mit meinen Daten?</h2>
<p>Beim Upgrade bleiben Ihre Daten in der Regel erhalten. Bei einem Wechsel auf eine andere Hardware kann ein kurzer Umzug nötig sein – dazu erhalten Sie eine E-Mail.</p>
<h2>Downgrade</h2>
<p>Ein Downgrade (weniger Ressourcen) ist oft nur nach Rücksprache oder zu bestimmten Zeitpunkten möglich, damit Ihre Daten sicher migriert werden können. Details finden Sie in den Tarifinformationen.</p>`
	},
	{
		title: 'Firewall einrichten',
		description: 'UFW Firewall konfigurieren für maximale Sicherheit',
		category: 'vps',
		icon: 'tabler:shield',
		readTime: '6 min',
		content: `<h2>Warum eine Firewall?</h2>
<p>Eine Firewall begrenzt, welche Dienste von außen erreichbar sind. Nur benötigte Ports (z. B. SSH, HTTP, HTTPS) sollten geöffnet sein.</p>
<h2>UFW unter Ubuntu/Debian</h2>
<p>UFW (Uncomplicated Firewall) ist standardmäßig verfügbar. Status prüfen:</p>
<pre><code>ufw status</code></pre>
<h2>Regeln setzen</h2>
<pre><code>ufw allow 22/tcp    # SSH – unbedingt vor dem Aktivieren erlauben!
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw default deny incoming
ufw default allow outgoing</code></pre>
<p><strong>Wichtig:</strong> Lassen Sie Port 22 (SSH) offen, sonst verlieren Sie den Zugriff.</p>
<h2>Firewall aktivieren</h2>
<pre><code>ufw enable</code></pre>
<p>Bei Abfrage mit „y“ bestätigen. Anschließend: <code>ufw status numbered</code> zum Prüfen der Regeln.</p>
<h2>Weitere Dienste</h2>
<p>Für Datenbanken (z. B. MySQL nur lokal): Kein <code>ufw allow</code> von außen. Nur von localhost oder über eine sichere Verbindung nutzen.</p>`
	},
	{
		title: 'Backups erstellen und wiederherstellen',
		description: 'Automatische Backups einrichten und Daten wiederherstellen',
		category: 'vps',
		icon: 'tabler:database',
		readTime: '5 min',
		content: `<h2>Backup-Optionen bei TitanNode</h2>
<p>Je nach Tarif stehen Ihnen automatische Snapshot-Backups oder manuelle Snapshots im Dashboard zur Verfügung.</p>
<h2>Manuelles Snapshot erstellen</h2>
<ol><li>Dashboard → VPS → Ihr Server.</li><li>„Snapshot“ oder „Backup“ wählen.</li><li>Snapshot benennen und starten. Der VPS läuft weiter, die Erstellung kann einige Minuten dauern.</li></ol>
<h2>Aus einem Snapshot wiederherstellen</h2>
<p>Sie können einen neuen VPS aus einem Snapshot erstellen oder – falls unterstützt – den bestehenden Server auf einen älteren Snapshot zurücksetzen. Die aktuelle Daten werden dabei ersetzt.</p>
<h2>Eigene Backups (z. B. mit rsync)</h2>
<p>Für Dateien und Datenbanken können Sie zusätzlich eigene Backups anlegen:</p>
<pre><code>rsync -avz /pfad/auf/server user@backup-server:/ziel/</code></pre>
<p>Kombinieren Sie das mit Cron für automatische tägliche Backups. Datenbanken vorher mit <code>mysqldump</code> oder <code>pg_dump</code> sichern.</p>`
	},
	// Gameserver
	{
		title: 'Minecraft Server installieren',
		description: 'Vanilla, Paper oder Forge - Minecraft Server aufsetzen',
		category: 'gameserver',
		icon: 'tabler:box',
		readTime: '8 min',
		content: `<h2>Voraussetzung</h2>
<p>Sie haben einen TitanNode-Gameserver gebucht. Im Dashboard können Sie den Servertyp und die Version wählen.</p>
<h2>Servertyp wählen</h2>
<ul><li><strong>Vanilla:</strong> Offizieller Minecraft-Server, ohne Mods.</li><li><strong>Paper/Spigot:</strong> Für Plugins (Bukkit-kompatibel), oft bessere Performance.</li><li><strong>Forge/Modded:</strong> Für Modpacks und Mods.</li></ul>
<h2>Installation im Panel</h2>
<ol><li>Dashboard → Gameserver → Ihr Server.</li><li>„Installieren“ oder „Version wechseln“ wählen.</li><li>Gewünschte Version und Typ (z. B. Paper 1.20) auswählen und starten.</li></ol>
<p>Das Panel lädt die Dateien herunter und startet den Server. Die ersten Starts können etwas länger dauern.</p>
<h2>Erste Einstellungen</h2>
<p>Nach dem Start <code>server.properties</code> und <code>eula.txt</code> (EULA akzeptieren) anpassen. Im Dateimanager des Panels oder per FTP bearbeiten.</p>
<h2>Server starten und verbinden</h2>
<p>Im Dashboard „Start“ drücken. Verbindung mit der im Panel angezeigten Adresse (IP:Port) in Minecraft herstellen.</p>`
	},
	{
		title: 'CS:GO Server konfigurieren',
		description: 'Server-Config, Maps und Plugins für CS:GO einrichten',
		category: 'gameserver',
		icon: 'tabler:settings',
		readTime: '10 min',
		content: `<h2>Übersicht</h2>
<p>Über das TitanNode-Panel installieren Sie den CS:GO-Server (bzw. CS2) und konfigurieren ihn per Config-Dateien.</p>
<h2>Installation starten</h2>
<ol><li>Gameserver im Dashboard auswählen.</li><li>„Spiel installieren“ oder „CS:GO/CS2“ auswählen.</li><li>Installation abwarten – SteamCMD lädt die Serverdateien.</li></ol>
<h2>Wichtige Config-Dateien</h2>
<ul><li><code>server.cfg</code> – Hauptkonfiguration (Hostname, RCON, Spielmodi).</li><li><code>gamemode_*.cfg</code> – Einstellungen für Casual, Competitive etc.</li></ul>
<h2>Beispiel server.cfg</h2>
<pre><code>hostname "Mein CS:GO Server"
rcon_password "sicheres-passwort"
sv_password ""           // Leer = kein Join-Passwort
mp_autoteambalance 1
mp_limitteams 1</code></pre>
<h2>Maps und Workshop</h2>
<p>Für Custom Maps: Workshop-IDs in der Config eintragen. Maps werden beim ersten Start heruntergeladen. Ggf. mehr Speicher und Startzeit einplanen.</p>
<h2>Plugins (SourceMod/MetaMod)</h2>
<p>Falls Sie Plugins nutzen: SourceMod und MetaMod in den Serverordner entpacken und in <code>server.cfg</code> bzw. den Plugin-Configs aktivieren.</p>`
	},
	{
		title: 'FTP-Zugriff für Gameserver',
		description: 'Dateien hochladen und verwalten via FTP',
		category: 'gameserver',
		icon: 'tabler:upload',
		readTime: '4 min',
		content: `<h2>FTP-Zugangsdaten</h2>
<p>Im TitanNode-Dashboard unter Ihrem Gameserver finden Sie FTP-Host, Benutzername und Passwort (oder Sie setzen ein eigenes).</p>
<h2>Verbindung herstellen</h2>
<p>Mit einem FTP-Client (FileZilla, WinSCP, Cyberduck o. ä.):</p>
<ul><li>Host: Die im Panel angezeigte Adresse (z. B. ftp.titannode.com oder Server-IP).</li><li>Port: 21 (FTP) oder 22 (SFTP, falls angeboten).</li><li>Benutzername und Passwort aus dem Dashboard.</li></ul>
<h2>Dateien hochladen</h2>
<p>Nach dem Login sehen Sie das Serverdatei-Verzeichnis. Laden Sie z. B. Maps, Plugins oder Mods in die vom Spiel erwarteten Ordner. Der Server sollte dafür gestoppt sein, wenn Sie Core-Dateien ändern.</p>
<h2>SFTP statt FTP</h2>
<p>SFTP (SSH File Transfer Protocol) ist verschlüsselt und oft sicherer. Nutzen Sie Port 22 und den gleichen Benutzer, sofern SFTP freigeschaltet ist.</p>
<h2>Dateimanager im Panel</h2>
<p>Alternativ können Sie Dateien direkt im Webbrowser über den integrierten Dateimanager im Dashboard hochladen und bearbeiten – praktisch für kleine Änderungen.</p>`
	},
	{
		title: 'Mods und Plugins installieren',
		description: 'Erweitere deinen Server mit Mods und Plugins',
		category: 'gameserver',
		icon: 'tabler:puzzle',
		readTime: '7 min',
		content: `<h2>Minecraft: Plugins (Paper/Spigot)</h2>
<p>Plugins liegen als .jar-Dateien im Ordner <code>plugins</code>. Nach dem Hochladen den Server neu starten. Konfiguration der Plugins oft unter <code>plugins/PluginName/config.yml</code>.</p>
<h2>Minecraft: Mods (Forge/Fabric)</h2>
<p>Mods in den Ordner <code>mods</code> legen. Server und Spieler brauchen dieselbe Mod-Liste bzw. dasselbe Modpack, sonst gibt es Inkompatibilitäten.</p>
<h2>CS:GO/CS2: SourceMod &amp; MetaMod</h2>
<p>MetaMod und SourceMod in den Server-Stammordner entpacken. Nach Neustart Plugins in <code>addons/sourcemod/plugins</code> legen. Verwaltung per RCON oder in-game.</p>
<h2>Allgemeine Tipps</h2>
<ul><li>Server vor dem Installieren stoppen.</li><li>Backup der wichtigen Dateien machen.</li><li>Kompatibilität mit der Serverversion prüfen.</li><li>Reihenfolge bei Abhängigkeiten beachten (z. B. MetaMod vor SourceMod).</li></ul>`
	},
	{
		title: 'Performance-Optimierung',
		description: 'Server-Performance verbessern und Lags reduzieren',
		category: 'gameserver',
		icon: 'tabler:speedboat',
		readTime: '6 min',
		content: `<h2>Minecraft</h2>
<ul><li><strong>Paper/Spigot:</strong> Weniger Lags als Vanilla, optimierte Ticks.</li><li><strong>View-Distance</strong> in <code>server.properties</code> reduzieren (z. B. 8–10).</li><li><strong>Entity-Weite</strong> begrenzen, unnötige Plugins/Mods entfernen.</li><li>Ausreichend RAM im Tarif wählen; bei vielen Spielern mehr Kerne/RAM buchen.</li></ul>
<h2>CS:GO/CS2</h2>
<p>FPS und Tickrate in der Config setzen. Weniger Custom-Content und saubere Configs reduzieren Last. Bei vielen Slots: leistungsstärkeren Tarif wählen.</p>
<h2>Allgemein</h2>
<ul><li>Regelmäßige Neustarts (z. B. per Cron oder Panel) können Speicherlecks mindern.</li><li>Logs und alte Backups aufräumen, um Speicher zu sparen.</li><li>DDoS-Schutz ist bei TitanNode inklusive – schützt vor Angriffen, die die Performance beeinträchtigen.</li></ul>`
	},
	// App Hosting
	{
		title: 'Node.js App deployen',
		description: 'Express, Next.js oder andere Node.js Apps bereitstellen',
		category: 'apps',
		icon: 'tabler:brand-nodejs',
		readTime: '7 min',
		content: `<h2>Voraussetzung</h2>
<p>Sie haben ein App-Hosting bei TitanNode gebucht. Im Dashboard können Sie eine Node.js-Umgebung auswählen und Ihre App deployen.</p>
<h2>Projekt hochladen</h2>
<ol><li>Dashboard → App Hosting → Ihre App.</li><li>Code per Git deployen oder Dateien per FTP/Dateimanager hochladen.</li><li>Eintrittspunkt angeben (z. B. <code>server.js</code>, <code>npm start</code>).</li></ol>
<h2>package.json und Abhängigkeiten</h2>
<p>Stellen Sie eine <code>package.json</code> mit <code>scripts.start</code> bereit. Beim ersten Deploy installiert das System die Abhängigkeiten mit <code>npm install</code>.</p>
<h2>Express / Next.js</h2>
<ul><li><strong>Express:</strong> Startbefehl z. B. <code>node server.js</code> oder <code>npm start</code>.</li><li><strong>Next.js:</strong> Build mit <code>npm run build</code>, Start mit <code>npm start</code>. Oder als statischer Export nutzen.</li></ul>
<h2>Port und Umgebung</h2>
<p>Die Plattform weist Ihrer App einen Port zu. Lesen Sie die Port-Nummer aus der Umgebungsvariable (z. B. <code>process.env.PORT</code>) und binden Sie Ihren Server daran.</p>`
	},
	{
		title: 'Docker Container starten',
		description: 'Apps in Docker Containern ausführen und verwalten',
		category: 'apps',
		icon: 'tabler:brand-docker',
		readTime: '9 min',
		content: `<h2>Docker im App-Hosting</h2>
<p>Bei TitanNode können Sie Container-basierte Apps deployen. Dafür wird ein Image (eigenes oder aus einer Registry) verwendet.</p>
<h2>Eigenes Image bauen</h2>
<p>Lokal oder per CI/CD ein Image bauen und in eine Registry pushen (Docker Hub, GitHub Container Registry, etc.). Im Dashboard das Image (inkl. Tag) und ggf. Registry-Login angeben.</p>
<h2>Im Dashboard einrichten</h2>
<ol><li>App Hosting → Neue App oder bestehende App.</li><li>„Docker“ als Typ wählen.</li><li>Image-Name eintragen (z. B. <code>meinuser/meine-app:latest</code>).</li><li>Port im Container angeben, den die App nutzt.</li><li>Umgebungsvariablen setzen (siehe Artikel „Environment Variables“).</li></ol>
<h2>Startbefehl überschreiben</h2>
<p>Falls nötig können Sie den Standard-<code>CMD</code> des Images überschreiben und einen eigenen Startbefehl angeben.</p>
<h2>Persistente Daten</h2>
<p>Für Datenbanken oder Uploads: Volumes im Panel zuweisen, damit Daten nach Neustarts erhalten bleiben.</p>`
	},
	{
		title: 'Datenbank einbinden',
		description: 'PostgreSQL, MySQL oder MongoDB anbinden',
		category: 'apps',
		icon: 'tabler:database-import',
		readTime: '5 min',
		content: `<h2>Datenbank bei TitanNode</h2>
<p>Je nach Tarif können Sie eine verwaltete Datenbank hinzubuchen oder eine eigene DB in Ihrem App-Container betreiben.</p>
<h2>Verbindungsdaten aus dem Dashboard</h2>
<p>Falls Sie eine TitanNode-Datenbank nutzen: Im Dashboard finden Sie Host, Port, Benutzername, Passwort und Datenbankname. Diese Werte als Umgebungsvariablen in Ihrer App setzen (z. B. <code>DATABASE_URL</code>, <code>DB_HOST</code>).</p>
<h2>PostgreSQL / MySQL</h2>
<pre><code>// Beispiel Node.js (pg)
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });</code></pre>
<p>Für MySQL z. B. <code>mysql2</code> oder einen ORM wie Prisma nutzen.</p>
<h2>MongoDB</h2>
<p>Connection-String aus dem Dashboard (z. B. <code>MONGODB_URI</code>) in Ihrer App verwenden. Bei Replica-Sets die vom Anbieter angegebene URI nutzen.</p>
<h2>Sicherheit</h2>
<p>Datenbank nicht öffentlich exponieren. Nur aus Ihrer App oder über interne Netze verbinden. Zugangsdaten nur in Umgebungsvariablen, nie im Code.</p>`
	},
	{
		title: 'Custom Domain verbinden',
		description: 'Eigene Domain mit Ihrer App verknüpfen',
		category: 'apps',
		icon: 'tabler:world',
		readTime: '4 min',
		content: `<h2>Domain im Dashboard eintragen</h2>
<ol><li>App Hosting → Ihre App → Einstellungen / Domains.</li><li>„Domain hinzufügen“ und Ihre Domain eintragen (z. B. <code>app.meinedomain.de</code>).</li><li>Die angezeigte CNAME- oder A-Record-Zieladresse notieren.</li></ol>
<h2>DNS beim Domain-Anbieter setzen</h2>
<p>Bei Ihrem Domain-Registrar (z. B. wo die Domain gekauft ist):</p>
<ul><li><strong>CNAME:</strong> <code>app.meinedomain.de</code> → Ziel von TitanNode (z. B. <code>yourapp.titannode.com</code>).</li><li>Oder <strong>A-Record</strong> auf die angegebene IP setzen.</li></ul>
<h2>SSL (HTTPS)</h2>
<p>TitanNode stellt in der Regel automatisch ein SSL-Zertifikat (z. B. Let's Encrypt) bereit. Nach dem DNS-Update und der Verifizierung wird HTTPS aktiviert. Details siehe „SSL-Zertifikat installieren“.</p>
<h2>Propagation</h2>
<p>DNS-Änderungen können bis zu 48 Stunden dauern. Meist funktioniert die Domain nach wenigen Minuten.</p>`
	},
	{
		title: 'Environment Variables',
		description: 'Umgebungsvariablen sicher verwalten',
		category: 'apps',
		icon: 'tabler:variable',
		readTime: '3 min',
		content: `<h2>Was sind Environment Variables?</h2>
<p>Umgebungsvariablen speichern Konfiguration außerhalb des Codes: Datenbank-URLs, API-Keys, Umgebung (staging/production). So bleibt der Code sicher und portabel.</p>
<h2>Im TitanNode-Dashboard setzen</h2>
<ol><li>App Hosting → Ihre App → Einstellungen / Umgebung.</li><li>„Variable hinzufügen“: Name (z. B. <code>DATABASE_URL</code>) und Wert eintragen.</li><li>Speichern. Bei Bedarf App neu starten, damit die neuen Werte geladen werden.</li></ol>
<h2>In der App nutzen</h2>
<p>In Node.js: <code>process.env.VARIABLE_NAME</code>. In anderen Sprachen entsprechende APIs (z. B. <code>os.environ</code> in Python).</p>
<h2>Sicherheit</h2>
<p>Keine geheimen Schlüssel im Code oder in Git committen. Nur über das Dashboard oder eine sichere CI/CD-Pipeline setzen. Sensible Werte werden im Panel maskiert angezeigt.</p>`
	},
	// Billing
	{
		title: 'Zahlungsmethoden verwalten',
		description: 'Kreditkarte, PayPal und SEPA hinzufügen',
		category: 'billing',
		icon: 'tabler:credit-card',
		readTime: '3 min',
		content: `<h2>Zahlungsmethoden im Dashboard</h2>
<p>Unter „Konto“ oder „Abrechnung“ → „Zahlungsmethoden“ können Sie Ihre Zahlungsarten verwalten.</p>
<h2>Kreditkarte hinzufügen</h2>
<ol><li>„Karte hinzufügen“ wählen.</li><li>Kartennummer, Ablaufdatum und CVC eintragen. Die Zahlung wird über unseren Zahlungsdienstleister abgewickelt (PCI-konform).</li><li>Optional als Standard-Zahlungsmethode setzen.</li></ol>
<h2>PayPal</h2>
<p>„PayPal verbinden“ auswählen und den Anweisungen folgen. Nach der Autorisierung wird PayPal als Option für zukünftige Zahlungen angezeigt.</p>
<h2>SEPA-Lastschrift</h2>
<p>IBAN und Kontoinhaber angeben. Die Mandatserklärung wird beim ersten Lastschrift-Aufruf abgeschlossen. Die Abbuchung erfolgt zum angegebenen Fälligkeitsdatum.</p>
<h2>Standard ändern / entfernen</h2>
<p>Eine Zahlungsmethode als Standard markieren oder löschen (nur wenn keine offenen Rechnungen daran hängen).</p>`
	},
	{
		title: 'Rechnungen herunterladen',
		description: 'Zugriff auf alle Rechnungen und Zahlungsnachweise',
		category: 'billing',
		icon: 'tabler:receipt',
		readTime: '2 min',
		content: `<h2>Rechnungen finden</h2>
<p>Im Dashboard unter „Abrechnung“ oder „Rechnungen“ sehen Sie alle Rechnungen mit Datum, Betrag und Status.</p>
<h2>PDF herunterladen</h2>
<p>Bei jeder Rechnung gibt es einen Link oder Button „PDF herunterladen“. Die Rechnung wird als PDF-Datei gespeichert – für Ihre Buchhaltung oder Unterlagen.</p>
<h2>Zahlungsnachweise</h2>
<p>Nach erfolgreicher Zahlung können Sie bei Bedarf einen Zahlungsnachweis anfordern oder aus der E-Mail-Bestätigung verwenden.</p>
<h2>Rechnungsadresse ändern</h2>
<p>Falls Sie eine andere Rechnungsadresse brauchen: unter „Konto“ oder „Profil“ die Adresse anpassen. Künftige Rechnungen erscheinen mit der neuen Adresse.</p>`
	},
	{
		title: 'Vertrag kündigen',
		description: 'Services ordnungsgemäß kündigen',
		category: 'billing',
		icon: 'tabler:x',
		readTime: '3 min',
		content: `<h2>Kündigung im Dashboard</h2>
<ol><li>Dashboard → Abrechnung oder „Meine Services“.</li><li>Den zu kündigenden Service (VPS, Gameserver, App) auswählen.</li><li>„Kündigen“ oder „Zum Vertragsende kündigen“ wählen.</li></ol>
<h2>Kündigungsfrist</h2>
<p>Die Kündigungsfrist steht in Ihrem Vertrag (z. B. zum Monatsende oder mit 30 Tagen Vorlauf). Nach Bestätigung gilt der Service bis zum angegebenen Ende – danach wird er abgeschaltet und die Daten werden nach Ablauf der Aufbewahrungsfrist gelöscht.</p>
<h2>Daten sichern</h2>
<p>Vor Ablauf unbedingt Backups und wichtige Daten herunterladen oder migrieren. Nach der Löschung ist eine Wiederherstellung nicht mehr möglich.</p>
<h2>Fragen zur Kündigung</h2>
<p>Bei Sonderkündigung, Rücktritt oder Fragen wenden Sie sich an den Support – wir helfen gerne weiter.</p>`
	},
	// Security
	{
		title: '2-Faktor-Authentifizierung',
		description: 'Account mit 2FA zusätzlich absichern',
		category: 'security',
		icon: 'tabler:lock',
		readTime: '4 min',
		content: `<h2>Was ist 2FA?</h2>
<p>Bei der Zwei-Faktor-Authentifizierung brauchen Sie neben Ihrem Passwort einen zweiten Faktor (z. B. Code aus einer App). So ist Ihr Konto auch bei gestohlenem Passwort besser geschützt.</p>
<h2>2FA aktivieren</h2>
<ol><li>Dashboard → Konto / Sicherheit → „Zwei-Faktor-Authentifizierung“.</li><li>„Aktivieren“ wählen.</li><li>QR-Code mit einer Authenticator-App (z. B. Google Authenticator, Authy) scannen oder den Schlüssel manuell eintragen.</li><li>Den angezeigten Code eingeben und bestätigen.</li></ol>
<h2>Backup-Codes</h2>
<p>Speichern Sie die angezeigten Backup-Codes an einem sicheren Ort. Damit können Sie sich einloggen, wenn die App nicht verfügbar ist.</p>
<h2>2FA deaktivieren</h2>
<p>Unter denselben Einstellungen können Sie 2FA wieder deaktivieren – dazu ist in der Regel Ihr Passwort und ein gültiger 2FA-Code nötig.</p>`
	},
	{
		title: 'DDoS-Schutz aktivieren',
		description: 'Schutz vor DDoS-Angriffen einrichten',
		category: 'security',
		icon: 'tabler:shield-check',
		readTime: '5 min',
		content: `<h2>DDoS-Schutz bei TitanNode</h2>
<p>Viele Tarife beinhalten bereits DDoS-Schutz. Der Traffic wird in unserem Netz gefiltert, sodass Angriffe abgefangen werden und Ihre Dienste erreichbar bleiben.</p>
<h2>Prüfen ob aktiv</h2>
<p>Im Dashboard unter Ihrem Server oder unter „Sicherheit“ / „Netzwerk“ sehen Sie, ob DDoS-Schutz für Ihren Service aktiv ist.</p>
<h2>Zusätzliche Optionen</h2>
<p>Falls für Ihren Tarif erweiterte DDoS-Optionen angeboten werden (z. B. höhere Schwellen oder spezielle Filter), können Sie diese im gleichen Bereich aktivieren.</p>
<h2>Bei Angriffen</h2>
<p>Bei einem erkannten Angriff wird der Traffic automatisch gefiltert. Sie müssen nichts tun. Bei anhaltenden Problemen wenden Sie sich an den Support – wir prüfen dann die Logs und Einstellungen.</p>`
	},
	{
		title: 'SSL-Zertifikat installieren',
		description: "Let's Encrypt SSL für Ihre Domain einrichten",
		category: 'security',
		icon: 'tabler:certificate',
		readTime: '6 min',
		content: `<h2>SSL/TLS bei TitanNode</h2>
<p>Für Webseiten und Apps können Sie ein SSL-Zertifikat (HTTPS) einrichten. Oft wird Let's Encrypt automatisch angeboten – kostenlos und mit automatischer Verlängerung.</p>
<h2>Im Dashboard aktivieren</h2>
<ol><li>Bei Ihrem Webserver oder Ihrer App → Einstellungen / Domains / SSL.</li><li>„SSL-Zertifikat einrichten“ oder „Let's Encrypt“ wählen.</li><li>Domain angeben (muss bereits auf Ihren Server zeigen, siehe „Custom Domain verbinden“).</li><li>Bestätigen – das System beantragt und installiert das Zertifikat automatisch.</li></ol>
<h2>Eigenes Zertifikat</h2>
<p>Falls Sie ein eigenes Zertifikat nutzen möchten: Zertifikat und privaten Schlüssel (PEM) im Panel hochladen bzw. einfügen. Achten Sie auf die korrekte Reihenfolge bei Zertifikatsketten.</p>
<h2>Verlängerung</h2>
<p>Let's Encrypt-Zertifikate laufen 90 Tage. Bei automatischer Einrichtung erneuert TitanNode sie rechtzeitig. Bei manueller Installation müssen Sie selbst an die Verlängerung denken.</p>`
	}
];

export const articles: DocArticle[] = articlesData.map((a) => ({
	...a,
	slug: slugFromTitle(a.title)
}));

export function getArticleBySlug(slug: string): DocArticle | undefined {
	return articles.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
	return articles.map((a) => a.slug);
}
