# Public teacher profiles

Anonymous, read-only endpoints backed by SQL Server `PublicTeacherProfiles`.

- `GET /api/public/teachers`: array of published profiles, ordered by ID.
- `GET /api/public/teachers/{slug}`: one published profile; 404 `{message}` when absent/unpublished.
- Response fields: `teacher_id`, `slug`, `full_name`, `title`, `bio`, `credentials` (string array), `initials`, `avatar` (nullable URL).
- No email, phone, account IDs, password hashes, token versions or ratings exposed.
- Public profiles are editorial website content, separate from operational `Teachers` accounts. Existing numeric course references still refer to imported public profile IDs, not operational Teacher IDs; public course content remains local.

## Provision another local machine

Run `powershell -File tools/db/public-teachers/install.ps1` from the repository root after configuring the local database. Requires SQL Server Windows authentication, sqlcmd and dotnet-ef. Optional `-Server`/`-Database` select the target explicitly for both migration and import. Review pending migrations before running on an existing database.

The script applies migrations, copies the bundled images to backend `wwwroot/uploads/public-teachers`, then imports the five existing website profiles in a transaction. Existing slugs are not overwritten; conflicting IDs abort. It never creates login accounts or changes operational Teachers. Migration, import script and source images must travel together.

Updating Admin Teachers does not yet edit these editorial profiles; no profile-management UI is included in this change.


## Cập nhật 2026-11-25
Xem [CAP-NHAT-2026-11-25.md](CAP-NHAT-2026-11-25.md) — mã lớp, học phí nhiều phiếu/xác nhận, đăng ký theo lớp, đánh giá GV. Các mục cũ mâu thuẫn với file đó coi như đã thay.
