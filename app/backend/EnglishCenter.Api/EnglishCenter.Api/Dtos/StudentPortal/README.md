# Dtos/StudentPortal/ (CHƯA CÓ CODE)

DTO request cho `api/student/*`, nhóm theo chức năng giống `../TeacherPortal/`:

| File dự kiến | Chứa |
|---|---|
| `ProfileRequests.cs` | `StudentProfileUpdateRequest`, `StudentChangePasswordRequest` |
| `RequestRequests.cs` | `StudentRequestCreateRequest` (type, sessionId, availabilityId, date, startTime, endTime, reason) |
| `SubmissionRequests.cs` | `SubmitAssignmentRequest` (content, audioUrl, answers) |
| `RatingRequests.cs` | `TeacherRatingRequest` (classId, score 1–5, comment) |

Namespace: `EnglishCenter.Api.Dtos.StudentPortal`. Validation message viết tiếng Việt (như `Dtos/Admin/*`).
