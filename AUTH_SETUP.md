# Authentication Setup - TitanNode

## ✅ Was wurde implementiert?

### 1. **Vollständiges Auth-System**
- ✅ Benutzer-Registrierung mit Validierung
- ✅ Login mit E-Mail & Passwort
- ✅ Sicheres Password-Hashing (bcrypt)
- ✅ Session-Management mit Cookies
- ✅ Automatische Session-Validierung
- ✅ Logout-Funktionalität
- ✅ Protected Routes (Dashboard)

### 2. **Datenbank-Integration**
- ✅ Prisma Schema mit User & Session Modellen
- ✅ PostgreSQL-Anbindung
- ✅ Server-Side Actions für Register/Login

### 3. **Security Features**
- ✅ Password-Hashing mit bcrypt (10 Rounds)
- ✅ HTTP-Only Cookies
- ✅ Session-Ablauf (30 Tage)
- ✅ CSRF-Protection durch SvelteKit
- ✅ Server-Side Validierung

## 🚀 Setup-Schritte

### 1. .env-Datei erstellen

Erstelle eine `.env`-Datei im Projekt-Root:

```env
DATABASE_URL="postgres://ddc5e897686f07b083cf9622927758a9744b6cb88a13f9d2316311386455c20b:sk_wYUGtKLjbzHBEr9b0AyPE@db.prisma.io:5432/postgres?sslmode=require"
```

### 2. Datenbank-Migration ausführen

```bash
npx prisma migrate dev --name init
```

### 3. Dev-Server starten

```bash
pnpm dev
```

### 4. Testen!

1. **Registrierung**: http://localhost:5173/register
2. **Login**: http://localhost:5173/login
3. **Dashboard**: http://localhost:5173/dashboard (protected)

## 📁 Projekt-Struktur

```
src/
├── lib/
│   └── server/
│       ├── auth.ts           # Auth-Utilities (hash, verify, sessions)
│       └── prisma.ts         # Prisma Client
├── routes/
│   ├── register/
│   │   ├── +page.svelte      # Registrierungs-Formular
│   │   └── +page.server.ts   # Register-Action
│   ├── login/
│   │   ├── +page.svelte      # Login-Formular
│   │   └── +page.server.ts   # Login-Action
│   ├── dashboard/
│   │   ├── +page.svelte      # Dashboard (protected)
│   │   └── +page.server.ts   # Auth-Check
│   └── logout/
│       └── +server.ts        # Logout-Handler
├── hooks.server.ts           # Session-Validierung
└── app.d.ts                  # TypeScript-Typen

prisma/
└── schema.prisma             # Datenbank-Schema
```

## 🔐 Wie funktioniert das Auth-System?

### Registrierung
1. User füllt Formular aus
2. Server validiert Daten
3. Passwort wird gehasht (bcrypt)
4. User wird in DB gespeichert
5. Session wird erstellt
6. Cookie wird gesetzt
7. Redirect zu `/dashboard`

### Login
1. User gibt E-Mail & Passwort ein
2. Server findet User in DB
3. Passwort wird verifiziert
4. Session wird erstellt
5. Cookie wird gesetzt
6. Redirect zu `/dashboard`

### Session-Management
- Sessions werden in der DB gespeichert
- Jeder Request wird in `hooks.server.ts` validiert
- Abgelaufene Sessions werden automatisch gelöscht
- User-Daten werden in `event.locals.user` gespeichert

### Protected Routes
```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  return { user: locals.user };
};
```

## 🛠️ API-Verwendung

### Auth-Utilities verwenden

```typescript
import {
  createUser,
  authenticateUser,
  createSession,
  validateSession,
  deleteSession
} from '$lib/server/auth';

// User erstellen
const user = await createUser({
  email: 'test@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  password: 'securePassword123'
});

// User authentifizieren
const authUser = await authenticateUser('test@example.com', 'securePassword123');

// Session erstellen
const sessionToken = await createSession(user.id);

// Session validieren
const session = await validateSession(sessionToken);

// Session löschen (Logout)
await deleteSession(sessionToken);
```

### Prisma verwenden

```typescript
import { prisma } from '$lib/server/prisma';

// Alle User abrufen
const users = await prisma.user.findMany();

// User nach E-Mail finden
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});

// User mit Servern laden
const userWithServers = await prisma.user.findUnique({
  where: { id: userId },
  include: { servers: true }
});
```

## 🧪 Testing

### Manuell testen

1. **Registrierung testen**:
   - Gehe zu `/register`
   - Fülle das Formular aus
   - Prüfe ob Redirect zu `/dashboard` erfolgt

2. **Login testen**:
   - Gehe zu `/login`
   - Logge dich mit erstelltem Account ein
   - Prüfe Dashboard-Zugriff

3. **Protected Routes testen**:
   - Gehe zu `/dashboard` ohne eingeloggt zu sein
   - Sollte zu `/login` redirecten

4. **Logout testen**:
   - Klicke auf "Logout" im Dashboard
   - Sollte zu `/` redirecten
   - Dashboard sollte nicht mehr zugänglich sein

### Datenbank prüfen

```bash
# Prisma Studio öffnen
npx prisma studio

# User in DB prüfen
# Sessions in DB prüfen
```

## 🔒 Security Best Practices

✅ **Implementiert**:
- Password-Hashing mit bcrypt
- HTTP-Only Cookies (kein JavaScript-Zugriff)
- SameSite Cookie-Policy
- Secure Cookies in Production
- Session-Ablauf
- Server-Side Validierung

⚠️ **Optional erweitern**:
- [ ] E-Mail-Verifizierung
- [ ] Two-Factor Authentication (2FA)
- [ ] Password-Reset via E-Mail
- [ ] Rate-Limiting für Login-Versuche
- [ ] Account-Lockout bei zu vielen Fehlversuchen
- [ ] OAuth (Google, GitHub) vollständig implementieren

## 📝 Nächste Schritte

1. ✅ .env-Datei erstellen
2. ✅ Migration ausführen
3. ✅ Server starten
4. ✅ Registrieren & Testen
5. 🔜 E-Mail-Verifizierung hinzufügen (optional)
6. 🔜 Password-Reset implementieren (optional)
7. 🔜 OAuth vollständig einrichten (optional)

## 🐛 Troubleshooting

### Fehler: "Can't reach database server"
- Prüfe ob `.env`-Datei existiert
- Prüfe ob DATABASE_URL korrekt ist

### Fehler: "User already exists"
- E-Mail bereits registriert
- Verwende andere E-Mail oder lösche User aus DB

### Session bleibt nicht bestehen
- Prüfe Browser-Cookie-Einstellungen
- Prüfe ob `hooks.server.ts` korrekt ist

### Redirect-Loop
- Prüfe `+page.server.ts` load-Funktionen
- Prüfe Session-Validierung in `hooks.server.ts`

