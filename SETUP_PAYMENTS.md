# Zahlungsmethoden Setup - PayPal & Klarna

Diese Anleitung beschreibt, wie du die Zahlungsmethoden PayPal und Klarna für das Guthaben-Aufladen einrichtest.

## Übersicht

Das System unterstützt derzeit zwei Zahlungsmethoden:
- **PayPal**: Direkte PayPal-Zahlungen über die PayPal Checkout API
- **Klarna**: Kreditkartenzahlungen über die Klarna Payments API

## PayPal Setup

### 1. PayPal Developer Account erstellen

1. Gehe zu [https://developer.paypal.com](https://developer.paypal.com)
2. Erstelle einen Developer Account oder logge dich ein
3. Navigiere zu **Dashboard** → **Apps & Credentials**

### 2. App erstellen

1. Klicke auf **Create App**
2. Wähle **Merchant** als App-Typ
3. Gib einen App-Namen ein (z.B. "TitanNode Credits")
4. Wähle **Sandbox** für Tests oder **Live** für Produktion

### 3. Credentials erhalten

Nach der Erstellung der App erhältst du:
- **Client ID**
- **Client Secret**

Diese werden für die Authentifizierung bei der PayPal API benötigt.

### 4. Umgebungsvariablen setzen

Füge folgende Variablen zu deiner `.env` Datei hinzu:

```env
PAYPAL_CLIENT_ID="deine-paypal-client-id"
PAYPAL_CLIENT_SECRET="dein-paypal-client-secret"
PAYPAL_MODE="sandbox"  # "sandbox" für Tests, "live" für Produktion
PUBLIC_APP_URL="https://deine-domain.com"  # Öffentliche URL deiner App
```

### 5. PayPal Sandbox Test Accounts

Für Tests kannst du Test-Accounts im PayPal Developer Dashboard erstellen:
- Gehe zu **Accounts** → **Sandbox Accounts**
- Erstelle einen **Personal** und einen **Business** Test-Account
- Diese Accounts können für Testzahlungen verwendet werden

### 6. Return URLs konfigurieren

Die folgenden URLs müssen in deiner PayPal App konfiguriert sein:
- **Return URL**: `https://deine-domain.com/dashboard/credits/checkout/success`
- **Cancel URL**: `https://deine-domain.com/dashboard/credits/checkout/cancel`

## Klarna Setup

### 1. Klarna Merchant Account erstellen

1. Gehe zu [https://www.klarna.com/merchants](https://www.klarna.com/merchants)
2. Registriere dich für einen Merchant Account
3. Durchlaufe den Onboarding-Prozess

### 2. API Credentials erhalten

Nach der Registrierung erhältst du:
- **API Username** (oder **Merchant ID**)
- **API Password** (oder **Shared Secret**)

Diese werden für die Authentifizierung bei der Klarna API benötigt.

### 3. Umgebungsvariablen setzen

Füge folgende Variablen zu deiner `.env` Datei hinzu:

```env
KLARNA_USERNAME="dein-klarna-username"
KLARNA_PASSWORD="dein-klarna-password"
KLARNA_MODE="test"  # "test" für Tests, "live" für Produktion
```

### 4. Klarna Playground (Test-Umgebung)

Für Tests kannst du die Klarna Playground API verwenden:
- Base URL: `https://api.playground.klarna.com`
- Test-Credentials erhältst du im Klarna Merchant Portal

### 5. Webhook URLs (optional)

Falls du Webhooks für Zahlungsupdates einrichten möchtest:
- Gehe zu deinem Klarna Merchant Portal
- Konfiguriere Webhook-URLs für verschiedene Events
- Beispiel: `https://deine-domain.com/api/klarna/webhook`

## Funktionen

### PayPal Zahlungsfluss

1. **Order erstellen**: Beim Klick auf "Mit PayPal bezahlen" wird eine PayPal Order erstellt
2. **Weiterleitung**: Der Nutzer wird zu PayPal weitergeleitet
3. **Zahlung**: Der Nutzer zahlt auf PayPal
4. **Rückkehr**: Nach erfolgreicher Zahlung kehrt der Nutzer zur Success-Seite zurück
5. **Capture**: Das System captured automatisch die Zahlung
6. **Gutschrift**: Das Guthaben wird dem Account gutgeschrieben

### Klarna Zahlungsfluss

1. **Session erstellen**: Beim Klick auf "Zahlung starten" wird eine Klarna Session erstellt
2. **Widget laden**: Das Klarna Widget wird auf der Seite eingebettet
3. **Zahlung**: Der Nutzer gibt seine Kreditkartendaten im Klarna Widget ein
4. **Verarbeitung**: Klarna verarbeitet die Zahlung
5. **Webhook**: (Optional) Ein Webhook informiert über den Zahlungsstatus
6. **Gutschrift**: Das Guthaben wird dem Account gutgeschrieben

## Testen

### PayPal Sandbox Test

1. Setze `PAYPAL_MODE="sandbox"` in der `.env`
2. Verwende Test-Accounts aus dem PayPal Developer Dashboard
3. Teste eine Zahlung auf `/dashboard/credits`
4. Überprüfe, ob die Zahlung erfolgreich erfasst wird

### Klarna Playground Test

1. Setze `KLARNA_MODE="test"` in der `.env`
2. Verwende Test-Credentials aus dem Klarna Merchant Portal
3. Teste eine Zahlung auf `/dashboard/credits`
4. Überprüfe, ob die Zahlung erfolgreich erfasst wird

## Produktion

### Vor dem Go-Live

- [ ] PayPal App auf **Live** umstellen
- [ ] `PAYPAL_MODE="live"` setzen
- [ ] Klarna Account auf **Live** umstellen
- [ ] `KLARNA_MODE="live"` setzen
- [ ] Alle Return-URLs auf Produktions-Domain aktualisieren
- [ ] Webhooks auf Produktions-URLs konfigurieren (falls verwendet)
- [ ] Zahlungsflüsse ausgiebig testen

### Sicherheit

- **Niemals** Credentials in den Code committen
- Verwende immer Umgebungsvariablen
- Aktiviere HTTPS für alle Zahlungsseiten
- Implementiere Rate Limiting für Zahlungsanfragen
- Logge alle Zahlungstransaktionen für die Nachverfolgung

## Troubleshooting

### PayPal Fehler

**"Failed to get PayPal access token"**
- Überprüfe `PAYPAL_CLIENT_ID` und `PAYPAL_CLIENT_SECRET`
- Stelle sicher, dass die App aktiv ist
- Überprüfe, ob du dich im richtigen Modus befindest (sandbox/live)

**"PayPal approval URL not found"**
- Überprüfe die PayPal API Antwort
- Stelle sicher, dass die Order erfolgreich erstellt wurde

### Klarna Fehler

**"Failed to create Klarna session"**
- Überprüfe `KLARNA_USERNAME` und `KLARNA_PASSWORD`
- Stelle sicher, dass du dich im richtigen Modus befindest (test/live)
- Überprüfe die Klarna API Antwort für detaillierte Fehlermeldungen

**"Klarna Widget lädt nicht"**
- Überprüfe, ob das Klarna Script korrekt geladen wird
- Stelle sicher, dass `klarnaClientToken` vorhanden ist
- Überprüfe die Browser-Konsole auf JavaScript-Fehler

## API Dokumentation

- **PayPal**: [https://developer.paypal.com/docs/api/overview/](https://developer.paypal.com/docs/api/overview/)
- **Klarna**: [https://developers.klarna.com/](https://developers.klarna.com/)

## Support

Bei Problemen oder Fragen:
1. Überprüfe die Logs in der Konsole
2. Konsultiere die offizielle API-Dokumentation
3. Kontaktiere den PayPal/Klarna Support

