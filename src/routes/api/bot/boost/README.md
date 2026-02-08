# TitanNode Bot API: Boost-Gutschrift

Endpoint für den TitanNode-Bot, um Discord-Boosts als Laufzeit auf Gameservern oder App-Hosting-Servern zu gutschreiben.

**Regel:** 1 Boost = +1 Monat Laufzeit.

---

## Endpoint

```
POST /api/bot/boost
```

---

## Authentifizierung

Header:

```
Authorization: Bearer <TITANNODE_BOT_API_KEY>
```

Der API-Key wird in der Umgebung gesetzt:

- **Env-Variable:** `TITANNODE_BOT_API_KEY`
- Ohne gültigen Key antwortet die API mit `401 Unauthorized`.

### API-Key erzeugen

Einen sicheren Key generieren:

```bash
npx tsx scripts/generate-bot-api-key.ts
```

Die Ausgabe enthält eine Zeile für die `.env`:

```
TITANNODE_BOT_API_KEY=<generierter Key>
```

Key in `.env` eintragen und Server/Bot neu starten. Den Key sicher aufbewahren und nicht ins Repository committen.

---

## Request

**Content-Type:** `application/json`

**Body:**

| Feld            | Typ    | Pflicht | Beschreibung |
|-----------------|--------|--------|--------------|
| `discordUserId` | string | ja     | Discord User ID des Users, der geboostet hat. Der TitanNode-Account muss diese ID unter `discordUserId` haben. |
| `boosts`        | number | ja     | Anzahl Monate (z. B. 1 Boost = 1). Muss ≥ 1 sein. |
| `serverId`      | string | nein   | ID des Servers, der verlängert werden soll (Gameserver oder App-Hosting). Wenn nicht gesetzt, wird der Server mit dem **frühesten** Ablaufdatum gewählt. |

**Beispiel:**

```json
{
  "discordUserId": "123456789012345678",
  "boosts": 2
}
```

Mit festem Server:

```json
{
  "discordUserId": "123456789012345678",
  "boosts": 1,
  "serverId": "cmkzpokqx0009al56gthzk9l9"
}
```

---

## Response

### Erfolg (200)

```json
{
  "success": true,
  "months": 2,
  "serverId": "cmkzpokqx0009al56gthzk9l9",
  "serverName": "Mein Minecraft",
  "serverType": "GAMESERVER",
  "expiresAt": "2025-03-27T12:00:00.000Z"
}
```

### Fehler

| Status | Bedeutung |
|--------|-----------|
| **400** | Ungültiger Request (z. B. fehlendes `discordUserId`, ungültiges `boosts`). |
| **401** | Fehlender oder ungültiger `Authorization`-Header. |
| **404** | Kein TitanNode-User mit dieser Discord-ID **oder** kein passender Server (User hat keinen Gameserver/App-Hosting oder `serverId` gehört nicht dem User). |
| **500** | Interner Fehler. |

Fehler-Body (Beispiel):

```json
{
  "success": false,
  "error": "Kein TitanNode-Account mit dieser Discord-ID verknüpft"
}
```

---

## Voraussetzungen

1. **Env:** `TITANNODE_BOT_API_KEY` gesetzt.
2. **User-Verknüpfung:** Der TitanNode-User hat im System eine **Discord User ID** (`discordUserId`). Diese muss (z. B. im Admin oder per „Discord verknüpfen“) gesetzt sein, damit der Bot den User anhand der Discord-ID findet.
3. **Server:** Der User besitzt mindestens einen **Gameserver** oder **App-Hosting**-Server (mit Laufzeit/Feld `expiresAt`).

---

## Ablauf

1. Bot sendet `POST /api/bot/boost` mit `Authorization: Bearer <key>` und JSON-Body.
2. API prüft Key und Body.
3. User wird über `discordUserId` gesucht.
4. Ziel-Server: entweder `serverId` (falls angegeben und dem User zugehörig) oder der Server mit dem frühesten `expiresAt`.
5. Auf diesem Server wird die Laufzeit um `boosts` Monate erhöht (ohne Credits/Rechnung).
6. Antwort enthält die neuen Daten (u. a. `expiresAt`).
