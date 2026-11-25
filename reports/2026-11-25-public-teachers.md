# Public Teacher profiles — 2026-11-25

## Outcome
- Real local DB inspected: 2 operational Teachers, neither matches the 5 website profiles. Public profiles were not previously stored in SQL Server.
- Added PublicTeacherProfiles, migration, anonymous read-only list/detail API. Imported all 5 existing website profiles with old IDs/slugs preserved. No login accounts created; operational Teachers unchanged.
- Existing photos copied to backend uploads. Reproducible install script, transactional import and bundled photos in tools/db/public-teachers.
- Public Teachers, About, Header dropdown, TeacherDetail and CourseDetail now read API instead of data/teachers.ts. Removed static teacher dataset and all public teacher star ratings. Loading/error/retry/empty states provided for list/profile pages.
- Admin Teachers and public editorial profiles remain distinct; no editorial management UI was requested or added. Public course assignments still reference local course content and imported public-profile IDs.

## Validation
- Backup COPY_ONLY/CHECKSUM and RESTORE VERIFYONLY passed before migration: SQL Server backup directory, EnglishCenterDB_before_public_teachers_20261125.bak.
- Migration inspected: only new PublicTeacherProfiles table/index. Applied successfully; imported 5 rows. Existing Teachers remains 2, Users remains 7.
- Backend build: 0 warnings/errors. EF pending model changes: none after rebuilding generated migration.
- Frontend build/typecheck passed; lint only existing AuthContext Fast Refresh warning. Existing bundle-size warning remains.
- Live anonymous HTTP: list returns 5 DB profiles; every detail and photo returns 200; absent slug returns 404. No email/phone/password/token/rating fields in output.
- BE restarted on localhost:5220, Development, Database:InitializeOnStartup=false.
- No visual browser acceptance claimed.

API and provisioning instructions: docs/api/PUBLIC-TEACHERS.md. Commit the generated migration and its snapshot together with source/import/photos.
