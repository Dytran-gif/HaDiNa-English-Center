# Delete locked or dropped students

User requested deletion when account is locked OR student status is Dropped, even with enrollments, and automatic class counts afterward.

- Added nullable Student.DeletedAt; archive operational record without physically removing financial or academic history. No global query filter, so receipts/revenue still join original records.
- Delete runs transactionally under a Student row lock: checks OR eligibility, marks enrollments Dropped, rejects pending payments, locks login and increments token version. Existing confirmed payments remain unchanged; active-enrollment counts automatically update for every class/course.
- Archived students are absent from operational Admin/Teacher lists and cannot be edited, unlocked, enrolled or withdrawn. Login, JWT and Student API independently reject archived profiles.
- Student lifecycle operations and collection/transfer confirmation share row locking to protect deletion against concurrent updates. Historical refunds remain supported.
- FE disables delete unless eligible, explains retained history, and refreshes related Admin queries/public catalog across local events, tab storage and focus. Historical attendance rows remain visible but read-only and excluded from saves of remaining students.
- Migration `20261127084005_ArchiveDeletedStudents` applied locally after verified COPY_ONLY/CHECKSUM backup. Existing DeletedAt values were NULL; no bulk archive executed.

Validation: FE lint/typecheck/build passed with pre-existing warnings; BE build clean; no missing model migration; VerifyAdmin 29 checks pass. Live API tested eligibility for Studying/OnHold/Dropped/locked accounts, multiple classes, repeated/concurrent deletion, session revocation, blocked revival/collection/withdraw, retained receipt and confirmed payments. Three final concurrent delete/confirm/transfer/unlock runs returned no server errors, no pending records after archive, login denied and zero test-class count.

Six temporary QA students plus their two classes/courses, seven enrollments and seven payments were verified and cleaned. All original confirmed payment responses and course metadata/prices matched baseline. During testing original Student ID1 was archived through a separate live request; that user change was preserved, so active counts/list totals intentionally differ from initial baseline. Original physical totals remain 4 students, 20 enrollments and 19 payments after QA cleanup.

No browser visual verification claimed. See docs/api/STUDENT-DELETION.md. No commit/push performed.
