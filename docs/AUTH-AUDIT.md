# PersonaCV authentication audit

Date: 2026-09-20  
Branch: `main`

## Root cause

Firebase email/password authentication was issuing a valid user session. The failure occurred immediately after the authenticated redirect: `WorkspaceProvider` started `/api/account` and `/api/workspace` concurrently. For a new Firebase user, `/api/account` creates the server-side account record while `/api/workspace` requires that record to exist. The workspace request could win the race, fail account protection, and leave the user at an error state that looked like a failed login or registration.

The auth bootstrap also represented initialization with a single boolean and did not safely render configuration failures. Firebase popup/network errors were collapsed into one generic message, and the authenticated smoke command did not load the repository's ignored `.env.smoke.local` credentials.

## Behavior before and after

Before:

- New registration or first login could race account initialization against workspace loading.
- Login/register UI could render before Firebase finished session restoration.
- Missing client Firebase configuration could fail during module initialization.
- Google popup, disabled-account, throttling, invalid-email, and network failures lacked accurate messages.
- An already authenticated user could remain on the login page.

After:

- Account initialization completes before the first protected workspace request.
- Auth has explicit `initializing`, `authenticated`, `unauthenticated`, and `error` states.
- Login, registration, and protected routes show a branded application loader until Firebase resolves.
- `onIdTokenChanged` tracks restored sessions and token changes; localStorage is not treated as authentication authority.
- Missing or invalid Firebase web configuration produces a recoverable PersonaCV configuration message.
- Authenticated users return only to validated local paths; signed-out users are protected from all workspace, editor, and admin routes.
- Firebase failures map to specific, non-misleading messages, including popup cancellation/blocking, provider mismatch, disabled accounts, throttling, invalid credentials, and network failure.
- API calls obtain Firebase ID tokens for each request, retry one HTTP 401 with a forced refresh, and the server verifies tokens with revocation checking.
- Server account status, plan entitlements, UID ownership, and Owner access remain authoritative.

## Files modified

- `src/context/AuthProvider.jsx`
- `src/product/AppLoader.jsx`
- `src/product/app-loader.css`
- `src/product/AuthForm.jsx`
- `src/product/WorkspaceProvider.jsx`
- `src/routes/PrivateRouter.jsx`
- `src/services/auth.js`
- `src/services/auth-errors.js`
- `src/services/auth-state.js`
- `src/services/auth-state.test.js`
- `src/services/firebase.js`
- `package.json`

Existing server token verification, Firestore deny-by-default rules, workspace ownership validation, account suspension enforcement, plan enforcement, and Owner authorization were retained.

## Tests and verification

| Command/check | Result |
| --- | --- |
| `npm ci` | Passed; 466 packages audited, 0 vulnerabilities |
| `npm run lint` | Passed |
| `npm test` | Passed, 75/75 tests |
| `npm run build` | Passed |
| `npm audit --omit=dev --audit-level=high` | Passed, 0 vulnerabilities |
| `npm run smoke:authenticated` | Passed against configured Firebase; account/workspace HTTP 200 before and after logout/login; read-only workspace comparison passed |
| Local headless auth journey | Passed protected-route redirects, invalid password, login, intended-route return, reload restoration, authenticated login-page redirect, logout, and login again at 390x844 with no unexpected page/console errors |
| Firebase Auth + Firestore emulator integration | Passed isolated `demo-personacv` suite, including registration, authentication, cross-user isolation, revoked token rejection, suspension/reactivation, Free/Pro enforcement, Owner protection, manual payment approval, PDF, feedback, deletion, and Firestore rules |

New unit coverage checks auth initialization, authenticated/unauthenticated resolution, configuration/restoration failure states, user-facing Firebase errors, and safe post-auth destinations. Existing security tests cover missing, invalid, expired, revoked, disabled, and missing-user tokens across protected API endpoints and verify that protected data and roles are enforced server-side.

## Environment requirements

Client/Vite variables:

- `VITE_apiKey`
- `VITE_authDomain`
- `VITE_projectId`
- `VITE_storageBucket`
- `VITE_messagingSenderId`
- `VITE_appId`
- optional development-only `VITE_AUTH_EMULATOR_URL`

Server variables:

- `APP_ORIGIN`
- `FIREBASE_PROJECT_ID`, matching `VITE_projectId`
- `FIREBASE_SERVICE_ACCOUNT_JSON`, or a valid non-production `GOOGLE_APPLICATION_CREDENTIALS` path

For Vercel, configure the client variables for the Vite build and the server variables for Functions. Add each deployed hostname to Firebase Authentication authorized domains. Both Auth and Firestore emulators must be configured together; production/Vercel rejects emulator configuration.

## Limitations requiring manual/external verification

- The live configured environment was tested with email/password using the dedicated ignored smoke account. Live account creation was not performed because the smoke was intentionally read-only.
- Google OAuth completion, popup cancellation, popup blocking, provider mismatch, and password-reset email delivery require a real interactive provider/browser setup. Their code paths and error mappings are covered, but they were not claimed as live provider passes.
- Firebase authorized-domain configuration and Vercel environment values must be checked in their respective consoles for each deployment hostname.
- No production data was written, reset, copied, or migrated during this audit.
