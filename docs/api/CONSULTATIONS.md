# Consultation requests

## Public submission

`POST /api/public/consultations` (anonymous)

JSON: `submissionId` (nonempty GUID), `fullName` (required, max150), `phone` (required, max30, 8–15 digits; optional formatting), `email` (valid email, max255), `courseSlug` (lowercase letters/digits/hyphens, max150), `courseName` (required, max200).

Returns 201 `{message}` after a successful DB save; repeating an existing submission ID returns 200 and does not create another row. No personal data is returned. Invalid fields return 400 validation ProblemDetails. No anonymous GET/list endpoint exists.

Course slug/name are a snapshot of the public course selection, which currently comes from the website catalog, not a foreign key to operational Courses.

## Admin list

`GET /api/admin/consultations?search=&page=1&pageSize=10`

Requires a valid admin JWT. Anonymous callers receive 401; other roles receive 403. Search matches name, phone, email and course name using the existing accent-insensitive search helper. Maximum search length200; pageSize1–100. Pages clamp to the last valid page.

Response: `{items:[{id,fullName,phone,email,courseName,createdAt}],total,page,pageSize,totalPages}`. Newest first, stable secondary sort by ID. `createdAt` uses Vietnam business time, without Z, consistent with other Admin data.

## Database / UI

Table `ConsultationRequests`; migration `20261125023432_ConsultationRequests`. Unique SubmissionId prevents duplicate retry inserts; CreatedAt indexed. Apply committed migrations with `dotnet ef database update` after pulling on another machine. No sample customer records are seeded.

Homepage form calls the public API; successful response shows confirmation, failures retain input. Editing input generates a new submission ID. Admin menu: Nội dung → Yêu cầu tư vấn (`/admin/consultations`), with search, paging, reload, loading/error/empty states.

This change covers homepage consultation requests only. The separate Contact page form remains unchanged. No editing, deletion, contact-status workflow, email notification or export endpoint is introduced.
