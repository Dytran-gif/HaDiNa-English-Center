# 12 — BE Student: bài tập + nộp bài

- **Loại:** backlog
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 10
- **Độ khó:** Vừa

## Mục tiêu
Học viên thấy bài được giao, nộp Writing/Speaking/Quiz và xem kết quả sau khi GV công bố.

## Phạm vi (xem `docs/api/STUDENT_API.md` §4)
- `GET /api/student/assignments?classId=&state=todo|submitted|graded`: chỉ bài giao cho mình (`AssignmentStudents` hoặc `assignToAll`). Dùng `SubmissionService.AssignedStudentIdsAsync`.
- `GET /api/student/assignments/{id}`: đề, hạn, `minWords`, file đính kèm, câu hỏi Quiz **không kèm `correctAnswer`**, lịch sử các lần nộp của mình.
- `POST /api/student/assignments/{id}/submit` với `{ content?, audioUrl?, answers? }`. **Bắt buộc** gọi `SubmissionService.SubmitAsync(...)`, hàm này đã xử lý hạn, nộp lại, đếm từ, tự chấm Quiz và báo GV.
- `POST /api/student/files?folder=submissions`: upload audio Speaking (dùng `FileStorageService`).
- `GET /api/student/submissions/{id}`: chỉ hiện điểm, nhận xét, annotation khi `Status = Published`. `Returned` thì hiện `returnNote`.

## Đọc trước khi làm
- `Services/SubmissionService.cs` (toàn bộ)
- `Entities/Assignment.cs`, `Entities/Submission.cs`
- `Controllers/TeacherPortal/AssignmentsController.cs`, `GradingController.cs` (để không lộ dữ liệu chấm nháp)

## Tiêu chí hoàn thành
- [ ] Bài nộp hiện ở `GET /api/teacher/grading/submissions?status=pending`
- [ ] Response Quiz không lộ đáp án. Bài `Draft` không lộ điểm.
- [ ] Nộp bài lớp mình không học thì 403/404
- [ ] `dotnet build` xanh
