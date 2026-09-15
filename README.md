# PersonaCV

PersonaCV is a developer-first resume platform for maintaining reusable career data and turning it into targeted resume variants without rewriting the same projects, experience, skills, and education for every application.

The core workflow is:

```text
Master Developer Profile
        +
Reusable Project Library
        |
        v
Resume Variants
        |
        +--> select relevant projects and experience
        +--> add resume-specific overrides
        +--> reorder and hide sections
        +--> compare truthful existing content with a job description (Pro)
        |
        v
Live Preview -> ATS-friendly PDF
```

GitHub imports are treated as source facts. User-authored resume descriptions remain separate, so refreshing a repository does not replace achievements or wording written by the user.

## V1 product scope

PersonaCV V1 provides:

- Firebase email/password and Google authentication
- protected workspace routes and persistent sessions
- Master Developer Profile
- reusable Project Library
- public GitHub repository import and refresh
- independent resume variants
- per-variant project, experience, education and skill selection
- per-variant content overrides
- section visibility and ordering
- multiple resume templates
- live resume preview
- ATS-oriented editorial checks
- Pro job-description keyword comparison
- server-generated multi-page PDF export with Unicode fonts
- workspace JSON backup and restore
- Pro workspace history
- optional AI writing assistance when a server-side provider is configured
- Owner/Super Admin dashboard for account and platform administration

PersonaCV does **not** claim that editorial checks predict a hiring result or reproduce a proprietary ATS score.

## Access model

There are two subscription plans and one privileged administrative role.

### Free

- up to 10 reusable projects by default
- up to 3 resume variants by default
- Master Profile
- public GitHub import
- Modern resume template
- PDF export
- basic resume quality checks

### Pro

- up to 100 reusable projects by default
- up to 50 resume variants by default
- all bundled resume templates
- advanced resume guidance
- saved job targeting and keyword comparison
- workspace history
- optional configured AI writing assistance

Plan limits can be adjusted by the Owner from the admin dashboard.

### Owner / Super Admin

`owner` is a server-authorized role, not a paid plan. The Owner receives normal product capabilities plus administrative access to:

- user accounts
- Free/Pro assignments
- suspension/reactivation
- account deletion
- platform usage metrics
- plan limits
- template availability
- public GitHub and AI feature flags
- user feedback
- private admin notes

Owner accounts cannot be modified or deleted through the normal admin-user controls.

Online billing is not implemented in V1. The pricing UI states this explicitly, and Pro access is assigned by the Owner after a request. `server/billing.js` is only an adapter contract for future payment integration.

## Architecture

PersonaCV is **not a MERN application** in its current form.

### Frontend

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- DaisyUI 5
- `@dnd-kit` for accessible ordering interactions
- Firebase Web SDK for authentication only

### Server

- Node.js 22+
- custom Node HTTP API
- Firebase Admin SDK
- Cloud Firestore for account/workspace persistence
- PDFKit for PDF generation
- Noto Sans fonts bundled for Unicode PDF output
- optional OpenAI-compatible writing provider

The same server implementation can run as a normal Node process (`server/index.js`) or behind the Vercel API adapter (`api/[...path].js`).

### Persistence model

Each authenticated account has an account document and a UID-scoped workspace. A workspace contains:

- `profile`: reusable personal, experience, education, skills and additional sections
- `projects`: reusable project records
- `resumeVariants`: independent selections, ordering, templates and overrides

Imported projects deliberately separate:

```text
sourceData  -> refreshable GitHub facts
resumeData  -> user-authored resume content
```

A GitHub refresh replaces source facts only. It does not overwrite `resumeData`.

Cloud saves use a revision number. A stale save receives an HTTP `409` instead of silently overwriting a newer change from another tab or device.

## Security model

The browser does not receive direct Firestore data access. `firestore.rules` denies all client reads and writes; trusted server code uses Firebase Admin credentials.

The API additionally enforces:

- Firebase ID-token verification with revoked-token checks
- UID ownership validation on every workspace payload
- active/suspended account status
- server-side Free/Pro entitlements
- Owner-only administration
- request and document size bounds
- strict workspace schema validation
- prototype-pollution key rejection
- safe public GitHub username validation
- URL protocol filtering before links are exported
- optimistic concurrency through workspace revisions
- private admin-note filtering from normal account responses
- best-effort per-instance request throttling

The in-memory request limiter is intentionally lightweight. A high-traffic production deployment should also use hosting/CDN/WAF rate controls because serverless instances do not share memory.

Never expose Firebase Admin credentials or AI provider keys through `VITE_*` variables.

## Repository structure

```text
api/
  [...path].js          Vercel serverless adapter
server/
  app.js                HTTP API and routing
  service.js            persistence, authorization and admin service layer
  firebase.js           Firebase Admin initialization
  pdf.js                server PDF renderer
  billing.js            future billing adapter contract
  bootstrap-owner.js    one-time Owner role bootstrap
  integration.mjs       Auth + Firestore emulator integration suite
src/
  product/               V1 workspace, editor, admin and product logic
  resume/                workspace schema, resolver, templates and migrations
  services/              Firebase client authentication
  routes/                application routing and protected route handling
public/fonts/             PDF Unicode fonts
firestore.rules           deny-by-default browser Firestore policy
firebase.json             emulator/rules configuration
vercel.json               Vercel function assets + SPA deep-link rewrite
.github/workflows/ci.yml   verification and emulator integration CI
```

## Requirements

- Node.js `>=22.12.0`
- npm
- a Firebase project for real persistence/authentication
- Java 21 only when running the Firestore emulator integration suite locally

## Installation

```bash
npm ci
```

Create the frontend environment file from the example:

```bash
cp .env.example .env
```

Fill in the Firebase Web configuration:

```dotenv
VITE_apiKey=
VITE_authDomain=
VITE_projectId=
VITE_storageBucket=
VITE_messagingSenderId=
VITE_appId=
```

These Firebase Web identifiers are intentionally client-side configuration. They are not Firebase Admin credentials.

Create the server environment file:

```bash
cp .env.server.example .env.server
```

Local server configuration (`.env.server`):

```dotenv
PORT=3000
APP_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=<same project as VITE_projectId>
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Alternatively set `FIREBASE_SERVICE_ACCOUNT_JSON` to complete service-account JSON on one line. The server validates project ID, client email and private key and normalizes escaped newlines. It refuses mismatched client/server projects and missing credentials with HTTP 503.

`npm run dev:full` starts the API on port 3000 and Vite on port 5173. `npm run server:dev` and `npm run dev` also work separately. Node 22's `--env-file-if-exists=.env.server` loads backend settings; `server/env.js` additionally loads `.env.server`, `.env.local`, and `.env` (existing process values win), including when invoking `node server/index.js` directly. Vercel uses runtime variables instead of local env files.

Vercel Production requires all six `VITE_*` Web configuration values above, plus these **server runtime** variables:

```dotenv
APP_ORIGIN=https://personacv.vercel.app
FIREBASE_PROJECT_ID=<same project as VITE_projectId>
FIREBASE_SERVICE_ACCOUNT_JSON=<complete service account JSON>
```

Store the JSON as a secret. Changing variables requires a new deployment. Preview needs its own matching configuration and origin; never assume Production secrets are inherited by Preview. No implicit workstation or hosting metadata credentials are used.

Do not commit `.env`, `.env.server`, service-account files or secret JSON. The repository `.gitignore` blocks them by default.

## Firebase setup

For a real deployment:

1. Create/select a Firebase project.
2. Enable Email/Password authentication if it will be offered.
3. Enable Google authentication if Google sign-in will be offered.
4. Enable the Cloud Firestore API and create the `(default)` Firestore database. Admin credentials must have Firestore data access; enabling APIs requires separate project administration permissions.
5. Deploy `firestore.rules` so browser Firestore access remains denied.
6. Configure server-side Firebase Admin credentials.

The application intentionally accesses Firestore through the authenticated API rather than directly from React.

## Local development

Run the API in one terminal:

```bash
npm run server:dev
```

Run Vite in another terminal:

```bash
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:3000`, so normal local browser requests stay same-origin from the application's perspective.

For development with the Firebase Auth emulator, set `VITE_AUTH_EMULATOR_URL` only against an isolated emulator project. Never point emulator-enabled client configuration at production data.

## Commands

```bash
npm run dev               # Vite development server
npm run server:dev        # Node API with file watching
npm start                 # production-style Node server
npm run build             # Vite production build
npm run preview           # preview built frontend
npm run lint              # ESLint
npm test                  # Node unit/security/PDF tests
npm run test:integration  # integration test; requires isolated Firebase emulators
npm run bootstrap:owner   # one-time Owner bootstrap
```

## Owner bootstrap

Owner access is never assigned by a browser request.

1. Create/sign in to the account through Firebase Authentication.
2. Find its Firebase Auth UID.
3. Set `OWNER_BOOTSTRAP_UID` in the server environment.
4. Run:

```bash
npm run bootstrap:owner
```

5. Remove `OWNER_BOOTSTRAP_UID` from the environment after the role is persisted.

The bootstrap script only promotes an existing Firebase Auth account.

## Verification

The normal release checks are:

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

The test suite covers security-sensitive behavior including authentication boundaries, workspace ownership, Free/Pro enforcement, Owner separation, schema validation, source/authored-content behavior, migrations, and multi-page Unicode PDF extraction.

### Firebase emulator integration

`server/integration.mjs` requires both Firebase Auth and Firestore emulators and refuses to run unless the project is the isolated `demo-personacv` project.

GitHub Actions starts those emulators and executes the suite automatically. It covers:

- real emulator Auth -> API token verification
- UID-isolated Firestore workspaces
- stable initial IDs
- stale-save conflicts
- Free limits and Pro upgrade behavior
- Owner-only administration
- admin-note privacy
- history
- PDF export
- feedback
- suspension/reactivation
- direct browser Firestore denial
- account deletion

## PDF export

PDFs are generated on the server after loading the authenticated user's own workspace. The requested resume variant must exist in that workspace.

The PDF renderer uses bundled Noto Sans fonts, supports A4/US Letter variants, paginates long content and produces text-based rather than screenshot-based PDFs. This keeps text selectable and more suitable for ATS parsing.

## Optional AI writing assistance

AI is not required for PersonaCV's main workflow.

If all of the following are true:

- the account has Pro entitlement
- the Owner has not disabled AI
- `AI_API_KEY` is configured on the server

then the editor can request bounded writing suggestions for text already supplied by the user.

The server prompt explicitly forbids inventing qualifications, employers, skills, metrics or experience. Suggestions are returned for review and are not applied automatically.

Optional server variables:

```dotenv
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=
```

## GitHub integration

V1 imports **public repositories only** through GitHub's public API. No private-repository OAuth flow is implemented.

Imported source fields include repository identity, description, primary language, topics, homepage and update timestamps. PersonaCV keeps the user's own project title, stack, live link and achievement text in a separate authored object.

If GitHub is unavailable or rate-limited, the API returns an explicit error rather than altering saved project data.

## Vercel deployment

The repository includes `vercel.json` for two production requirements:

- preserve client-side deep links for the Vite SPA
- include the PDF font assets in the Vercel Function bundle

The `/api` function remains a filesystem route, while non-file SPA routes fall back to `index.html`.

Configure the frontend Firebase `VITE_*` values at build time and the following as server-only runtime values:

```dotenv
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
APP_ORIGIN=https://your-production-domain.example
```

Add optional AI variables only if writing assistance is intentionally enabled.

Do not claim a deployment is production-ready until the preview deployment has been exercised with real environment configuration. In particular, test registration/login, workspace persistence, a second resume variant, PDF export, logout/login persistence and Owner access on the deployed environment.

## Docker / normal Node deployment

`Dockerfile` builds the Vite frontend and runs `server/index.js`. In this mode the Node server serves the compiled SPA and API from the same process.

Production startup deliberately refuses emulator configuration and requires `APP_ORIGIN`.

## CI

`.github/workflows/ci.yml` runs two jobs on `main`, the Firebase production fix branch, and pull requests to `main`:

1. lint, unit/security/PDF tests, production build and production dependency audit
2. isolated Firebase Auth + Firestore emulator integration tests

A merge should not be treated as verified until these checks are green.

## Current V1 limitations

- no live payment checkout or billing webhook implementation
- no private GitHub repository import
- AI writing depends on optional external provider configuration
- the built-in request limiter is per server instance, not a distributed abuse-prevention system
- browser end-to-end journeys still require a configured preview/production deployment or a dedicated browser-test setup

These are explicit boundaries, not hidden placeholder functionality.

## Authenticated readiness and smoke verification

`GET /api/health` returns safe project/credential presence flags and checks credential exchange plus a Firestore read. It returns 503 when configuration or infrastructure is unavailable. Presence flags are not proof of readiness: check both HTTP status and `ok`.

- 401: missing, invalid, expired, revoked, or disabled session; the browser retries once with a refreshed token.
- 403: authorization/origin rejection.
- 409: revision conflict; preserve local changes before reloading.
- 429: rate limit.
- 503: server configuration or infrastructure failure; the user remains signed in.

For a dedicated real test account, put `SMOKE_EMAIL` and `SMOKE_PASSWORD` in an ignored `.env.smoke.local`. Run:

```bash
node --env-file=.env.local --env-file=.env.server --env-file=.env.smoke.local server/smoke-authenticated.mjs
```

Set `SMOKE_BASE_URL=https://personacv.vercel.app` to test production. The script signs in, checks account/workspace, saves a temporary profile marker, reloads, signs out/in, verifies persistence and restores the original workspace. It prints HTTP statuses, never tokens or passwords. It deliberately stops at the first failure. Use only a dedicated account, without concurrent edits.

Also verify the browser journey: register, login, dashboard, profile/projects/resumes, create/edit/save a resume, refresh, logout/login, and confirm saved content. Health, build and emulator success alone do not establish production functionality. Verify `/api/account` and `/api/workspace` 200s in Vercel runtime logs before merging.
