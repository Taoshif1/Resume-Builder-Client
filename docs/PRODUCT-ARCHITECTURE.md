# Product architecture audit — 2026-09-17

Starting main: 867ea3ce6e54949ad50493817f3f547e6ff9473b.

## Live import graph

- src/main.jsx → AuthProvider → RouterProvider → routes/router.jsx.
- Public routes → MainLayout → shared Navbar/Footer → Home and public feature/pricing/information pages.
- Auth routes → GetStarted → Login/Register → product/AuthForm → services/auth and services/firebase.
- Protected routes → PrivateRoute → WorkspaceProvider → ProductLayout → product pages.
- EditorPage → dnd-kit, Fields, operations, ResumePreview, document and API.
- WorkspaceProvider → api → Firebase ID tokens; workspace validation, UID-scoped storage and explicit legacy migration.
- api/[...path].js / server/index.js → server/app.js → service.js → Firebase Admin Auth + Firestore.
- server/pdf.js → product/document.js → resume/data/resolveResume.js.
- Route-level lazy pages keep editor/DnD and admin UI out of the public entry bundle.

## Classification and retention

**ACTIVE:** src/product/*; MainLayout; shared Navbar/Footer; public and auth pages; routes; context; services; server and api.
**SHARED DATA INFRASTRUCTURE:** resume/data/workspace.js (schema, validation, IDs, fields), legacyMigration.js (explicit older local-data import), resolveResume.js (variant/master composition for preview and PDF), resume/storage/workspaceStorage.js (UID-scoped backup), workspace.test.js (migration and isolation coverage). All retained.
**LEGACY BUT REUSABLE UI:** DashboardLayout, old Sidebar/Topbar/cards, and old builder controls. Sidebar, account identity and card grouping ideas were ported into the live product shell; no hardcoded legacy page was reactivated.
**DEAD / UNREFERENCED:** the files below were unreachable from src/main.jsx, server/API entrypoints or test roots. A static relative-import traversal (including dynamic imports/re-exports) was cross-checked with repository-wide reference searches before deletion. References between these dead files do not make them live.

## Removed files

- src/components/dashboard/ActivityFeed.jsx
- src/components/dashboard/Sidebar.jsx
- src/components/dashboard/StatCard.jsx
- src/components/dashboard/Topbar.jsx
- src/components/shared/FloatingChatbot.jsx
- src/components/shared/Logo.jsx
- src/layouts/DashboardLayout.jsx
- src/pages/dashboard/Create.jsx
- src/pages/dashboard/Overview.jsx
- src/pages/dashboard/Profile.jsx
- src/pages/dashboard/Resumes.jsx
- src/resume/builder/panels/EducationForm.jsx
- src/resume/builder/panels/ExperienceForm.jsx
- src/resume/builder/panels/PersonalInfoForm.jsx
- src/resume/builder/panels/ProjectsForm.jsx
- src/resume/builder/panels/SkillsForm.jsx
- src/resume/builder/preview/ResumeEducation.jsx
- src/resume/builder/preview/ResumeExperience.jsx
- src/resume/builder/preview/ResumeHeader.jsx
- src/resume/builder/preview/ResumeSkills.jsx
- src/resume/builder/ResumeEditor.jsx
- src/resume/components/sortable/SortableExperienceItem.jsx
- src/resume/components/sortable/SortableProjectItem.jsx
- src/resume/data/defaultResume.js
- src/resume/hooks/useResume.js
- src/resume/pages/ResumeBuilder.jsx
- src/resume/pages/ResumePreview.jsx
- src/resume/pages/ResumeTemplates.jsx
- src/resume/renderer/TemplateRenderer.jsx
- src/resume/templates/CorporateTemplate.jsx
- src/resume/templates/MinimalTemplate.jsx
- src/resume/templates/ModernTemplate.jsx
- src/resume/utils/exportPdf.js

The old defaultResume.js was also unreferenced; current defaults come from workspace.js. No shared data module, schema version, Firebase credential/configuration path, API client or persistence behavior was replaced.

## Routes

/dashboard is the overview; /dashboard/profile, /dashboard/projects, /dashboard/resumes and /dashboard/settings are the workspace collections and controls. /resume/:id is the only editor entry. Both /resume/new and /dashboard/create redirect to resume management. /admin requires Owner authorization on the server. Public 404 offers Home and Sign in, or Dashboard for signed-in users.

## Final responsive repair

Home nested 40px horizontal padding inside the public layout, then embedded pricing with further padding, non-wrapping cycle controls and intrinsic grid widths. At 360px this overflowed the main content. Home now uses responsive gutters; Pricing uses a semantic section, wrapping cycle controls, a shrinkable single-column grid, smaller mobile card padding and responsive headings. No global overflow-hiding rule was added.

Profile and project EntryEditor disclosure state is independent of edited field values, preventing an editor from closing while a user types. The data schema is unchanged. Final validation is recorded in [PRODUCT-POLISH-VERIFICATION.md](PRODUCT-POLISH-VERIFICATION.md).

Latest main documentation update `89a351a44b72a5f37ac1a6fd0f7cf53811615c03` (README portfolio polish) was inspected and merged during delivery. Its author/studio content is preserved; application code is unchanged by that merge.
