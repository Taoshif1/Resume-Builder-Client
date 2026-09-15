# PersonaCV V1 completion

## Audit - 2026-09-15

- Base: `main` at `c904001`, including the reusable-workspace foundation from PR #18.
- Completion work lives on `feat/personacv-v1-completion` and remains ahead of `main` until the final PR is reviewed and merged.
- The application keeps React/Vite, Firebase Auth, strict workspace validation, UID-scoped cloud storage, explicit legacy migration, stable IDs, source/authored project separation, and the resume resolver.
- The V1 server is a Node HTTP API backed by Firebase Admin + Firestore. The old README description of a MERN/MongoDB backend was stale and has been replaced.

## Product closeout

- [x] Secure Firebase-authenticated API and cloud persistence.
- [x] Master Developer Profile and reusable Project Library.
- [x] Safe public GitHub import/refresh without overwriting authored resume content.
- [x] Independent resume variants, selections, overrides, ordering and templates.
- [x] ATS-oriented live preview and multi-page Unicode PDF export.
- [x] Free/Pro entitlement enforcement on the server.
- [x] Owner/Super Admin authorization separated from subscription plans.
- [x] Pro job targeting/history and optional configured AI writing assistance.
- [x] Password recovery, protected routes and safe post-auth redirects.
- [x] Admin users, metrics, settings, feedback and secure Owner bootstrap.
- [x] Deny-by-default browser Firestore rules.
- [x] Vercel SPA deep-link configuration and explicit PDF-font function bundling.
- [x] GitHub Actions verification plus isolated Firebase Auth/Firestore emulator integration.
- [x] Accurate environment, security and deployment documentation.

## Scope corrections made during final audit

- Removed the accidental public `Premium` subscription tier. The supported product model is **Free + Pro**, while `owner` remains a privileged administrative role.
- Legacy pre-release records containing `plan: "premium"` are treated as Pro so test or preview data is not silently downgraded, but Premium is no longer exposed as a selectable plan.
- Fixed a corrupted UTF-8 feedback validation message.
- Restored strict local-path validation for post-auth redirects.
- Rewrote stale pricing copy so it does not imply live checkout; billing is not implemented in V1.
- Rewrote the README to describe the actual Firebase/Node architecture instead of MERN/MongoDB.

## Verification performed - 2026-09-15

GitHub Actions run `34974990720` executed on the completion branch after the closeout changes.

### Lint, test, build and audit job

- `npm ci`: passed.
- `npm run lint`: passed.
- `npm test`: passed.
- `npm run build`: passed.
- `npm audit --omit=dev --audit-level=high`: passed.

### Firebase emulator integration job

The isolated `demo-personacv` Firebase Auth + Firestore emulator suite executed successfully. It covers real emulator authentication through the HTTP API, Firestore workspace isolation, stable IDs, stale-save conflicts, Free limits, Pro upgrades, Owner/admin separation, private admin notes, history, PDF export, feedback, suspension/reactivation, direct Firestore denial and account deletion.

This closes the earlier verification gap where the emulator integration suite existed but had not actually been executed.

### Vercel preview

- Git-backed preview deployment `dpl_7Ab9BRry1ax3a8bQWxsC7UqN6kSY` reached `READY`.
- The preview root returned HTTP 200 and served the built PersonaCV application.
- Vercel reported no build failure. The remaining large-JavaScript-chunk message is a non-blocking performance warning that can be handled with code splitting after V1.
- The preview is protected by Vercel authentication, so a complete automated browser journey against that deployment is not claimed here.

## Release boundary

V1 still intentionally excludes live billing checkout, private GitHub repository OAuth/import, and a distributed rate-limiting service. Optional AI writing requires a configured server-side provider. These are documented product boundaries rather than hidden placeholder functionality.

A production release still requires real Firebase/Auth environment configuration and an authenticated deployed-environment smoke test before treating the production domain as verified.
