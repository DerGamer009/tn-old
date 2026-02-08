# Email & Identity Verification Setup

## 🎯 Übersicht

Das Verifizierungssystem besteht aus zwei Schritten:
1. **Email-Verifizierung**: User erhält Link per Email zur Bestätigung
2. **Ausweiskontrolle**: Verifizierung via Stripe Identity

## 📋 Voraussetzungen

### 1. Dependencies installiert ✅
```bash
pnpm add nodemailer stripe
pnpm add -D @types/nodemailer tsx
```

### 2. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/titannode"

# Email Configuration
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="your-email@ethereal.email"
SMTP_PASS="your-password"
SMTP_FROM="TitanNode <noreply@titannode.com>"

# Public URL
PUBLIC_BASE_URL="http://localhost:5173"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Email-Setup (Entwicklung)

Für Entwicklung empfehlen wir [Ethereal Email](https://ethereal.email/):
1. Gehe zu https://ethereal.email/create
2. Erstelle einen Test-Account
3. Kopiere die SMTP-Credentials in deine `.env`
4. Emails werden abgefangen und können im Ethereal-Inbox angesehen werden

#### Email-Setup (Produktion)

Für Produktion nutze einen echten SMTP-Service:
- **Resend**: https://resend.com (empfohlen, modern)
- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://mailgun.com
- **Amazon SES**: https://aws.amazon.com/ses/

#### Stripe Identity Setup

1. **Stripe Account erstellen**: https://dashboard.stripe.com/register
2. **Test-Modus aktivieren** (oben links Toggle)
3. **API Keys kopieren**:
   - Gehe zu: Developers → API keys
   - Kopiere "Secret key" (sk_test_...) → `STRIPE_SECRET_KEY`
   - Kopiere "Publishable key" (pk_test_...) → `STRIPE_PUBLISHABLE_KEY`
4. **Stripe Identity aktivieren**:
   - Gehe zu: Products → Identity
   - Klicke auf "Activate Identity"
5. **Webhook erstellen**:
   - Gehe zu: Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/stripe-identity/webhook`
   - Events auswählen:
     - `identity.verification_session.verified`
     - `identity.verification_session.requires_input`
   - Webhook Secret kopieren → `STRIPE_WEBHOOK_SECRET`

### 3. Datenbank-Migration

```bash
npx prisma migrate dev --name add_verification
```

## 🚀 Funktionsweise

### 1. Registrierung

Wenn sich ein User registriert:
1. Account wird mit `emailVerified: false` erstellt
2. Verification-Token wird generiert
3. Email mit Bestätigungslink wird gesendet
4. User wird zu `/register/success` weitergeleitet

### 2. Email-Verifizierung

User klickt auf Link in Email:
1. Route: `/verify-email?token=...`
2. Token wird validiert (24h gültig)
3. `emailVerified: true` wird gesetzt
4. Email mit Info zur Ausweiskontrolle wird gesendet
5. Weiterleitung zum Dashboard

### 3. Ausweiskontrolle (Stripe Identity)

Im Dashboard (wenn Email verifiziert):
1. User klickt auf "Starten" Button
2. POST Request zu `/api/stripe-identity/create-session`
3. Stripe Identity Session wird erstellt
4. User wird zu Stripe Identity weitergeleitet
5. User lädt Ausweis hoch + Selfie
6. Stripe prüft Dokumente
7. Webhook zu `/api/stripe-identity/webhook`
8. `identityVerified: true` wird gesetzt

## 📝 API-Routen

### Email Verification

**POST** `/api/verify-email`
```json
{
  "token": "verification-token-hier"
}
```

Response:
```json
{
  "success": true
}
```

### Stripe Identity - Session erstellen

**POST** `/api/stripe-identity/create-session`

Erfordert: Authentifizierung + Email verifiziert

Response:
```json
{
  "success": true,
  "sessionId": "vs_...",
  "clientSecret": "vs_...",
  "url": "https://verify.stripe.com/..."
}
```

### Stripe Identity - Webhook

**POST** `/api/stripe-identity/webhook`

Wird von Stripe aufgerufen, wenn Verifizierung abgeschlossen ist.

## 🎨 Dashboard-Features

### Verification Banner

Wenn User nicht vollständig verifiziert:
- ⚠️ Gelber Banner oben im Dashboard
- Zeigt Status beider Schritte
- Email-Schritt: "Ausstehend" oder "Abgeschlossen ✓"
- Identity-Schritt: "Starten"-Button oder "Gesperrt" (wenn Email nicht verifiziert)

### Nach vollständiger Verifizierung

- Banner verschwindet automatisch
- Alle Funktionen freigeschaltet
- User kann Services buchen

## 🧪 Testing

### 1. Registrierung testen

```bash
# Dev-Server starten
pnpm dev

# Registriere einen neuen User
# → Gehe zu http://localhost:5173/register
# → Fülle Formular aus
# → Du wirst zu /register/success weitergeleitet
```

### 2. Email prüfen (Ethereal)

```bash
# Terminal-Output zeigt:
# ✅ Verification email sent: ...
# 📧 Preview URL: https://ethereal.email/message/...

# Öffne die Preview URL im Browser
# Klicke auf "Email bestätigen" Button
```

### 3. Identity Verification testen

Stripe Test-Dokumente verwenden:
- **Test-Ausweis**: Lade ein beliebiges Bild hoch
- **Test-Selfie**: Nutze Webcam oder Bild
- Im Test-Modus werden alle Dokumente akzeptiert

## 🔒 Sicherheit

### Login-Sperre

Du kannst optional Login blockieren, bis Email verifiziert ist:

```typescript
// src/routes/login/+page.server.ts
const user = await authenticateUser(email, password);

if (!user.emailVerified) {
  return fail(403, {
    error: 'Bitte bestätige zuerst deine Email-Adresse'
  });
}
```

### Service-Buchung blockieren

Services nur für vollständig verifizierte User:

```typescript
// src/routes/dashboard/vps/order/+page.server.ts
if (!locals.user.emailVerified || !locals.user.identityVerified) {
  throw redirect(302, '/dashboard?verify=required');
}
```

## 📚 Weitere Ressourcen

- **Stripe Identity Docs**: https://stripe.com/docs/identity
- **Nodemailer Docs**: https://nodemailer.com/
- **Prisma Migrations**: https://pris.ly/d/migrate

## 🐛 Troubleshooting

### Email wird nicht gesendet

1. Prüfe SMTP-Credentials in `.env`
2. Prüfe Terminal für Fehler
3. Bei Ethereal: Öffne Preview URL aus Terminal

### Stripe Identity funktioniert nicht

1. Prüfe Stripe API Keys
2. Stelle sicher, dass Identity aktiviert ist
3. Test-Modus muss aktiviert sein
4. Webhook-URL muss öffentlich erreichbar sein (für Produktion)

### Webhook wird nicht empfangen

Für lokale Entwicklung:
```bash
# Stripe CLI installieren
stripe listen --forward-to http://localhost:5173/api/stripe-identity/webhook

# Webhook Secret aus Output kopieren
# → In .env als STRIPE_WEBHOOK_SECRET eintragen
```

## ✅ Checklist

- [ ] Dependencies installiert
- [ ] `.env` konfiguriert (SMTP + Stripe)
- [ ] Ethereal Email Account erstellt
- [ ] Stripe Account erstellt + Test-Modus
- [ ] Stripe Identity aktiviert
- [ ] Datenbank-Migration durchgeführt
- [ ] Dev-Server gestartet
- [ ] Registrierung getestet
- [ ] Email-Verifizierung getestet
- [ ] Identity-Verifizierung getestet

