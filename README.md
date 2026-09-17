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
- Up to 3 resume variants by default
- Master Profile
- Public GitHub import
- Modern resume template
- PDF export
- Basic resume quality checks

### Pro

- Up to 100 reusable projects by default
- Up to 50 resume variants by default
- All bundled resume templates
- Advanced resume guidance
- Saved job targeting and keyword comparison
- Workspace history
- Optional configured AI writing assistance

### Owner / Super Admin

The Owner can manage user accounts, Free/Pro assignments, suspensions, platform usage, plan limits, template availability, feature flags, feedback and private admin notes.

Online billing is not implemented in V1. Pro access is currently assigned administratively after a request.

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

The repository includes Vercel configuration for SPA deep links and server PDF assets. Production requires matching Firebase client configuration, Firebase Admin server credentials and the correct `APP_ORIGIN`.

Do not treat a deployment as production-ready until real authentication, workspace persistence, resume editing, PDF export, logout/login persistence and Owner access have been exercised on the deployed environment.

## Current V1 Boundaries

- No live payment checkout or billing webhook implementation
- No private GitHub repository import
- AI writing depends on optional external provider configuration
- Built-in request throttling is per server instance
- Browser end-to-end journeys still require production smoke testing

## Work With Gazi Taoshif

For web products, SaaS development, e-commerce systems, and custom software work, visit **[Taoshiflex Studio](https://taoshiflexstudio.me)**.
