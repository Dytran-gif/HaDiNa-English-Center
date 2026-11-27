# Course requests and Admin class assignment

Scope was confirmed by user: adjust public class columns/remove per-class registration, and replace student self-enrollment with course requests for Admin assignment.

- Public class labels/values align in stable columns; teacher is a text link rather than padded button. All eligible teachers for the course are shown. No class signup CTA remains.
- Added CourseRegistrations table/status lifecycle, Student own list/create/cancel and Admin pending list/assign APIs. Student legacy POST enrollments now returns403. Existing Enrollment GET/history/tuition remain intact.
- Pending requests are idempotent, do not consume capacity or create fees. Admin assignment validates requested course, capacity and conflicts, snapshots current server tuition and commits Enrollment + Assigned together. Manual Admin enrollment also closes matching Pending requests. Cancellation/withdrawal/archive retain consistent request history.
- Class/student lifecycle locks coordinate assignment, cancellation and class edits/deletion; class/course/schedules are freshly read inside transaction. Request creation holds published-course read inside Serializable transaction.
- Admin has Training → Course registrations with same-course class/teacher selection. Student sees waiting requests, then assigned class. Selected course survives account signup/login. Fixed MyCourses initial status filter to follow asynchronously loaded enrollments.
- Backup verified and migration 20261127093719_CourseRegistrationRequests applied. No backfill or edits to existing enrollment/payment records. API examples in CourseRegistrations.http; contract in docs/api/COURSE-REGISTRATIONS.md.

Validation: 38 API checks, 14 Chrome headless checks and VerifyAdmin40 passed; FE lint/typecheck/build and clean BE build; no missing model migration. Existing Fast Refresh/bundle warnings remain. Browser verified actual public alignment, selected-course login, Student Pending, Admin modal assignment and Student assigned-class view with no runtime exceptions.

Cleanup verified exact IDs/email/name guards: six QA students, six classes, two courses, nine request records and five enrollments removed; no payment was created by QA. Original physical totals remain 4 students, 20 enrollments and 19 payments. One real request created through another live session was preserved.

No commits/pushes performed. Deploy FE, BE and migration together; no websocket/polling added.
