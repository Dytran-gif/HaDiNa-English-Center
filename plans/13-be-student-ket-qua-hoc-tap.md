# 13 — BE Student: điểm, chuyên cần, nhận xét, đánh giá giáo viên

- **Loại:** backlog
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 10
- **Độ khó:** Vừa

## Mục tiêu
Trang "Feedback / Kết quả" của học viên: sổ điểm của mình, chuyên cần, nhận xét định kỳ, band tiến bộ, cộng chức năng đánh giá giáo viên.

## Phạm vi (xem `docs/api/STUDENT_API.md` §5)
- `GET /api/student/classes/{id}/grades`: dùng `GradebookService.BuildAsync(classId, onlyStudentId: StudentId)`
- `GET /api/student/classes/{id}/attendance`: từng buổi + tỉ lệ (dùng `StatsService.AttendanceAsync`)
- `GET /api/student/progress`: `bandHistory`, `targetBand`, `examHistory` (chỉ dữ liệu đã công bố)
- `GET /api/student/reviews?classId=`: `StudentReview` GV viết cho mình
- `GET /api/student/final-report?classId=` (+ `/print`): tái dùng logic của `TeacherStudentsController`. Nếu cần thì tách ra service dùng chung (ảnh hưởng vùng Teacher, báo Duy).
- `POST /api/student/teacher-ratings` với `{ classId, score: 1-5, comment }`: mỗi lớp 1 lần, ghi `TeacherRatings`

## Đọc trước khi làm
- `Services/GradebookService.cs`, `Services/StatsService.cs`
- `Controllers/TeacherPortal/TeacherStudentsController.cs`, `ExamsController.cs`
- `Entities/StudentReview.cs`, `Entities/Exam.cs`

## Tiêu chí hoàn thành
- [ ] Sổ điểm học viên khớp hàng của mình trong sổ điểm GV
- [ ] Không xem được điểm / nhận xét của học viên khác
- [ ] Đánh giá GV hiện ở `GET /api/teacher/profile/ratings`
- [ ] `dotnet build` xanh
