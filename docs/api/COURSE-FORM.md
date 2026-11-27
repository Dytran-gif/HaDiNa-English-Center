# Simplified Admin course form — 2026-11-27

Removed from the Admin editor: Code, Slug, IsPublished, ImageUrl. Keep normal course name/bands/session counts/tuition/discount/description inputs.

These metadata fields remain in the database and API because class codes, public course URLs/visibility and course pictures depend on them. No schema migration or data deletion.

- Create without metadata: existing generator assigns unique code/slug; publication defaults true, image defaults null.
- Update without Code/Slug: existing values preserved, including on name change. Existing public URLs and class-code prefix remain stable; existing class codes are never regenerated.
- IsPublished is now nullable in CourseRequest: omitted/null preserves on update, defaults true on create. Explicit true/false remains supported for API clients.
- ImageUrl setter tracks JSON property presence (flag JsonIgnored): omission preserves existing image; explicit null/empty clears it; a supplied URL updates it. Prevents simplified form from erasing pictures.
- Existing class/enrollment references use IDs; tuition changes continue to affect only future enrollment snapshots. No class/public endpoints removed.

Verified: FE build/typecheck and BE build pass; lint only existing warnings. Live API test created temporary courses, verified auto code/slug, omitted-field preservation (including an intentionally hidden course), explicit metadata compatibility and public route visibility. Test courses deleted in finally; existing courses/classes untouched. No browser visual QA claimed.
