# PersonaCV product polish verification — 2026-09-17

## Scope and recovery

Starting main: `867ea3ce6e54949ad50493817f3f547e6ff9473b`.
Branch: `feat/personacv-product-polish`.

The continuation preserved `cea79af` (workspace/product polish) and `ffd965f` (verified legacy cleanup/public claims), together with uncommitted formatting and the stable profile/project disclosure-state fix. No reset, branch replacement, schema migration or infrastructure rewrite was performed.

## Product changes

- Responsive sidebar/mobile menu, active navigation, actual account plan/role, Settings and sign-out controls. Workspace branding and Back to website return home. Public signed-in navigation offers Dashboard and My Resumes without a hardcoded plan.
- Overview uses actual counts, recent resumes, project entries and an explicitly field-derived setup checklist.
- Master Profile retains every existing collection, adds section navigation and collapsible entries, and preserves ordering and deletion confirmations.
- Project Library distinguishes read-only GitHub facts from authored resume content, shows import/refresh selection state and sync dates, validates URLs and explains limits.
- Resume management retains create/edit/duplicate/archive/restore/delete/search; cards show targeting, templates, selections, labels, update time and archived state. Limit and empty states are explicit.
- Editor retains its data logic and provider save action. Basics/Content/Order/Targeting/Review organize controls; override indicators and reset actions distinguish master content. Desktop keeps split preview; mobile offers Edit/Preview. PDF still uses the server renderer and original paper dimensions.
- Settings shows actual account/usage, clean Owner unlimited display, backup/restore, history and support. Pro requests prepare a support message, not a checkout.
- `/resume/new` and `/dashboard/create` redirect to resume management. Public 404 offers Home/Sign in, or Dashboard for signed-in users.
- Removed the public hardcoded Free plan, fake sign-in percentile, legacy fake ATS/resume metrics, and misleading AI scoring, automatic LinkedIn sync and guaranteed-no-data-loss claims. Illustrative resume content remains labeled. Public tiers remain Free and Pro; Owner is a role.

## Responsive defect and repair

At 360px, Home stacked 40px gutters inside the public layout and embedded Pricing with further padding. The pricing cycle control could not wrap and its grid/card contents imposed an intrinsic minimum width. Pricing also rendered a nested `main`.

`src/pages/Home.jsx` now uses responsive gutters. `src/pages/Pricing.jsx` uses a semantic section, wrapping cycle controls, an explicit shrinkable single-column grid, smaller mobile card padding and responsive headings. No global overflow-hiding rule was introduced to pass the test.

## Final automated checks

| Check | Result |
| --- | --- |
| `npm ci` | Passed during implementation; dependency files unchanged |
| `npm run lint` | Passed on final application code |
| `npm test` | 35/35 unit, security, data/migration and PDF tests passed |
| `npm run build` | Passed |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| `npm run test:integration` | Passed under isolated `demo-personacv` Auth/Firestore emulators with Java 21 |

The emulator suite covers real emulator authentication through HTTP, Firestore isolation, stable IDs, revision conflicts, Free limits, Pro upgrades, Owner protection, private notes, history, PDF, feedback, suspension/reactivation, deletion and denied browser Firestore access.

## Final browser verification

Local `npm run dev:full` served Vite on 5173 and the Firebase Admin API on 3000. A dedicated real Firebase smoke account exercised:

1. Public Home → login → dashboard → public website → dashboard.
2. Profile edit, save, refresh and persistence.
3. Manual project authoring, invalid URL feedback, live public GitHub import/refresh and authored-description preservation.
4. Free resume-limit state, creation after temporarily freeing a backed-up test slot, variant overrides without master mutation, and live preview.
5. Arrow fallback, keyboard, mouse and touch section ordering; save/reload.
6. Free server-generated PDF download and JSON backup.
7. Settings → logout → login → persisted content.
8. Simulated backend 503 during save: session retained, error displayed, retry saved successfully.
9. Free account denied the Owner UI and received HTTP 403 from `/api/admin`.
10. Signed-out Contact and 404 actions route sensibly to public Home/Sign in.

The final responsive suite passed **80 route/viewport combinations**, checking all 16 routes at 360×800, 390×844, 768×1024, 1366×900 and 1440×1000:

Home, Login, Register, Dashboard, Profile, Projects, Resumes, an existing Editor, Settings, Admin access denial, Features, Pricing, Contact, Privacy, Terms and 404.

No horizontal body/main overflow, Vite overlays or browser runtime exceptions occurred. Mobile navigation visibility, `aria-expanded`, Escape/focus return and Edit/Preview switching passed. Explicit drag handles and arrow controls remain. Nonessential public animations respect reduced-motion preferences.

Free UI and real cloud persistence were browser-tested; Pro/Owner server capabilities were checked by unit and emulator integration tests. The privileged Owner UI was not exercised using a real production Owner account. Google OAuth completion, actual password-reset email delivery and optional AI-provider calls were not exercised in this phase; their controls and auth layouts were inspected.

## Smoke workspace restoration

The original ignored backup was retained. Before restoration, the current authenticated email was checked against the configured smoke account, its UID matched `workspace.ownerUid`, and both backup and current workspace passed the existing schema validator. Expected QA markers were present. The current test workspace was separately backed up, and restoration used the latest revision so concurrent writes would conflict safely.

Cloud contents were fetched and compared exactly with the original backup. The local UID-scoped backup was also restored, and the dashboard reloaded successfully. No unrelated account was modified. Export usage/revision counters naturally reflect verification activity; workspace content is restored.

## Architecture and performance

The single protected architecture remains PrivateRoute → WorkspaceProvider → ProductLayout → product pages. [The architecture audit](PRODUCT-ARCHITECTURE.md) lists all **33 deleted legacy files** and why shared schema, resolver, migration, storage and tests remain.

Route-level splitting keeps editor/DnD and other heavy product pages separate. The entry JavaScript is **523.57 KB / 170.61 KB gzip**, down from roughly 630 KB before splitting. The editor chunk is **59.44 KB / 19.31 KB gzip**. CSS is **97.81 KB / 17.85 KB gzip**. The remaining entry chunk above 500 KB produces a non-blocking Vite warning; no bundler hacks were added.

`server/firebase.js`, `server/env.js`, `server/app.js`, `src/product/api-client.js`, WorkspaceProvider, credential/configuration files and Vercel production settings are unchanged by this phase.

## Release boundaries

- No live billing or checkout.
- No private GitHub repository OAuth/import.
- AI requires a configured server provider and remains optional.
- Request limiting remains per server instance.
- Stable production was not redeployed for this work. Prior production Firebase smoke verification is retained as historical evidence; this branch's new UI was verified locally.
- Preview Firebase secrets were not inspected or copied, so authenticated Preview readiness is not claimed. Review the PR and verify production separately after merge.
- Browser harnesses, account backups and screenshots remain ignored under `.artifacts/`; no credentials or test-account data are included in the PR.

Latest main documentation update `89a351a44b72a5f37ac1a6fd0f7cf53811615c03` (README portfolio polish) was inspected and merged during delivery. Its author/studio content is preserved; application code is unchanged by that merge.
