# Admin personal profile

## Storage

Existing Users table gains nullable `FullName` nvarchar(150) and `Phone` nvarchar(20), migration `20261125082909_AdminUserProfile`. No separate duplicate Admin account table. Existing email/auth/hash/role/token fields remain unchanged; initial names/phones are not invented or seeded.

## API

- `GET /api/admin/profile`: current admin's `{userId,fullName,phone,email,role}`.
- `PUT /api/admin/profile`: `{fullName,phone}`; name required/max150, optional phone max20 with8–15digits and optional separators. Trim input; blank phone stored as null. Returns saved profile.
- Both require role admin. User ID comes exclusively from the JWT NameIdentifier. Additional request IDs/emails/roles are ignored. No password/hash/token-version data exposed.
- Email and role cannot be edited through this endpoint. Existing password change remains separate and only shown on Admin Profile.

## Frontend

- /admin/profile loads DB data with loading/error/retry. Editable name/phone, read-only email; save/cancel, busy/dirty state and field errors.
- After successful save, update local AuthContext profile cache and header immediately. Header also fetches current DB profile when mounted/token changes, so a new login or refresh restores actual name rather than the email placeholder.
- Stale responses cannot overwrite the cached profile of a different signed-in user (userId checked).

## Verified locally 2026-11-25

- Backup before migration: EnglishCenterDB_before_admin_profile_20261125.bak in SQL Server's default backup directory, COPY_ONLY/CHECKSUM, RESTORE VERIFYONLY valid.
- Applied migration: only two nullable Users columns; existing data preserved. BE build0warnings/errors; no pending EF model changes. FE build/typecheck passed; lint only existing AuthContext/LanguageContext warnings.
- Live API tested: anonymous401; invalid name/phone400; own profile PUT200, GET reflects persisted values; supplied foreign userId/email/role cannot change identity or permissions; response excludes secrets.
- Temporary QA name/phone restored to original NULL values afterward; no fabricated personal information retained.
- BE restarted at localhost5220 with Database:AutoSetup=false. No visual browser acceptance claimed.

Other machines must apply the committed migration after pulling. User-owned uncommitted changes elsewhere were preserved.
