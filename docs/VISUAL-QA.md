# PersonaCV visual and accessibility QA

Date: 2026-09-20  
Branch: `main`

## Visual system changes

PersonaCV retains a calm document-first visual system with consistent surfaces, spacing, control heights, radii, borders, focus rings, destructive states, and loading feedback. The document canvas remains visually dominant. Loading skeletons use the same geometry and design tokens as their final surfaces.

Contrast defects found on the Home/Features marketing surfaces were corrected by darkening muted blue text and using opaque white text on the feature panel. Direct-editor focus treatment is visible in the application and omitted from print. Reduced-motion styling disables skeleton and transition animation.

## Automated responsive inspection

The final browser run inspected Home, Features, Pricing, Contact, Privacy, Terms, Login, Register, Dashboard, Master Profile, Projects, Resumes, Editor, Settings, Admin, and the not-found path as applicable.

Viewport coverage:

- 360×800
- 390×844
- 768×1024
- 1024×768
- 1280×800
- 1366×900
- 1440×1000
- 1920×1080

Results: 120/120 route/viewport combinations completed with zero horizontal overflow and zero unexpected browser console/page errors. Screenshots for the 360 px and 1440 px route passes are retained in the ignored local `.artifacts/final-browser` directory so test evidence does not inflate the production bundle.

## Accessibility inspection

Automated accessibility checks ran on representative public, auth, workspace, editor, settings, admin, and error states at 360, 768, and 1440 widths. The final run reported zero detected violations. Keyboard tests covered protected navigation, menus/dialog Escape behavior, direct-edit fields, save/undo/redo shortcuts, mobile mode switching, and focus restoration. Accessible names, form labels, alert/status regions, headings, landmarks, validation feedback, and reduced motion were inspected.

The browser harness also verified the mobile menu and Escape focus return, editor toolbar overflow, document centering, inspector behavior, modal sizing, long-document rendering, and print isolation.

## Limitations

- Automated checks supplement rather than certify WCAG 2.2 AA. A production screen-reader pass with NVDA/VoiceOver and manual contrast review remains advisable before broad launch.
- A separate browser-level 200% zoom run was not recorded. The responsive matrix covers equivalent constrained widths and the editor's 60–140% document zoom, but production QA should still perform the requested native 200% browser-zoom spot check.
- Screenshots were inspected locally and are intentionally untracked build evidence.

