# Public teachers — shared with Admin

## Admin teacher photos and visibility

- Admin list includes photo column; existing teacher edit dialog and teacher profile page include TeacherPhoto upload (JPG/PNG/WebP up to5MB). Create a teacher first, then edit/upload.
- POST /api/admin/teachers/{id}/avatar requires admin, validates size/MIME/signature and generates a filename under uploads/teacher-avatars/{id}. Saves Users.AvatarUrl; Admin teacher response includes avatarUrl. No migration needed.
- Public uses this same Users.AvatarUrl. Uploads and successful Admin mutations broadcast a same-tab event and cross-tab revision key. Public teacher views refetch on changes/focus, with no-store requests; no copied mock photo data.
- Locked, OnLeave, deleted or unpublished/unlinked teachers are absent from public lists and detail returns404. Unlock restores eligible teachers. Delete still rejects teachers assigned to classes; an unsuccessful deletion does not hide an existing teacher.
- Live QA passed: upload200 + DB/Public URL equality + image200; invalid400/anonymous401; lock hides list/detail, unlock restores photo, successful delete hides list/detail. QA user/teacher/orphan profile/photo cleaned up. FE/BE build passed, existing lint warnings only. No browser visual acceptance claimed.

Updated2026-11-26. Public teacher identity now comes from the same Teachers/Users records as Admin. PublicTeacherProfiles is linked metadata (slug, biography, publication), not a standalone directory of sample teachers.

## Qualification-only detail page

Teacher detail displays photo/name and only3sections: Bằng cấp, Trình độ/chuyên môn, Kinh nghiệm giảng dạy. Removed course list, biography and review/rating sections from this page. Missing values display Chưa cập nhật.

Public DTO adds degree, specialty, teaching_experience from Teachers. Migration20261126015924_TeacherTeachingExperience adds nullable nvarchar(1000) TeachingExperience. Admin teacher create/update/response and editor include teachingExperience (max1000); Degree and Specialty remain existing fields. No invented experience inferred from hire date.

Local backup verified before migration; migration applied. Live Admin save/public read and max-length400 verified; original teacher data restored afterward. FE/BE build passed, existing lint warnings only. Pull/apply both new migrations on other machines.

- GET /api/public/teachers: published profiles linked to real Teaching teachers whose accounts are unlocked.
- GET /api/public/teachers/{slug}: same visibility rules; missing/orphan/mock slug404.
- teacher_id and account_teacher_id both identify the real Teachers.Id. Full name, title (Degree or Specialty), degree credentials and avatar are read from Teachers/Users. No phone/email/password/account secrets exposed.
- Course links come from that teacher's actual Classes and published Courses. Reviews remain sourced from published real TeacherReviews.
- Adding a teacher through Admin creates its linked public profile in the same SaveChanges transaction; public slug is unique and stable. Admin changes to name/degree/status are reflected on the next public request. OnLeave/locked teachers are hidden. Deleted teachers' detached profiles cannot appear public.
- Public course detail no longer matches a teacher from local course seed IDs; it resolves actual teacher links from live open classes.

## Cleanup / rollout

Apply migration20261126015230_AlignPublicTeachers after pulling. It deletes only5known legacy mock slugs when unlinked, creates linked profiles for existing real teachers, and unpublishes remaining orphans. It does not recreate mocks on Down. Backup before migration if legacy editorial content must be retained.

Removed tools/db/public-teachers sample importer/install script and5bundled photos, so they cannot repopulate the fake directory. Existing user-uploaded avatars are untouched. No new demo users or teachers are seeded.

Local verification: backup COPY_ONLY/CHECKSUM verified;2Teachers →2linked profiles,0known mock rows; public names/IDs match Admin; old5slugs404. Admin create/update/status-change tested with one QA teacher, then teacher/account/orphan QA profile removed. Public returns2real teachers. FE/BE build passed; existing lint warnings only. No browser visual acceptance claimed.
