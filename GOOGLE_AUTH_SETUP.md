## Google OAuth Setup für TitanNode

Dieses Projekt hat bereits die Grundintegration für Google Login vorbereitet:

- Route zum Starten des Flows: `GET /auth/google`
- Callback‑Route nach erfolgreichem Login bei Google: `GET /auth/google/callback`
- Frontend‑Buttons auf:
  - `src/routes/login/+page.svelte` (Login mit Google)
  - `src/routes/register/+page.svelte` (Registrieren mit Google)

Damit das funktioniert, musst du nur noch ein Google‑OAuth‑Projekt anlegen und die `.env` richtig setzen.

---

### 1. Google Cloud Projekt & OAuth Client anlegen

1. Gehe in die Google Cloud Console (`https://console.cloud.google.com`).
2. Erstelle (oder wähle) ein Projekt.
3. Navigiere zu **APIs & Dienste → OAuth-Zustimmungsbildschirm**:
   - Typ: „Extern“ (typisch für Web‑Apps).
   - App‑Name: z.B. `TitanNode Dashboard`.
   - Unterstützte E‑Mail, Logo (optional) usw. ausfüllen.
   - Unter „Scopes“ mindestens `openid`, `email`, `profile` erlauben (Standard‑Scopes reichen in der Regel).
4. Gehe zu **APIs & Dienste → Anmeldedaten → Anmeldedaten erstellen → OAuth-Client-ID**:
   - Anwendungstyp: **Webanwendung**.
   - Name: z.B. `TitanNode Web Client`.
   - **Autorisierte Weiterleitungs‑URIs** hinzufügen:
     - Lokal: `http://localhost:5173/auth/google/callback`
     - Produktion: `https://deine-domain.tld/auth/google/callback`
   - Erstelle den Client und notiere dir:
     - `Client-ID`
     - `Client-Schlüssel` (Client Secret)

---

### 2. `.env` / Umgebungsvariablen setzen

Im Projekt‑Root (neben `AUTH_SETUP.md`) brauchst du folgende Variablen in deiner `.env`:

```env
GOOGLE_CLIENT_ID=deine-google-client-id
GOOGLE_CLIENT_SECRET=dein-google-client-secret

# Optional, sonst wird automatisch aus der aktuellen Origin gebaut:
# z.B. für lokale Entwicklung:
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

> Hinweis: In der Produktion muss `GOOGLE_REDIRECT_URI` exakt mit dem Redirect‑URI übereinstimmen, den du in der Google Cloud Console eingetragen hast.

---

### 3. Wie der Flow im Code funktioniert

#### 3.1. Start des OAuth‑Flows – `/auth/google`

Datei: `src/routes/auth/google/+server.ts`

- Prüft, ob `GOOGLE_CLIENT_ID` gesetzt ist.
- Generiert einen zufälligen `state` (CSRF‑Schutz) und speichert ihn als httpOnly‑Cookie `oauth_google_state`.
- Leitet den Browser zu dieser URL weiter:

```text
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=...
  &redirect_uri=.../auth/google/callback
  &response_type=code
  &scope=openid email profile
  &state=...
```

Die Buttons auf Login/Registrierung verlinken einfach auf `/auth/google`:

- `login/+page.svelte`: „Mit Google anmelden“
- `register/+page.svelte`: „Google“

#### 3.2. Callback – `/auth/google/callback`

Datei: `src/routes/auth/google/callback/+server.ts`

Schritte:

1. Prüft, ob `state` mit dem `oauth_google_state`‑Cookie übereinstimmt.
2. Tauscht den `code` gegen Tokens bei `https://oauth2.googleapis.com/token`.
3. Lädt User‑Infos bei `https://www.googleapis.com/oauth2/v3/userinfo` (E‑Mail, Name, Bild).
4. Verknüpft oder erstellt Datenbankeinträge via Prisma:
   - `Account` mit `provider = "google"` und `providerAccountId = profile.sub`.
   - `User`:
     - Wenn es bereits einen User mit `email` gibt → wird verwendet.
     - Sonst wird ein neuer User mit `email`, `given_name`/`family_name`, `picture` angelegt (Passwort bleibt leer).
5. Erstellt eine Session (`createSession(userId)`) und setzt das `session`‑Cookie (30 Tage).
6. Redirect zum Dashboard: `/dashboard`.

---

### 4. Typische Fehler & Troubleshooting

**Problem:** Nach Google‑Login lande ich wieder auf `/login`  
**Ursache:** `state` stimmt nicht, `code` fehlt oder Token‑Request schlägt fehl.

- Prüfe Browser‑Konsole und Server‑Logs.
- Stelle sicher, dass Redirect‑URI in Google‐Console **exakt** mit der URL in `.env` bzw. `GOOGLE_REDIRECT_URI` übereinstimmt.

---

### 5. Sicherheitshinweise

- `GOOGLE_CLIENT_SECRET` **niemals** committen oder im Frontend ausgeben.
- `oauth_google_state` ist httpOnly, SameSite=lax und in Production `secure: true` gesetzt.
- Session‑Handling und `loginActivities` folgen demselben Sicherheitskonzept wie beim normalen Login (siehe `AUTH_SETUP.md`).

---

### 6. Nächste mögliche Erweiterungen

- GitHub OAuth analog zu Google einbauen (`/auth/github`, `/auth/github/callback`).
- Möglichkeit im Profil, Google‑Account zu verknüpfen/entkoppeln.
- UI‑Hinweis im Dashboard, wenn Account über Google registriert wurde.

