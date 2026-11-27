# Simplified Admin course form — 2026-11-27

Removed from the Admin editor: Code, Slug, IsPublished, ImageUrl. Keep normal course name/bands/session counts/tuition/discount/description inputs.

These metadata fields remain in the database and API because course search, public course URLs/visibility and course pictures depend on them. No schema migration or data deletion.

- Create without metadata: existing generator assigns unique code/slug; publication defaults true, image defaults null.
- Update without Code/Slug: existing values preserved, including on name change. Existing public URLs remain stable. Class codes were subsequently removed; see CLASS-FIELDS.md.
- IsPublished is now nullable in CourseRequest: omitted/null preserves on update, defaults true on create. Explicit true/false remains supported for API clients.
- ImageUrl setter tracks JSON property presence (flag JsonIgnored): omission preserves existing image; explicit null/empty clears it; a supplied URL updates it. Prevents simplified form from erasing pictures.
- Existing class/enrollment references use IDs; tuition changes continue to affect only future enrollment snapshots. No class/public endpoints removed.

Verified: FE build/typecheck and BE build pass; lint only existing warnings. Live API test created temporary courses, verified auto code/slug, omitted-field preservation (including an intentionally hidden course), explicit metadata compatibility and public route visibility. Test courses deleted in finally; existing courses/classes untouched. No browser visual QA claimed.

## Band and tuition rules ? 2026-11-27

- FE/API require 0 <= BandFrom < BandTo <= 9, in steps of 0.5. Decimal Range validation preserves fractional values, including tuition/discount boundaries. Tuition 0?1,000,000,000 VND; discount 0?50%.
- Every Admin course endpoint requires signed admin role; anonymous mutations return 401 and student/teacher return 403. Public endpoints cannot write courses. Student enrollment reads price from DB, never client tuition; existing enrollment snapshots stay unchanged.
- Migration `20261127073940_StrictCourseBands` enforces strict band/step checks in SQL. Corrects only confirmed legacy ID17/name112111 and ID18/name11111 from 0 -> 0 to 5 -> 6; other invalid legacy data blocks migration for manual correction. Down restores old check without reversing confirmed data corrections.
- Local EnglishCenterDB backed up COPY_ONLY/CHECKSUM and verified, then migration applied; constraint trusted. Both legacy records now 5 -> 6. Live API tested invalid bands/decimal price bounds, Admin price persistence, guest/teacher/student denial; QA records cleaned.
