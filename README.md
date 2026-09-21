# PersonaCV

**PersonaCV** is a developer-first resume platform created by **Gazi Taoshif** for maintaining reusable career data and producing targeted resume variants without rewriting the same projects, experience, skills, and education for every application.

This product is part of Gazi Taoshif's software portfolio. For development work and commercial projects, visit **[Taoshiflex Studio](https://taoshiflexstudio.me)**.

**Studio:** https://taoshiflexstudio.me  
**GitHub:** https://github.com/Taoshif1

## Core Workflow

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
        +--> compare existing content with a job description (Pro)
        |
        v
Live Preview -> ATS-friendly PDF
```

GitHub imports are treated as source facts. User-authored resume descriptions remain separate, so refreshing a repository does not replace achievements or wording written by the user.

## V1 Product Scope

- Firebase email/password and Google authentication
- Protected workspace routes and persistent sessions
- Master Developer Profile
- Reusable Project Library
- Public GitHub repository import and refresh
- Independent resume variants
- Per-variant project, experience, education and skill selection
- Per-variant content overrides
- Section visibility and ordering
- Multiple resume templates
- Live resume preview
- ATS-oriented editorial checks
- Pro job-description keyword comparison
- Server-generated multi-page PDF export with Unicode fonts
- Workspace JSON backup and restore
- Pro workspace history
- Optional AI writing assistance when a server-side provider is configured
- Owner/Super Admin dashboard

PersonaCV does not claim that its editorial checks predict a hiring result or reproduce a proprietary ATS score.

## Access Model

### Free

- Up to 10 reusable projects by default
- Up to 2 Resume/CV documents by default
- Master Profile
- Public GitHub import
- Modern resume template
- PDF export
- Basic resume quality checks

### Pro

- Up to 100 reusable projects by default
- Up to 50 Resume/CV documents by default
- All bundled resume templates
- Advanced resume guidance
- Saved job targeting and keyword comparison
- Workspace history
- Optional configured AI writing assistance

### Owner / Super Admin

Owner is a server-authorized administrative role, not a third subscription tier. The Owner can manage user accounts, Free/Pro assignments, suspensions, platform usage, plan limits, template availability, feature flags, feedback and private admin notes.

PersonaCV currently uses an Owner-reviewed manual payment flow rather than an automatic gateway. The Owner can enable or disable bKash, Nagad, and Rocket receiving numbers, adjust Bangladesh pricing, review submitted transaction IDs, approve Pro access, and grant paid document-slot packs. Automatic payment verification/webhooks are not implemented yet.

## Architecture

### Frontend

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- DaisyUI 5
- `@dnd-kit`
- Firebase Web SDK for authentication

### Server

- Node.js 22+
- Custom Node HTTP API
- Firebase Admin SDK
- Cloud Firestore
- PDFKit
- Noto Sans fonts for Unicode PDF output
- Optional OpenAI-compatible writing provider

The same server implementation can run as a normal Node process or behind the Vercel API adapter.

## Persistence and Security

Each authenticated account has a UID-scoped workspace containing profile data, reusable projects and resume variants. Cloud saves use revisions so a stale save receives HTTP `409` instead of silently overwriting newer data.

Browser Firestore access is denied by rules. Trusted server code uses Firebase Admin credentials. The API enforces authentication, UID ownership, account status, Free/Pro entitlements, Owner-only administration, schema validation, safe URL handling and request-size bounds.

Never expose Firebase Admin credentials or AI provider keys through `VITE_*` variables.

## Installation

```bash
npm ci
cp .env.example .env
cp .env.server.example .env.server
```

Run the complete local stack:

```bash
npm run dev:full
```

Or run the API and Vite separately:

```bash
npm run server:dev
npm run dev
```

## Main Commands

```bash
npm run dev
npm run server:dev
npm start
npm run build
npm run preview
npm run lint
npm test
npm run test:integration
npm run bootstrap:owner
```

## Firebase Setup

For a real deployment:

1. Create or select a Firebase project.
2. Enable the required authentication methods.
3. Enable Cloud Firestore.
4. Deploy `firestore.rules` so browser Firestore access remains denied.
5. Configure server-side Firebase Admin credentials.

The application intentionally accesses Firestore through the authenticated API rather than directly from React.

## PDF Export

PDFs are generated on the server after loading the authenticated user's own workspace. The renderer supports A4/US Letter variants, paginates long content and produces text-based PDFs rather than screenshots.

## Optional AI Writing Assistance

AI is not required for PersonaCV's main workflow. When enabled for a Pro account, the server can generate bounded writing suggestions for text already supplied by the user. Suggestions are returned for review and are not applied automatically.

## GitHub Integration

V1 imports public repositories through GitHub's public API. Imported repository facts remain separate from user-authored resume content so refreshing GitHub data does not overwrite the user's writing.

## Deployment

Production: https://personacv.vercel.app
Release classification: **READY WITH MANUAL CHECKS** (2026-09-21). Live account verification is deliberately read-only; production writes and PDF export remain manual checks.

Vercel serves the Vite `dist` output and routes API calls to `api/[...path].js`, with explicit adapters for nested admin settings/users/payments/feedback routes. Every adapter delegates to `server/vercel-handler.js`, which forwards the original Node request/response to the same `createApp(firebaseServices())` used by the standalone server. There is one backend implementation; the adapter does not open a listening port. Account, workspace, administration, PDF, GitHub, payment, feedback and optional AI routes stay in `server/app.js`.

The SPA rewrite excludes both `/api` and `/api/*`. Static assets take precedence; dashboard, resume, admin and public deep links receive the SPA. PDFKit loads six bundled Noto TTF files relative to the server module; `vercel.json` explicitly includes `public/fonts/**` in all five API functions (60-second maximum duration). `package.json` pins Node 22.x. Keep the existing linked Vercel project `personacv`, Vite preset, repository root, `npm run build`, and `dist` output.

`.vercelignore` excludes all local environment files, service-account patterns, screenshots/PDF evidence folders, logs and local build output from CLI uploads. Git ignores alone do not provide these [Vercel upload exclusions](https://vercel.com/docs/deployments/vercel-ignore). Never copy private configuration into `public/` or a `VITE_*` variable.

### Environment contract

This matrix comes from the current `process.env` / `import.meta.env` consumers, including scripts and Firebase project aliases. Set deployment values through Vercel environment settings; never commit values.

| Variables | Scope | Requirement / behavior |
| --- | --- | --- |
| `VITE_apiKey`, `VITE_authDomain`, `VITE_projectId`, `VITE_appId` | Client build | Required Firebase Web identifiers; missing values show a sign-in configuration error. Public identifiers, not Admin credentials. |
| `VITE_storageBucket`, `VITE_messagingSenderId` | Client build | Complete the six-value Firebase Web configuration; current Auth initialization does not require these two, and browser Storage/Messaging are not used. |
| `APP_ORIGIN` | Server | Required on Vercel/production. Use `https://personacv.vercel.app`; HTTPS origin only, no path/query/credentials. Normalized origin is checked before authenticated API dispatch. |
| `FIREBASE_PROJECT_ID` | Server | Configure explicitly; must match Web project and service-account project. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server secret | Complete service-account JSON, server-only. Required on Vercel; never prefix with `VITE_`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local/standalone server alternative | Path to a private service-account file outside the repository. Do not upload that file or a local path to Vercel. |
| `GOOGLE_CLOUD_PROJECT`, `GCLOUD_PROJECT` | Optional server aliases | Read by project resolution; any supplied alias must agree with every other project source. |
| `OWNER_BOOTSTRAP_UID` | One-time operator command only | Used only by `npm run bootstrap:owner`; not needed for normal deployment. Never run casually against production. |
| `AI_API_KEY`, `AI_MODEL`, `AI_API_URL` | Optional server-only | Key and model needed to enable a chosen provider; URL defaults to OpenAI-compatible chat completions. No key means clean disabled state. No AI configured in current production. |
| `VITE_API_URL` | Optional client override | Leave unset on Vercel so the browser uses same-origin `/api`. The current API does not implement cross-origin preflight/allow-origin responses; a separate-origin API is not a supported production configuration. |
| `PORT` | Local/standalone server | Defaults to 3000; Vercel invokes the adapter directly. Vite development port is 5173. |
| `NODE_ENV`, `VERCEL` | Platform/runtime | Activate production configuration checks; do not override platform values. `DEV` and `MODE` are Vite built-ins. |
| `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`, `VITE_AUTH_EMULATOR_URL` | Emulator only | Local demo tests only. Production runtime and builds reject populated emulator variables, including equivalent `*_EMULATOR_HOST` / `*_EMULATOR_URL` and `FIREBASE_EMULATOR_HUB`. |
| `SMOKE_BASE_URL`, `SMOKE_EMAIL`, `SMOKE_PASSWORD`, `SMOKE_WRITE` | Local smoke runner only | Dedicated test credentials in ignored `.env.smoke.local`. Default is read-only; keep `SMOKE_WRITE` unset. Do not deploy these variables. |

GitHub public imports use the unauthenticated public GitHub API; no GitHub token variable is implemented. Payment receiver numbers, enabled bKash/Nagad/Rocket methods, prices, support email and feature switches come from Owner-managed `system/settings`, not environment variables. Do not invent receiver details.

Production currently has all six Web values and all three server values configured. Existing Preview scopes include Firebase values but lack `APP_ORIGIN`; their API fails safely with a configuration 503. Preview is **not verified or ready for account testing**. Before using it, intentionally configure a separate staging Firebase project/credential/Web set and authorized domain plus its HTTPS `APP_ORIGIN`. Do not silently reuse production accounts/data in previews. Never promote a build compiled for a different Firebase environment.

### Deploy and verify

Run from the repository root linked to the existing project. Follow TEST → COMMIT → PUSH before deployment:

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=high
npm run test:e2e
vercel whoami
vercel env ls production
vercel deploy --dry --json
vercel deploy --prod --yes
vercel inspect https://personacv.vercel.app
curl https://personacv.vercel.app/api/health
vercel logs --environment production --level error --since 15m
```

Check the dry-run manifest before uploading: no `.env*`, `.artifacts`, `artifacts`, `dist`, logs or generated PDFs; retain the five API entries and six PDF TTFs. If the clone is unlinked, use `vercel link --project personacv --scope taoshifs-projects`; do not create a duplicate project. Vercel sensitive variables may pull as `[SENSITIVE]` placeholders, so deploy with the configured remote environment rather than treating a pull as working credentials.

A healthy `GET /api/health` returns HTTP 200, `ok: true`, configured project/Admin booleans and `emulator: false`. It checks credential access and reads Firestore settings (cached for 30 seconds); it does not reset or migrate data. Misconfiguration/infrastructure failures return safe 503 JSON. Browser requests use same-origin Bearer auth, with token revocation and account suspension checks. Errors expose safe messages, not raw stacks or credentials. Throttling remains per function instance; centralized monitoring/rate limiting is a post-launch improvement.

Local E2E requires Java 21 and Chrome or `npm run test:e2e:install`. `npm run test:e2e` owns startup/readiness/shutdown and uses only `demo-personacv` emulators. The separate integration suite (including manual payment approvals and duplicate protection) can be run with:

```bash
node node_modules/firebase-tools/lib/bin/firebase.js emulators:exec --project demo-personacv --only auth,firestore "node --env-file=config/e2e.env server/integration.mjs"
```

For the repository's existing read-only authenticated smoke runner, set `SMOKE_BASE_URL=https://personacv.vercel.app` in the ignored smoke environment, leave `SMOKE_WRITE` unset, and run `npm run smoke:authenticated`. Use only the designated smoke account.

### Production smoke checklist and manual checks

- Public pages, static assets, title/description/canonical/Open Graph/Twitter metadata, robots, sitemap, favicon, and protected deep-link redirects: passed on the deployed site. Metadata is currently shared site-wide with the production root canonical.
- Email/password login, logout/login, session restoration, account bootstrap read, existing profile/projects/resume/settings reads and normal-user admin denial: passed; workspace content and revision remained unchanged.
- Firebase email/password and Google providers, production authorized domain and deployed deny-all browser Firestore rules: confirmed by read-only configuration inspection. Google completion/cancel/blocked-popup behavior and password-reset request/delivery remain manual.
- Registration, profile/project/resume creation and edits, autosave persistence, actual deployed PDF Unicode/links/filename/pagination, and Owner account UI remain manual under the read-only live-test instruction. PDF export increments usage, so it was not invoked on production.
- Payments remain manual review. Production exposes configured bKash; Nagad/Rocket are disabled. Receiver ownership, designated payment submission and Owner approval need operator verification; no live financial transaction or payment mutation was performed.
- GitHub live public lookup/malformed input/missing user returned 200/400/404. Rate limits/upstream failures were simulated locally; source-refresh preservation passed deterministic tests. Actual live import/refresh saves remain manual.
- AI remains optional and disabled in production. Local mocked checks covered missing key, the 4,000-character input bound, bounded provider output and review-only suggestions. No live AI provider request was made.
- Native 200% browser zoom, screen-reader review and final printer/PDF appearance remain manual. No large monitoring platform was added; inspect Vercel logs and health after releases.

## Current V1 Boundaries

- No automatic payment verification or billing webhook implementation; manual payments require Owner review
- No private GitHub repository import
- AI writing depends on optional external provider configuration
- Built-in request throttling is per server instance
- New deployments need environment-specific smoke checks; current production passed read-only authentication, workspace, routing and public browser verification

## Product Shell and Routes

The protected app remains **PrivateRoute → WorkspaceProvider → ProductLayout → src/product/**. Desktop uses a sidebar and mobile uses an accessible expandable menu. Workspace branding and Back to website return home; public account navigation offers Dashboard and My Resumes.

| Route | Purpose |
| --- | --- |
| `/dashboard` | Actual workspace counts, recent resumes and a field-derived setup checklist |
| `/dashboard/profile` | Grouped reusable master information |
| `/dashboard/projects` | Manual/public GitHub projects, separate source facts and authored content |
| `/dashboard/resumes` | Create, search, duplicate, archive, restore and delete variants |
| `/resume/:id` | Grouped editor controls, explicit overrides, live preview and PDF |
| `/dashboard/settings` | Actual account/usage, Pro requests, backups, history and support |
| `/admin` | Server-authorized Owner controls |

Both `/resume/new` and `/dashboard/create` redirect to resume management. Mobile editor users switch between Edit and Preview. Source refresh never replaces authored content or resume overrides.

The old competing dashboard/builder is removed. Shared schema, resolver, migration and UID-scoped storage remain in `src/resume`. Heavy product pages load lazily. See [the import audit and complete deletion list](docs/PRODUCT-ARCHITECTURE.md).

## Verified Release State

The current release passed lint, **108/108 unit/API/security tests**, production build (114 modules), and production dependency audit (**0 vulnerabilities**). The full emulator browser run passed **20 journeys**, **120 responsive combinations**, **0 overflow**, **45 axe scans / 0 violations**, **0 page errors**, **0 React key warnings**, **36 editor screenshots**, and a **10-page CV**. The separate Auth → API → Firestore integration suite also passed, including payment/Owner flows.

Production at https://personacv.vercel.app passed the read-only browser smoke described above. This is **READY WITH MANUAL CHECKS**, not a claim that production mutations, Google OAuth, email delivery or deployed PDF export were exercised. Local entry JS is 447.79 kB (139.56 kB gzip), editor JS 84.75 kB (25.90 kB gzip), and CSS 118.94 kB (22.13 kB gzip).

[Current final audit](docs/FINAL-AUDIT.md) · [Historical polish evidence](docs/PRODUCT-POLISH-VERIFICATION.md) · [V1 history](docs/V1-COMPLETION.md)

## Work With Gazi Taoshif

For web products, SaaS development, e-commerce systems, and custom software work, visit **[Taoshiflex Studio](https://taoshiflexstudio.me)**.
