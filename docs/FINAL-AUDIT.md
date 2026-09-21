# PersonaCV final release audit

Date: 2026-09-21  
Branch: `main`

## Release status

PersonaCV is **READY WITH MANUAL CHECKS**. The existing Vercel production project is deployed and its public pages, routing, Firebase configuration, email/password login, session restoration and existing workspace reads passed live verification. Production account testing was explicitly restricted to read-only. Registration, saves, actual deployed PDF export, Google OAuth, email delivery and Owner/payment mutations remain manual; these have not been claimed as live passes.

## Architecture and data safety

- Existing Firebase Auth, Admin SDK, Firestore, workspace schema, document model, template renderer, manual payment model, and Free/Pro/Owner semantics are preserved.
- Authenticated workspace bootstrap now sequences account initialization before workspace loading, removing the first-login race.
- Direct paper editing writes structured resume overrides. It does not store arbitrary HTML or modify reusable Master Profile source data.
- Optimistic revisions surface conflicts and prevent silent stale overwrites. Failed saves retain local edits.
- No production collection was reset, migrated, copied from another branch, or written during this work.

## Authentication and security

Auth has explicit initialization/authenticated/unauthenticated/error states, safe intended-route restoration, useful Firebase error messages, session restoration, token refresh, and guarded configuration. All protected API routes verify Firebase ID tokens server-side with revocation checks. Account suspension, UID ownership, plan gates, and Owner privileges are server-authorized. Firestore rules prevent direct cross-user access. Tests reject missing, invalid, expired, revoked, disabled, and missing-user tokens.

No private Firebase service credential was added. Client Firebase web configuration remains environment-provided public configuration. Production rejects accidental emulator settings.

## Editor and PDF

The document-first editor supports safe inline editing for core profile, experience, education, and project content; structured inspector controls; undo/redo; autosave; retry; conflict feedback; keyboard shortcuts; responsive Edit/Preview modes; six templates; 60–140% editor zoom; and A4/Letter/Legal paper.

PDF tests cover all six templates, typography/spacing combinations, selectable Unicode and accented text, safe links, page bounds, multipage content, paper dimensions, and authenticated `%PDF-` responses. Editor and server PDF consume the same document configuration values.

## MVP, payments, and administration

The first-time and returning-user journeys cover public conversion pages, authentication, onboarding guidance, reusable profile/projects, document creation and persistence, review, and export. Server tests and the Firebase emulator verify Free limits, purchased slots, Pro features, Owner-only administration, account suspension/reactivation, feedback/privacy boundaries, and the manual payment lifecycle. The interface continues to describe payments as manually reviewed.

## Public website and discovery

Public navigation exposes Features, Pricing, Contact, Get Started, Privacy, and Terms. Metadata now includes product description, canonical URL, Open Graph, Twitter card, theme color, robots.txt, and sitemap.xml. No fake testimonials, customer counts, company logos, or automated-payment claims were added.

## Responsive, accessibility, and performance

- Responsive matrix: 120/120 route/viewport combinations across 360×800 through 1920×1080; zero horizontal overflow.
- Accessibility automation: zero detected violations on representative public/auth/workspace/editor/admin/error states at mobile, tablet, and desktop widths.
- Browser journeys: 20 passed (19 functional plus the visual capture matrix); 0 uncaught page errors and 0 captured React key warnings. Axe ran 45 route/viewport scans with 0 violations.
- Reduced motion, keyboard navigation, Escape behavior, labels, status regions, and editor focus were verified.
- Production build uses route-level lazy chunks. Current primary artifacts: application JS 447.79 kB (139.56 kB gzip), editor chunk 84.75 kB (25.90 kB gzip), CSS 118.94 kB (22.13 kB gzip), and the existing landing asset 296.85 kB.

## Final commands and exact results

| Command/check | Result |
| --- | --- |
| `npm ci` | Not rerun in Checkpoint G; recovered repository tooling and lockfile preserved |
| `npm run lint` | Passed with no ESLint errors |
| `npm test` | Passed after deployment guards: 108 tests, 0 failed, 0 skipped |
| `npm run build` | Passed: 114 modules transformed |
| `npm audit --omit=dev --audit-level=high` | Passed: 0 vulnerabilities |
| Firebase `emulators:exec` + `server/integration.mjs` | Rerun during launch: passed Auth → API → Firestore, payment/Owner and rules suite |
| Deployed read-only browser smoke | Passed 7 public routes, 7 protected redirects, 3 discovery assets, login/logout/session restoration and unchanged workspace/revision |
| `npm run test:e2e` | Exit 0 after deployment fixes: 20 journeys, 120 responsive combinations, 0 overflow, 45 axe scans / 0 violations, 0 page errors, 0 React key warnings |

Checkpoint G uses repository-owned Playwright, axe-core and Firebase CLI. Run `npm run test:e2e` with Java 21 available; `npm run test:e2e:install` installs Chromium when system Chrome is unavailable. The runner waits for API/web readiness and asserts emulator mode. The E2E API launcher requires `demo-personacv` and local Auth/Firestore emulators; its 1,000-request budget leaves production's 90 requests/minute default unchanged. Four negative startup probes rejected a non-demo project, either missing emulator, and a remote emulator host.

The successful run follows fixes for duplicate React date-field keys and tablet header overflow. Generated screenshots/PDFs and JSON evidence remain under ignored `.artifacts/final-browser`.

Checkpoint H verified contextual section movement/visibility, entry editing/movement/duplication/reset/removal, and API evidence that document removal preserves Master Profile experience and Project Library sources. It verified outline order, selection, focus, scrolling, current indication and hidden-section restoration. Certifications, Languages and Custom sections each completed the empty-source Add entries, create, return, show, hide and restore journey. H added browser tests only; G's 101-test and quality-gate results remain applicable.

The separate integration suite and live read-only browser smoke were rerun during the production launch audit below. Earlier G/H/I counts remain historical checkpoint results.

Checkpoint I captured and inspected 36 editor screenshots at 1440x1000, 768x1024, 390x844 and 360x800, including selection, outline, Design, Order/Add, Edit/Preview and a CV verified to print to 10 pages. Fixed contextual button clipping, mobile Export PDF truncation, outline stacking and preview-control horizontal displacement. Browser assertions now check action clipping and outline hit-testing. The resumed verification exposed a capture-readiness race; the harness now waits for the Export control before inspecting the editor. The full E2E rerun then exited 0. Evidence stays in ignored `.artifacts/editor-visual`; captures were visually reviewed, not compared with a stored pixel-diff baseline. Mobile paper at 100% still uses horizontal panning inside its canvas. Lint, all 101 unit/API tests, build and production dependency audit passed again after these CSS fixes.

## Production launch audit — Checkpoints J–M

Production alias: https://personacv.vercel.app
Verified deployment: https://personacv-ap3p4lfzr-taoshifs-projects.vercel.app
Deployment ID: `dpl_8JdG1af9KaGHf3XcrDgcGgxeUHYG`
Code/config commits: `5dcbb62` (guards/origin validation), `44949da` (upload exclusions); both pushed to main.

### Actual architecture and fixes

- Existing `api/[...path].js` plus four nested admin adapters all reuse `server/vercel-handler.js` and `createApp`. No duplicate backend or architecture migration was needed. The deployed build exposes five Node functions (7.86 MB each), with six bundled PDF font files.
- The existing SPA rewrite excludes API paths. Protected deep links returned the SPA and redirected to login. All 12 anonymous protected API route probes returned 401 JSON, never `index.html`; static discovery assets loaded correctly. Public-config origin probes returned 200 for the production origin and 403 for a foreign origin.
- Fixed missing production rejection of client/equivalent emulator settings; Vite builds and production/Vercel runtime now reject populated emulator variables. Invalid production origins now fail configuration; valid origins are normalized for request comparison. Seven added tests raised the suite from 101 to 108.
- Found missing CLI upload exclusions. Added `.vercelignore`; the clean manifest has 154 source files, five API entries, six TTFs, and zero local environment/artifact/build/log files. The first superseded CLI deployment contained protected source copies of local files and was removed after the clean replacement went live. Local files were preserved.
- No Firebase architecture, account privileges, production workspace, payment settings or receiver details were changed. Production account testing was explicitly kept read-only. No live PDF export was requested because export increments account usage.

### Configuration and live findings

Read-only Firebase management inspection returned 200 for Auth configuration, Google provider and deployed Firestore rules. Email/password and Google are enabled, the production domain is authorized, and deployed browser Firestore access remains denied. All production Web and server variables exist in Vercel. Runtime health returned 200 with configured Admin/project and emulator false. The environment matrix and commands in [README](../README.md#environment-contract) are authoritative for this release.

Preview still has existing Firebase variable scopes but no `APP_ORIGIN`, and its API fails configuration rather than accepting workspace requests. Preview was not deployed or account-tested; configure an intentional staging Firebase set/domain/origin before using it. No secrets were printed or committed; Vercel sensitive env pulls returned placeholders and were not used for builds.

The deployed read-only browser pass covered seven public pages, seven protected deep-link redirects and three static discovery assets. Title, description, production canonical, Open Graph and Twitter card were present; images loaded. Email/password login, logout, login again, session restoration, existing profile/project/resume/settings reads and existing resume opening passed. Workspace content **and revision** matched before/after. The designated normal Free account received 403 from administration. There were zero uncaught page errors, console errors or API 5xx responses.

The payment read endpoint returned configured bKash only; Nagad/Rocket remain disabled. The interface and backend still describe manual review. Real receiver ownership and Owner production access were not verified. The existing emulator integration suite passed approvals, Pro activation, purchased slots, transaction duplicates/concurrent replay, Owner-only access, suspension and rules; none of those mutations targeted production.

Live GitHub reads returned 200 for a public user, 400 for malformed username/URL input, and 404 for a missing user. Local mock probes passed GitHub upstream 403/429/500 and exception handling without forcing a real rate limit. Source-refresh preservation passed existing unit tests. Production AI is disabled; local mocks verified missing-key behavior, 4,000-character input limits, 1,000-token output bound, timeout signal and review-only suggestion response. The provider prompt forbids invented qualifications; this is not a guarantee about arbitrary provider output, and human review remains required.

Vercel's error-log query for the clean deployment returned no error entries during the smoke window. No runtime errors, broken images or request failure loops were observed in the browser pass. The largest observed same-origin transfer was the existing landing image (297,151 bytes); this was a practical smoke check, not a formal performance benchmark. Dedicated monitoring and distributed throttling remain post-launch improvements. A local E2E attempt lost its execution context during navigation; the unchanged harness passed on rerun and the final complete run passed again.

### Remaining manual checks

1. With explicit write-test authorization and a designated account: registration, profile/project/resume edits, autosave/reload/logout/login, and actual deployed PDF filename/signature/Unicode/links/pagination.
2. Interactive Google completion, cancellation, blocked popup and password-reset request plus inbox delivery.
3. A designated Owner session: admin lists/limits/settings, receiver ownership and test-account-only payment submission/approval. No real financial transactions are needed for deployment verification.
4. Intentional staging Preview configuration before preview account use; current preview API is unconfigured.
5. Native browser 200% zoom, NVDA/VoiceOver and printer/PDF appearance.

## Modified areas

- Auth bootstrap, error mapping, protected routing, token handling, and account/workspace sequencing.
- Document editor direct editing, undo/redo, autosave/status/retry, responsive controls, templates, and document styling.
- Server PDF Unicode fonts, paper/style parity, bounds/link validation, API hardening, release/integration tests, and authenticated smoke checks.
- Workspace skeleton/loading behavior, visual contrast and responsive CSS.
- Public metadata, robots, sitemap, and the requested audit documentation.

## Production configuration record

- Confirmed: six Firebase Web variables and three server variables in Vercel Production; matching local Web/Admin project; live Admin/Firestore readiness; email/password and Google provider enabled; production domain authorized; deny-all browser Firestore rules deployed.
- Confirmed: production API emulator flag false, missing/invalid configuration guards, origin acceptance/rejection, SPA/API separation, metadata/robots/sitemap/favicon, all five function entries and font assets. The existing Vercel project was reused.
- Unchanged: existing bKash configuration; Nagad/Rocket disabled; no live Owner privilege or user/payment/workspace changes. No service-account secret, smoke credentials or generated evidence were committed.
- Pending manual: the account mutation, deployed PDF, OAuth/reset, Owner/payment and Preview checks listed above. Full environment setup and deployment commands are in README.

## Known limitations

- Live Google OAuth and password-reset delivery were not completed against an interactive production provider.
- Production Owner/payment mutations require designated test-account verification. AI is intentionally unconfigured. GitHub rate-limit/upstream failures were verified with local mocks, not forced against GitHub.
- A separate native 200% browser-zoom recording and formal screen-reader certification remain manual release checks.
- Production monitoring must confirm real-region latency and provider availability after deployment.
