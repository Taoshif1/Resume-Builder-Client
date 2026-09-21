# PersonaCV document editor audit

Date: 2026-09-21  
Branch: `main`

## Result

The editor now treats the rendered resume as the primary surface while preserving PersonaCV's structured workspace and template renderer. Users can edit name, headline, contact summary content, experience roles/companies/descriptions/bullets, education degree/institution, and project titles/descriptions/bullets/technology directly on the paper. Direct edits produce resume-specific structured overrides; they never persist generated HTML or mutate Master Profile source records.

Paste is reduced to normalized plain text, line breaks are normalized, and edits commit on blur to avoid caret jumps. Editable fields have keyboard-accessible textbox names and visible editor-only focus treatment. Selection and editing affordances are excluded from print/PDF output.

The top toolbar exposes document identity, save state, undo/redo, template and document design controls, zoom, paper configuration, preview, PDF export, and related actions. Structured controls remain in the inspector. Mobile uses explicit Edit and Preview modes rather than shrinking the full desktop workspace.

## History, persistence, and conflicts

- Document mutations share a bounded 50-state undo/redo history.
- Ctrl/Cmd+S saves, Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z redoes, and Escape leaves the active inline field.
- Autosave is debounced by 1.5 seconds and never issues one request per keystroke.
- Failed saves retain local edits and allow retry.
- Revision conflicts surface as `Conflict detected`; stale data is not silently written.
- The existing navigation protection continues to warn when meaningful local changes remain.

## Templates and PDF parity

Modern, Minimal, Corporate, Compact, Classic, and Academic use the same structured document projection. Editor and PDF share template, typography, spacing, accent, order, visibility, margin, and paper configuration. Zoom from 60% through 140% changes only the editing presentation.

Automated PDF matrices covered every template and A4/Letter/Legal output, selectable Unicode text, links, page bounds, and multiple typography/spacing combinations. Browser print checks confirmed exact paper dimensions and document-only output. Authenticated downloads were checked for `%PDF-` bytes.

## Tests

- Unit tests verify plain-text normalization and that direct editing changes only variant overrides.
- Browser journeys directly edited the name and summary, exercised undo/redo, autosave, reload persistence, template/design/paper changes, responsive Edit/Preview modes, save failure/retry, and PDF export.
- Stress fixtures covered long and multipage data, many bullets, Unicode/accented characters, links, and empty/partial records. PDF tests generated documents across all templates and document styles.
- Checkpoint G results: lint passed; 101/101 unit/API tests passed (0 failed, 0 skipped); build passed; production dependency audit found 0 vulnerabilities.
- `npm run test:e2e` passed: 12 journeys, 120 responsive combinations, 45 axe scans with 0 violations, 0 horizontal overflow, 0 uncaught page errors and 0 captured React key warnings.
- Fixed duplicate date-field React keys by including collection, source ID, and field identity. A projection-based regression checks uniqueness and stability without changing persisted IDs. Fixed the tablet header's 12px overflow.
- Repository-owned Playwright, axe-core and Firebase CLI run against the local `demo-personacv` Auth/Firestore emulators. Java 21 is required; use `npm run test:e2e:install` if system Chrome is unavailable.

## Deliberate scope and limitations

- Certifications, languages, volunteering, and custom entries continue to use the structured inspector rather than every value becoming inline-editable. This keeps validation and complex collection controls reliable.
- Section insertion remains an accessible Add Section workflow; a slash-command palette was not added because it would duplicate the established control without improving the current data model.
- A dedicated document outline supports section selection, current-section indication and hidden-section restoration. Contextual actions support section ordering/visibility and entry editing, movement, duplication, customization reset and removal from a document. Add/restore workflows link to source-entry creation in Master Profile. Focused browser coverage of these newer capabilities is pending Checkpoint H; this paragraph describes available functionality, not completed browser verification.
- PDF content and dimensions were checked programmatically and through browser-generated artifacts. Final production printer-driver rendering still requires a manual visual check on the deployed build.
