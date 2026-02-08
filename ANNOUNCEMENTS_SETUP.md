# Announcements Setup

## 🗄️ Datenbank-Migration

Nach dem Stoppen des Dev-Servers, führe die Migration aus:

```bash
npx prisma migrate dev --name add_announcements
```

## 🌱 Test-Daten einfügen (Optional)

Um Test-Announcements zu erstellen:

```bash
npx tsx prisma/seed.ts
```

## 📝 Announcements verwalten

### Via API (POST Request)

Neues Announcement erstellen:

```bash
curl -X POST http://localhost:5173/api/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Neue Ankündigung",
    "description": "Dies ist eine wichtige Nachricht für alle User.",
    "icon": "📢"
  }'
```

### Via Prisma Studio

```bash
npx prisma studio
```

Dann unter "Announcement" neue Einträge erstellen.

### Via Code

```typescript
import { createAnnouncement } from '$lib/server/announcements';

await createAnnouncement({
	title: 'Server Update',
	description: 'We will perform a server update tonight.',
	icon: '🔧'
});
```

## 📊 Announcement-Felder

- **title**: Überschrift (erforderlich)
- **description**: Beschreibung/Text (erforderlich)
- **icon**: Emoji oder Icon (optional, Standard: 📢)
- **isPublished**: Sichtbar für User (Standard: true)
- **createdAt**: Automatisch beim Erstellen
- **updatedAt**: Automatisch bei Änderung

## 🎯 Dashboard-Anzeige

Announcements werden automatisch im Dashboard angezeigt:
- Letzte 5 Announcements
- Sortiert nach Datum (neueste zuerst)
- Nur `isPublished: true` werden angezeigt
- Mit Icon, Titel, Beschreibung und Datum

## 🔐 Admin-Bereich (TODO)

Später kann ein Admin-Panel erstellt werden mit:
- Announcements erstellen
- Announcements bearbeiten
- Announcements löschen
- Announcements veröffentlichen/verstecken

