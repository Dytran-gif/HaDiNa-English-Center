# Student self-registration

`POST /api/auth/register` — anonymous, creates only role `student`.

JSON: `fullName` (required, max150), `email` (required valid email, max255), `phone` (required, max20, 8–15 digits with optional separators), `password` (8–72 characters, at most72 UTF-8 bytes), `confirmPassword` (must match).

Response201: `{message,code}`. Response400: validation ProblemDetails. Response409: email already used or code allocation conflicted repeatedly. No password/hash/JWT returned. After success, sign in using existing POST /api/auth/login.

- Email is trimmed/lowercased before saving; login also trims email.
- User and linked Student insert in one SaveChanges transaction, preventing orphan accounts.
- Password BCrypt-hashed; role is always student regardless of extra client properties. User unlocked, tokenVersion0; Student status Studying, created time from AppTime.Now.
- Student codes use shared StudentCodeGenerator for self-registration and Admin create. It reads numeric suffixes rather than lexicographic maximum (HV10000 after HV9999). Public registration retries unique-code collisions and returns409 for duplicate email.
- Existing Users/Students schema is reused: no migration or seed required.
- Registration does not create enrollments, assign classes, create payments or charge tuition. Remaining personal fields can be updated later through existing management flows.

Frontend /dang-ky now submits to the API through services/registerStudent.ts; required fields, password confirmation, busy/disabled states, field/server errors and real success confirmation with student code. Password fields cleared after successful registration. Failed submissions retain input. Existing AuthContext/login/role protection retained.

## Verification on local EnglishCenterDB, 2026-11-25

- FE build/typecheck passed; lint only existing AuthContext warning; BE build0errors/0warnings.
- Live API tests: invalid name/email/phone/password/confirmation400; registration201; case-insensitive duplicate409; student login200; attempted role escalation still student; student cannot access Admin students403.
- Existing Admin API search returned the new student's actual profile/code/phone.
- Two concurrent registrations succeeded with distinct codes.
- SQL verification:3test Users,3linked Students, BCrypt password hashes; exact QA profiles/accounts removed afterward, remaining test users0.
- BE restarted at localhost5220 with Database:AutoSetup=false. No browser visual acceptance claimed.


## Cập nhật 2026-11-25
Xem [CAP-NHAT-2026-11-25.md](CAP-NHAT-2026-11-25.md) — mã lớp, học phí nhiều phiếu/xác nhận, đăng ký theo lớp, đánh giá GV. Các mục cũ mâu thuẫn với file đó coi như đã thay.
