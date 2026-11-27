# Remove class code and online meeting URL

User authorized removing both form fields and their database columns.

- Removed Code/MeetingUrl from CourseClass, EF configuration, class request/response DTOs and create/update form. Removed class-code generation and its unique index.
- Replaced class-code references with class names in Admin, Teacher, Student and Public API projections and frontend consumers. Preserved student/course identifiers. Public open-class list keys now use class IDs.
- Removed online-class links/actions from Admin/Teacher/Student views. Class relationships and navigation continue to use IDs.
- Migration: `20261127075745_RemoveClassCodeAndMeetingUrl`. Applied to local EnglishCenterDB after COPY_ONLY/CHECKSUM backup and RESTORE VERIFYONLY. Down recreates unique LOP-ID codes; original removed values require the backup.
- Updated API contracts, HTTP example and handoff. See `docs/api/CLASS-FIELDS.md`.

Validation: FE lint/typecheck/build pass; only existing Fast Refresh/bundle-size warnings. Backend builds; VerifyAdmin 26 checks pass; EF reports no pending model changes.

Live API: all 13 existing class details read successfully with removed fields absent; temporary class create/update without code/URL; temporary student enrollment by ID; Student dashboard/enrollment/tuition/schedule/history/course detail/options/reviews; Teacher classes/detail/schedule/dashboard; Admin payment/receivables/reviews/students/teacher/dashboard; Public courses/reviews all succeeded. QA course/class/student/enrollment cleaned. Database counts before/after: 13 classes, 20 enrollments, 18 schedules, 19 payments. sys.columns confirms both removed columns absent.

No browser visual QA performed. Existing unrelated course-rule changes were already committed by the user during this task; no commits or pushes performed here.
