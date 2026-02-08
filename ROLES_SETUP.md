# Rollen-System Setup

## 🎯 Übersicht

TitanNode verwendet ein hierarchisches Rollen-System mit 6 Rollen:

### Rollen-Hierarchie

1. **USER** (Kunde) - Standardrolle für alle Kunden
2. **SALES_TEAM** (5 Mitglieder) - Verkaufsteam
3. **SUPPORT_TEAM** (7 Mitglieder) - Support-Team
4. **TECHNICIAN** (2 Mitglieder) - Techniker
5. **MANAGEMENT** (2 Mitglieder) - Management
6. **FOUNDER** (3 Mitglieder) - Gründer

## 📋 Dashboard-Zugriffe

### User Dashboard (`/dashboard`)
- ✅ Alle Rollen
- Persönliche Tickets, Services, Rechnungen

### Team Dashboard (`/team`)
- ✅ SALES_TEAM, SUPPORT_TEAM, TECHNICIAN, MANAGEMENT, FOUNDER
- Alle Tickets bearbeiten
- Kunden-Übersicht
- Support PIN Login

### Admin Dashboard (`/admin`)
- ✅ MANAGEMENT, FOUNDER
- Alle Tickets, User, Rechnungen
- Rollenverwaltung
- System-Statistiken

## 🔐 Support PIN System

### Automatische Generierung
Jedes Team-Mitglied erhält automatisch einen 6-stelligen Support-PIN beim Erstellen.

### PIN-Login
Team-Mitglieder können sich mit ihrem PIN unter `/team/login` anmelden.

### PIN anzeigen
Der PIN wird im Team Dashboard in der Sidebar angezeigt.

## 🚀 Setup

### 1. Datenbank-Migration
```bash
npx prisma migrate dev --name add_roles_and_support_pin
```

### 2. Erste Admin-User erstellen

**Via Prisma Studio:**
```bash
npx prisma studio
```

Dann:
1. Öffne die `users` Tabelle
2. Wähle einen User aus
3. Setze `role` auf `FOUNDER` oder `MANAGEMENT`
4. Optional: Setze `supportPin` auf einen 6-stelligen Code (z.B. `123456`)

**Via SQL:**
```sql
-- User zu Founder machen
UPDATE users 
SET role = 'FOUNDER', "supportPin" = '123456' 
WHERE email = 'admin@titannode.com';
```

### 3. Support-PINs für Team generieren

**Automatisch für existierende User:**
```typescript
import { prisma } from '$lib/server/prisma';
import { generateSupportPin } from '$lib/server/roles';

// Für alle Team-Mitglieder ohne PIN
const teamMembers = await prisma.user.findMany({
  where: {
    role: { not: 'USER' },
    supportPin: null
  }
});

for (const user of teamMembers) {
  await prisma.user.update({
    where: { id: user.id },
    data: { supportPin: generateSupportPin() }
  });
}
```

## 📊 Rollen-Berechtigungen

### Berechtigungen-Matrix

| Feature | USER | SALES | SUPPORT | TECH | MGMT | FOUNDER |
|---------|------|-------|---------|------|------|---------|
| Eigene Tickets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Eigene Services | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Alle Tickets | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kunden-Verwaltung | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| User-Verwaltung | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Rollen-Verwaltung | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System-Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🎨 UI-Features

### Rollen-Badges
Farbcodierte Badges für jede Rolle:
- USER: Grau
- SALES_TEAM: Orange
- SUPPORT_TEAM: Grün
- TECHNICIAN: Blau
- MANAGEMENT: Lila
- FOUNDER: Rot

### Navigation
Je nach Rolle werden unterschiedliche Dashboards angeboten:
- USER → nur User Dashboard
- TEAM → User + Team Dashboard
- ADMIN → User + Team + Admin Dashboard

## 🔒 Zugriffskontrolle

### Server-Side
Alle geschützten Routen haben Middleware:
```typescript
// Admin-Bereich
export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user || !isAdmin(locals.user.role)) {
    throw redirect(302, '/dashboard');
  }
  // ...
};
```

### Funktionen
```typescript
import { hasRole, isAdmin, isTeamMember } from '$lib/server/roles';

// Prüfe spezifische Rolle
if (hasRole(user.role, 'MANAGEMENT')) {
  // Zugriff erlaubt
}

// Prüfe Admin-Status
if (isAdmin(user.role)) {
  // Ist Management oder Founder
}

// Prüfe Team-Mitgliedschaft
if (isTeamMember(user.role)) {
  // Ist nicht USER
}
```

## 📝 User erstellen mit Rolle

```typescript
import { prisma } from '$lib/server/prisma';
import { hashPassword } from '$lib/server/auth';
import { generateSupportPin } from '$lib/server/roles';

const user = await prisma.user.create({
  data: {
    email: 'support@titannode.com',
    firstName: 'Support',
    lastName: 'Team',
    password: await hashPassword('password123'),
    role: 'SUPPORT_TEAM',
    supportPin: generateSupportPin(),
    emailVerified: true
  }
});
```

## 🧪 Testing

### Test-User erstellen
```bash
# Via Prisma Studio
npx prisma studio

# Oder via Seed-Script (erstelle prisma/seed-roles.ts)
npx tsx prisma/seed-roles.ts
```

### Login testen
1. **Normal Login**: `/login` mit Email & Passwort
2. **PIN Login**: `/team/login` mit 6-stelligem PIN
3. **Auto-Redirect**: Basierend auf Rolle zum passenden Dashboard

## 🔄 Rolle ändern

### Via Admin Dashboard
`/admin/users` → User auswählen → Rolle ändern

### Via Prisma Studio
1. `npx prisma studio`
2. Tabelle `users` öffnen
3. User suchen
4. Feld `role` ändern
5. Speichern

## ⚠️ Wichtig

- Support-PINs sollten sicher aufbewahrt werden
- PINs sind 6-stellig und eindeutig
- Jeder User kann nur eine Rolle haben
- Rollen können jederzeit geändert werden
- Deaktivierte User (`isActive: false`) können sich nicht anmelden

