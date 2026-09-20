# PersonaCV commercial MVP audit

Date: 2026-09-20  
Branch: `main`

## User journey

The local authenticated browser journey completes the product path from public pages through registration/login protection, dashboard onboarding guidance, Master Profile, Projects, resume creation, document editing, template and design changes, review, export, dashboard return, and persisted reopen after reload. Returning-session restoration and logout/login were also verified.

The dashboard onboarding remains lightweight and skippable. It explains the reusable profile, projects, document types, editing, and export through real workspace actions rather than a forced wizard.

## Product capabilities verified

- Resume/CV management: create, rename, duplicate, archive, restore, delete, search, Free limits, purchased slots, Pro entitlements, and stable IDs.
- Master Profile: reusable source records with document-specific overrides. Source updates do not silently overwrite authored document variants.
- Project Library: manual projects, GitHub facts, refresh, authored descriptions, archive/restore, safe URLs, and preservation of resume-specific copy.
- Review/export: checks use actual document data for missing contact details, empty content, placeholders, links, section visibility, length guidance, and document output. No invented ATS score is shown.
- Account: plan/status, logout, backup/restore, feedback, privacy/legal links, and destructive flows retain confirmations and server ownership checks.
- Payments: the manual payment model remains explicit. Emulator coverage verified submission, duplicate transaction protection, pending/approval behavior, plan activation, purchased document slots, and Owner administration.
- Empty/loading/error/retry states are present on the primary workspace pages and operation surfaces.

## Security and data safety

Firebase ID tokens are verified server-side with revocation checking. UID ownership, account suspension, Free/Pro entitlements, and Owner permissions are server-authorized. Firestore rules remain deny-by-default for direct client access. Workspace changes validate schema, revision, size, ownership, URLs, and prototype keys. Existing workspace/document records remain compatible and no migration or production write was performed.

## Verification results

| Check | Result |
| --- | --- |
| Unit/API/security tests | 77/77 passed |
| Firebase emulator journey | Passed Auth, API, Firestore rules, isolation, payments, admin, history, PDF, suspension, and deletion |
| Browser product journeys | 12 passed with 0 unexpected console/page errors |
| Responsive route matrix | 120/120 route/viewport combinations; 0 horizontal overflow |
| Production build | Passed |
| Production dependency audit | 0 vulnerabilities |

## External verification still required

- Live Google OAuth, GitHub API behavior under real rate limits, and optional AI provider output require production provider configuration.
- Live Owner and manual-payment operations should be checked with designated production test accounts after environment values are installed.
- The audit did not create or mutate production users, workspaces, resumes, or payment records.

