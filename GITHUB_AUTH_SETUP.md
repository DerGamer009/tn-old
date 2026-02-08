## GitHub OAuth Setup für TitanNode

Dieses Projekt hat die GitHub‑Login‑Integration vorbereitet:

- Start des Flows: `GET /auth/github`
- Callback nach erfolgreichem Login: `GET /auth/github/callback`
- Frontend‑Buttons:
  - `src/routes/login/+page.svelte` – „Mit GitHub anmelden“
  - `src/routes/register/+page.svelte` – „GitHub“

Du musst nur noch eine GitHub OAuth App anlegen und die `.env` befüllen.

---

### 1. GitHub OAuth App anlegen

1. Gehe zu `https://github.com/settings/developers` (für User‑Apps) oder `https://github.com/organizations/<org>/settings/applications` (für Organisationen).
2. Unter **OAuth Apps** → **New OAuth App**:
   - **Application name**: z.B. `TitanNode Dashboard`.
   - **Homepage URL**:
     - Lokal: `http://localhost:5173`
     - Produktion: `https://deine-domain.tld`
   - **Authorization callback URL**:
     - Lokal: `http://localhost:5173/auth/github/callback`
     - Produktion: `https://deine-domain.tld/auth/github/callback`
3. App erstellen und notieren:
   - **Client ID**
   - **Client Secret** (einmalig sichtbar, ggf. neu generieren).

---

### 2. `.env` / Umgebungsvariablen setzen

Im Projekt‑Root in deiner `.env`:

```env
GITHUB_CLIENT_ID=deine-github-client-id
GITHUB_CLIENT_SECRET=dein-github-client-secret

# Optional, sonst wird automatisch aus der aktuellen Origin gebaut:
# z.B. für lokale Entwicklung:
GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

> Wichtig: Die Redirect‑URL muss exakt mit der URL in der GitHub OAuth App übereinstimmen.

---

### 3. Wie der Flow im Code funktioniert

#### 3.1. Start – `/auth/github`

Datei: `src/routes/auth/github/+server.ts`

- Liest `GITHUB_CLIENT_ID` und optional `GITHUB_REDIRECT_URI`.
- Erzeugt einen zufälligen `state` und speichert ihn als httpOnly‑Cookie `oauth_github_state` (10 Minuten gültig).
- Redirect zu:

```text
https://github.com/login/oauth/authorize
  ?client_id=...
  &redirect_uri=.../auth/github/callback
  &scope=read:user user:email
  &state=...
```

Die Buttons auf Login/Registrierung verlinken einfach auf `/auth/github`.

#### 3.2. Callback – `/auth/github/callback`

Datei: `src/routes/auth/github/callback/+server.ts`

Schritte:

1. Prüft `state` gegen Cookie `oauth_github_state` (CSRF‑Schutz).
2. Tauscht `code` gegen `access_token` bei `https://github.com/login/oauth/access_token`.
3. Lädt User‑Infos:
   - `https://api.github.com/user` → `id`, `login`, `name`, `avatar_url`, evtl. `email`.
   - Falls keine E‑Mail enthalten → `https://api.github.com/user/emails` und nimmt die primäre/verifizierte Adresse.
4. Datenbank mit Prisma:
   - `provider = "github"`, `providerAccountId = String(profile.id)`.
   - Wenn es bereits einen `Account` mit dieser Kombi gibt → `userId` daraus nutzen.
   - Sonst:
     - Sucht einen `User` mit dieser E‑Mail.
     - Wenn keiner vorhanden → erstellt neuen `User` mit:
       - `email = primaryEmail`
       - `firstName`/`lastName` aus `name` oder `login` abgeleitet
       - `password = ''` (kein Passwort für reines OAuth)
       - `image = avatar_url`
       - `emailVerified = true`
     - Legt einen neuen `Account` an, der `userId` mit GitHub verbindet und den `access_token` speichert.
5. Erstellt eine Session (`createSession(userId)`), loggt `LoginActivity` und setzt ein `session`‑Cookie (30 Tage).
6. Redirect zum Dashboard: `/dashboard`.

---

### 4. Typische Fehler & Troubleshooting

**Problem:** Nach GitHub‑Login lande ich wieder auf `/login`.  
**Mögliche Ursachen:**

- `state` stimmt nicht mit `oauth_github_state` überein (z.B. Cookie blockiert).
- `GITHUB_CLIENT_ID` oder `GITHUB_CLIENT_SECRET` fehlen.
- Redirect‑URL stimmt nicht exakt mit der in GitHub konfigurierten überein.

Prüfe in dem Fall:

- Server‑Logs in der Konsole.
- Browser‑Netzwerk‑Tab für die Requests zu `/auth/github` und `/auth/github/callback`.

---

### 5. Sicherheitshinweise

- `GITHUB_CLIENT_SECRET` niemals ins Frontend leaken oder committen.
- `oauth_github_state` ist httpOnly, SameSite=lax und in Production `secure`.
- Session‑Handhabung ist identisch zu normalem Login/Google‑Login (siehe `AUTH_SETUP.md` und `GOOGLE_AUTH_SETUP.md`).

---

### 6. Nächste Schritte

- Optional Apple Sign‑In ergänzen (`/auth/apple`, `/auth/apple/callback`).
- Optionen im Benutzerprofil, um GitHub mit einem bestehenden Konto zu verknüpfen oder zu trennen.

