# Datenbank Setup für TitanNode

## 1. .env-Datei erstellen

Erstelle eine `.env`-Datei im Projekt-Root mit folgendem Inhalt:

```env
DATABASE_URL="postgres://ddc5e897686f07b083cf9622927758a9744b6cb88a13f9d2316311386455c20b:sk_wYUGtKLjbzHBEr9b0AyPE@db.prisma.io:5432/postgres?sslmode=require"
```

## 2. Prisma Migration erstellen und ausführen

```bash
# Migration erstellen
npx prisma migrate dev --name init

# Bei Bedarf: Datenbank zurücksetzen
npx prisma migrate reset

# Prisma Studio öffnen (Datenbank-Browser)
npx prisma studio
```

## 3. Prisma in SvelteKit verwenden

```typescript
// Beispiel: src/routes/api/users/+server.ts
import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const users = await prisma.user.findMany();
  return json(users);
};
```

## Datenbank-Modelle

Die TitanNode-Datenbank enthält folgende Hauptmodelle:

- **User**: Benutzer-Accounts
- **Account**: OAuth-Accounts (Google, GitHub)
- **Session**: Benutzer-Sessions
- **Server**: VPS, Gameserver, App Hosting
- **Order**: Bestellungen
- **Invoice**: Rechnungen
- **Ticket**: Support-Tickets
- **TicketMessage**: Ticket-Nachrichten

## Nützliche Prisma-Befehle

```bash
# Schema formatieren
npx prisma format

# Datenbank-Schema anzeigen
npx prisma db pull

# Prisma Client neu generieren
npx prisma generate

# Prisma Studio (GUI für Datenbank)
npx prisma studio
```

