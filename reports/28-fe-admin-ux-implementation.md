# Implementation — 28-fe-admin-ux

Date:2026-11-06. Plan: plans/28-fe-admin-ux.md. Scope: Admin desktop UI/UX.

## Delivered

Admin Modal adapter reuses native Dialog rather than changing the shared Public/Teacher/Student modal. CRUD pages now use named confirmation, grouped account actions, skeleton/empty/retry and toast. Student/teacher profiles and class roster have dedicated protected routes; add/withdraw uses existing endpoints. Courses use cards. Payments has a compact table and filters across all search-result pages, with modal/selection locked while saving. Dashboard class links/date heading and Reports6/12/24months/data table are implemented.

## Validation

- npm run build/typecheck: PASS.
- npm run lint:0errors,1existing AuthContext warning.
- verify-admin.mjs:28PASS; verify-ui.mjs:28PASS; verify-blog.mjs:16PASS.
- verify-admin-ux.mjs:17desktop browser checks PASS: focus/Tab/Escape, profile navigation/URL sections, roster eligibility, named confirmations, return focus, filtering across120fixture payments, period selection, no uncaught errors and no API mutation attempts.
- Browser traffic intercepted with fixtures; no mutation to real EnglishCenterDB. Backend, auth and dependencies unchanged.
- Review:PASS, see 28-fe-admin-ux-review.md. Corrected async edit-loading cancellation and stale reset-password field errors; browser QA also identified a grid intrinsic-width problem fixed with minmax(0,1fr).

## Deferred / limitations

User explicitly deferred further mobile UI/UX. Mobile to-do is in docs/admin/FE-ADMIN.md; browser tests default desktop, mobile requires ADMIN_UX_MOBILE=1 for a future pass. Earlier shared layout fixes are retained, not counted as mobile acceptance. Physical receipt print QA and real mutation integration tests remain pending. API capacity fields are not fabricated; payments date/method filtering loads the full API search result and may be slower for large datasets. Blog remains the existing demo workflow.
