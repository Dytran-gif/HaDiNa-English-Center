# Public homepage review — 2026-11-09

Scope: source review of Home sections, About, Courses, Teachers, Blog, Contact and shared public theme. Desktop improvements; mobile remains deferred. Not a complete browser acceptance audit.

## Implemented
- Replace decorative HAPPY block, unverified score highlights and partner claims in Hero with a three-step learning roadmap and clearer course-selection actions.
- Keep existing public branding and scope new styles to page-shell; no Admin/Teacher/Student token changes.
- Add HomeFaq with native keyboard-accessible disclosure controls and contact link.
- Add an in-page anchor for the course survey.
- Courses/Blog category filters expose selected state with aria-pressed.
- RegisterCta and Contact no longer claim successful server delivery or a 24-hour response when they only update local React state; disclose missing backend and illustrative contact information.
- Reveal falls back to visible content when IntersectionObserver is unavailable.

## Validation
- npm run build: PASS (includes TypeScript); existing bundle-size warning.
- npm run lint: no errors, existing AuthContext Fast Refresh warning.
- No new packages or backend/database changes.
- Browser visual checks and form submission to a real backend not performed.

## Remaining
- Public course/teacher/blog catalogs and statistics/testimonials still use local content; confirm production data, claims and actual contact details before publishing.
- Consultation/contact APIs need implementation before collecting real requests.
- Mobile polish and full browser/keyboard acceptance remain separate work.
