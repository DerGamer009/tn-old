# Scripts

## add-vps-to-user.ts

Script zum Hinzufügen eines neuen VPS-Servers von Datalix zu einem User.

### Voraussetzungen

1. **Prisma Client neu generieren** (falls der Dev-Server läuft, diesen zuerst stoppen):
   ```bash
   npx prisma generate
   ```

2. **Environment-Variablen** in `.env` setzen:
   ```
   DATALIX_API_KEY="dein-api-key"
   DATABASE_URL="postgresql://..."
   ```

### Verwendung

**Standard (mit vordefiniertem User):**
```bash
pnpm add-vps
# oder
npx tsx scripts/add-vps-to-user.ts
```

**Mit benutzerdefiniertem User:**
```bash
USER_ID=cmk78xm8m0000ipa80c1i4mkt pnpm add-vps
```

**Mit vollständiger Konfiguration:**
```bash
USER_ID=cmk78xm8m0000ipa80c1i4mkt \
VPS_NAME="Mein-VPS" \
VPS_CPU=4 \
VPS_RAM=8 \
VPS_STORAGE=100 \
VPS_BANDWIDTH=2 \
VPS_PRICE=9.99 \
pnpm add-vps
```

### Standard-Konfiguration

- **Name:** VPS-1
- **CPU:** 2 vCores
- **RAM:** 4 GB
- **Storage:** 50 GB
- **Bandwidth:** 1 Gbit/s
- **Preis:** €4.99/Monat

### Was macht das Script?

1. Prüft, ob der User existiert
2. Erstellt einen VPS über die Datalix API
3. Speichert den VPS in der Datenbank
4. Verknüpft den VPS mit dem User
5. Zeigt alle Details an

---

## add-existing-vps-to-user.ts

Script zum Hinzufügen eines **bestehenden** VPS-Servers von Datalix zu einem User.
Ruft alle Informationen (RAM, Disk, CPU, Bandwidth, Laufzeit) von der Datalix API ab.

### Voraussetzungen

1. **Prisma Client neu generieren** (falls der Dev-Server läuft, diesen zuerst stoppen):
   ```bash
   npx prisma generate
   ```

2. **Environment-Variablen** in `.env` setzen:
   ```
   DATALIX_API_KEY="dein-api-key"
   DATABASE_URL="postgresql://..."
   ```

### Verwendung

**Standard (mit vordefinierten Werten):**
```bash
pnpm add-existing-vps
# oder
npx tsx scripts/add-existing-vps-to-user.ts
```

**Mit benutzerdefinierten Werten:**
```bash
DATALIX_SERVICE_ID=6a954ecb-8ceb-4374-8e34-7863af015c70 \
USER_ID=cmk78xm8m0000ipa80c1i4mkt \
pnpm add-existing-vps
```

**Mit benutzerdefiniertem Namen:**
```bash
DATALIX_SERVICE_ID=6a954ecb-8ceb-4374-8e34-7863af015c70 \
USER_ID=cmk78xm8m0000ipa80c1i4mkt \
VPS_NAME="Mein-VPS" \
pnpm add-existing-vps
```

**Bestehenden VPS überschreiben:**
```bash
DATALIX_SERVICE_ID=6a954ecb-8ceb-4374-8e34-7863af015c70 \
USER_ID=cmk78xm8m0000ipa80c1i4mkt \
OVERWRITE=true \
pnpm add-existing-vps
```

### Was macht das Script?

1. Prüft, ob der User existiert
2. Ruft VPS-Daten (RAM, Disk, CPU, Bandwidth, Laufzeit) von der Datalix API ab
3. Berechnet den monatlichen Preis basierend auf den Specs
4. Speichert den VPS in der Datenbank
5. Verknüpft den VPS mit dem User
6. Setzt die Laufzeit (expiresAt) falls verfügbar
7. Zeigt alle Details an

### Standard-Werte

- **Service ID:** `6a954ecb-8ceb-4374-8e34-7863af015c70`
- **User ID:** `cmk78xm8m0000ipa80c1i4mkt`

