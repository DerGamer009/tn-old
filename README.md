# TitanNode - Entwickler-Dokumentation

Ein vollständiges Hosting-Management-System für VPS, Gameserver und App-Hosting, gebaut mit SvelteKit, Prisma und PostgreSQL.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Tech Stack](#tech-stack)
- [Voraussetzungen](#voraussetzungen)
- [Setup](#setup)
- [Projekt-Struktur](#projekt-struktur)
- [Wichtige Konzepte](#wichtige-konzepte)
- [Datenbank](#datenbank)
- [API-Integrationen](#api-integrationen)
- [Entwicklung](#entwicklung)
- [Deployment](#deployment)

## 🎯 Übersicht

TitanNode ist eine Hosting-Management-Plattform mit folgenden Hauptfunktionen:

- **VPS Hosting** - Verwaltung von Virtual Private Servern über Datalix API
- **Gameserver Hosting** - Minecraft, CS:GO, ARK Server über Pterodactyl
- **App Hosting** - Node.js, Python, Docker-Anwendungen über Pterodactyl
- **Kunden-Dashboard** - Self-Service-Portal für Kunden
- **Team-Dashboard** - Support- und Verkaufsteam-Verwaltung
- **Admin-Dashboard** - Vollständige Systemverwaltung
- **Support-System** - Ticket-System mit Chat-Funktionalität
- **Zahlungssystem** - Stripe, PayPal, Klarna Integration
- **2FA** - Zwei-Faktor-Authentifizierung mit TOTP
- **OAuth** - Google und GitHub Login

## 🛠 Tech Stack

### Frontend
- **SvelteKit 2.x** - Full-Stack Framework
- **Svelte 5** - Reaktives UI-Framework
- **TypeScript** - Type-Safety
- **Tailwind CSS 4** - Styling
- **Shadcn UI** - UI-Komponenten-Bibliothek
- **Iconify** - Icon-System

### Backend
- **SvelteKit Server Actions** - Server-Side Logic
- **Prisma** - ORM für PostgreSQL
- **PostgreSQL** - Datenbank
- **bcryptjs** - Password-Hashing
- **otplib** - 2FA/TOTP
- **nodemailer** - Email-Versand

### Externe APIs
- **Pterodactyl Panel** - Server-Management (Gameserver & App Hosting)
- **Datalix API** - VPS-Management
- **Stripe** - Zahlungsabwicklung
- **PayPal** - Zahlungsabwicklung
- **Klarna** - Zahlungsabwicklung

## 📦 Voraussetzungen

- **Node.js** 18+ (empfohlen: 20+)
- **pnpm** (oder npm/yarn)
- **PostgreSQL** 14+
- **Git**

## 🚀 Setup

### 1. Repository klonen

```bash
git clone <repository-url>
cd tn
```

### 2. Dependencies installieren

```bash
pnpm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere `ENV_TEMPLATE.txt` zu `.env` und passe die Werte an:

```bash
cp ENV_TEMPLATE.txt .env
```

Wichtige Variablen:
- `DATABASE_URL` - PostgreSQL Connection String
- `SMTP_*` - Email-Konfiguration
- `PTERODACTYL_*` - Pterodactyl API Credentials
- `DATALIX_*` - Datalix API Credentials
- `STRIPE_*` - Stripe API Keys

### 4. Datenbank einrichten

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Migrationen ausführen
npx prisma migrate dev

# Optional: Seed-Daten einfügen
npx prisma db seed
```

### 5. Entwicklungsserver starten

```bash
pnpm run dev
```

Die Anwendung läuft dann auf `http://localhost:5173`

## 📁 Projekt-Struktur

```
tn/
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   └── migrations/            # Datenbank-Migrationen
├── src/
│   ├── lib/
│   │   ├── components/        # Wiederverwendbare UI-Komponenten
│   │   │   ├── ui/           # Shadcn UI Komponenten
│   │   │   ├── dashboard-sidebar.svelte
│   │   │   └── team-sidebar.svelte
│   │   ├── server/           # Server-Side Utilities
│   │   │   ├── auth.ts       # Authentication & Sessions
│   │   │   ├── prisma.ts     # Prisma Client
│   │   │   ├── tickets.ts    # Ticket-Management
│   │   │   ├── pterodactyl.ts # Pterodactyl API Client
│   │   │   ├── datalix.ts    # Datalix API Client
│   │   │   └── app-hosting.ts # App Hosting Logic
│   │   ├── stores/           # Svelte Stores
│   │   │   └── language.ts   # i18n Store
│   │   └── constants/        # Konstanten
│   │       └── roles.ts      # Rollen-Definitionen
│   ├── routes/
│   │   ├── (auth)/           # Public Routes
│   │   │   ├── login/        # Login-Seite
│   │   │   ├── register/     # Registrierung
│   │   │   └── auth/         # OAuth Callbacks
│   │   ├── dashboard/        # Kunden-Dashboard
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   ├── settings/     # Einstellungen (2FA, Sprache)
│   │   │   ├── tickets/      # Support-Tickets
│   │   │   ├── vps/          # VPS-Verwaltung
│   │   │   ├── gameserver/   # Gameserver-Verwaltung
│   │   │   └── apps/         # App-Hosting-Verwaltung
│   │   ├── team/             # Team-Dashboard
│   │   │   ├── +layout.svelte
│   │   │   ├── tickets/      # Ticket-Verwaltung
│   │   │   └── customers/    # Kunden-Verwaltung
│   │   ├── admin/            # Admin-Dashboard
│   │   │   ├── users/        # Benutzerverwaltung
│   │   │   ├── tickets/      # Ticket-Verwaltung
│   │   │   └── nodes/        # Node-Verwaltung
│   │   └── api/              # API-Endpoints
│   │       ├── gameserver/   # Gameserver API
│   │       ├── apps/         # App Hosting API
│   │       └── livechat/    # Live-Chat API
│   └── app.html              # HTML-Template
├── static/                   # Statische Assets
├── scripts/                  # Utility-Scripts
└── *.md                      # Dokumentationen
```

## 🔑 Wichtige Konzepte

### Authentication & Authorization

#### Rollen-System
Das System verwendet ein hierarchisches Rollen-System:

1. **USER** - Standard-Kunde
2. **SALES_TEAM** - Verkaufsteam
3. **SUPPORT_TEAM** - Support-Team
4. **TECHNICIAN** - Techniker
5. **MANAGEMENT** - Management
6. **FOUNDER** - Gründer

**Zugriffsrechte:**
- `/dashboard` - Alle Rollen
- `/team` - Team-Mitglieder (SALES_TEAM+)
- `/admin` - Management & Founder

#### Support-PIN System
Jedes Team-Mitglied erhält einen 6-stelligen Support-PIN:
- Automatische Generierung bei User-Erstellung
- Login unter `/team/login` mit PIN möglich
- Impersonation von Kunden-Accounts

#### 2FA (Two-Factor Authentication)
- TOTP-basiert (Google Authenticator, etc.)
- 10 Backup-Codes pro User
- Setup-Wizard mit QR-Code
- Rate-Limiting für Login-Versuche

#### OAuth
- Google Login (`/auth/google`)
- GitHub Login (`/auth/github`)
- Automatische Account-Verknüpfung

### Session-Management

- HTTP-Only Cookies
- 30 Tage Gültigkeit
- Automatische Validierung in `hooks.server.ts`
- Impersonation-Tracking (`createdByImpersonationUserId`)

### Internationalisierung (i18n)

- Globaler `language` Store (`de` / `en`)
- Lokale `translations` Objekte in Komponenten
- `t()` Helper-Funktion für Übersetzungen

## 🗄 Datenbank

### Schema-Übersicht

**Haupt-Modelle:**
- `User` - Benutzer mit Rollen, 2FA, Credits
- `Server` - VPS, Gameserver, App-Hosting Instanzen
- `Ticket` - Support-Tickets
- `TicketMessage` - Ticket-Nachrichten
- `Order` - Bestellungen
- `Invoice` - Rechnungen
- `Node` - Gameserver-Nodes
- `ChatSession` / `ChatMessage` - Live-Chat

### Migrationen

```bash
# Neue Migration erstellen
npx prisma migrate dev --name migration_name

# Migration in Production anwenden
npx prisma migrate deploy

# Prisma Studio öffnen (GUI für DB)
npx prisma studio
```

### Indexes

Für Performance wurden folgende Indexes hinzugefügt:
- `User.role`
- `Session.userId`
- `Server.status`, `Server.userId`
- `Ticket.status`

## 🔌 API-Integrationen

### Pterodactyl Panel

**Verwendung:**
- Gameserver-Management (Minecraft, CS:GO, etc.)
- App-Hosting (Node.js, Python, Docker)

**Konfiguration:**
```env
PTERODACTYL_API_BASE=https://cp.example.com
PTERODACTYL_ADMIN_KEY=ptla_...
PTERODACTYL_USER_KEY=ptlc_...
PTERODACTYL_LOCATION_ID=2
PTERODACTYL_NEST_ID=5
```

**Egg IDs:**
- `15` - Node.js
- `16` - Python
- `17` - Velocity (Minecraft Proxy)
- `18` - Paper (Minecraft Server)
- `19` - Uptime Kuma
- `20` - Java

**Dateien:**
- `src/lib/server/pterodactyl.ts` - API Client
- `src/routes/api/gameserver/` - Gameserver-Endpoints
- `src/routes/api/apps/` - App-Hosting-Endpoints

### Datalix API

**Verwendung:**
- VPS-Management und -Erstellung

**Konfiguration:**
```env
DATALIX_API_BASE=https://backend.datalix.de/v1
DATALIX_API_KEY=your-api-key
# ODER
DATALIX_USERNAME=your-username
DATALIX_PASSWORD=your-password
```

**Dateien:**
- `src/lib/server/datalix.ts` - API Client
- `src/routes/api/vps/` - VPS-Endpoints

### Stripe

**Verwendung:**
- Zahlungsabwicklung
- Identity-Verifizierung

**Konfiguration:**
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Dateien:**
- `src/routes/api/stripe-identity/` - Identity-Verifizierung
- Zahlungslogik in `src/routes/dashboard/checkout/`

## 💻 Entwicklung

### Code-Struktur

**SvelteKit Patterns:**
- `+page.svelte` - Seiten-Komponente
- `+page.server.ts` - Server-Side Load & Actions
- `+layout.svelte` - Layout-Komponente
- `+layout.server.ts` - Layout-Server-Logic
- `+server.ts` - API-Endpoints

**Svelte 5 Syntax:**
- `$props()` - Props
- `$state()` - Reaktive State
- `$derived()` - Abgeleitete Werte
- `$effect()` - Side Effects
- `onclick` statt `on:click`

### Best Practices

1. **Server-Side Validation**
   - Alle Eingaben auf dem Server validieren
   - Nie Client-Side Validation allein verwenden

2. **Error Handling**
   - `fail()` für Form-Actions
   - `error()` für Load-Funktionen
   - User-freundliche Fehlermeldungen

3. **Performance**
   - `select` statt `include` für große Queries
   - Pagination für Listen
   - Database Indexes nutzen

4. **Security**
   - Auth-Checks in `+layout.server.ts`
   - Rate-Limiting für sensible Endpoints
   - Input-Sanitization

### Scripts

```bash
# Development Server
pnpm run dev

# Production Build
pnpm run build

# Preview Production Build
pnpm run preview

# Type Checking
pnpm run check

# Prisma Client generieren
npx prisma generate

# Datenbank-Migration
npx prisma migrate dev

# Utility Scripts
pnpm run add-vps              # VPS zu User hinzufügen
pnpm run add-existing-vps     # Existierenden VPS hinzufügen
```

## 📚 Weitere Dokumentationen

- `AUTH_SETUP.md` - Authentication Setup
- `DATABASE_SETUP.md` - Datenbank-Setup
- `ROLES_SETUP.md` - Rollen-System Setup
- `GOOGLE_AUTH_SETUP.md` - Google OAuth Setup
- `GITHUB_AUTH_SETUP.md` - GitHub OAuth Setup
- `SETUP_PAYMENTS.md` - Zahlungssystem Setup
- `VERIFICATION_SETUP.md` - Stripe Identity Setup
- `ANNOUNCEMENTS_SETUP.md` - Announcements Setup

## 🚢 Deployment

### Vercel (Empfohlen)

1. **Vercel CLI installieren:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Umgebungsvariablen** in Vercel Dashboard setzen

4. **PostgreSQL** über Vercel Postgres oder externen Provider

### Environment Variables

Alle Variablen aus `ENV_TEMPLATE.txt` müssen im Deployment gesetzt werden.

### Build-Konfiguration

- **Build Command:** `prisma generate && vite build`
- **Output Directory:** `.svelte-kit`
- **Node Version:** 20+

## 🐛 Troubleshooting

### Prisma Client nicht gefunden

```bash
npx prisma generate
```

### TypeScript-Fehler nach Schema-Änderungen

```bash
npx prisma generate
pnpm run check
```

### Datenbank-Verbindungsfehler

1. Prüfe `DATABASE_URL` in `.env`
2. Stelle sicher, dass PostgreSQL läuft
3. Prüfe Firewall-Regeln

### Pterodactyl API-Fehler

1. Prüfe API-Keys in `.env`
2. Stelle sicher, dass Pterodactyl Panel erreichbar ist
3. Prüfe Logs für detaillierte Fehlermeldungen

## 📝 Beitragen

1. Feature-Branch erstellen
2. Änderungen committen
3. Pull Request erstellen
4. Code-Review abwarten

## 📄 Lizenz

Siehe `LICENSE` Datei.

## 🤝 Support

Bei Fragen oder Problemen:
- Erstelle ein Issue im Repository
- Kontaktiere das Entwicklungsteam

---

**Letzte Aktualisierung:** Januar 2026
