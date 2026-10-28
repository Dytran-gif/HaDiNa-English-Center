# 90 — Project test xUnit cho service thuần (không bắt buộc)

- **Loại:** backlog
- **Vùng:** Chung
- **Người làm:** —
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Phạm vi
- `app/backend/EnglishCenter.Api/EnglishCenter.Api.Tests/` (xUnit), thêm vào `EnglishCenter.Api.slnx` (là package NuGet mới, cần bàn nhóm)
- Test hàm static: `IeltsBands.Overall` / `IsValid`, `SessionService.StatusOf`, `SessionService.IsAttendanceLocked`, `SubmissionService.CountWords` / `GradeQuiz` (đáp án nhiều lựa chọn `colour|color`), `ScheduleService.ComputeEndDate`
- Có test rồi thì thêm `dotnet test` vào `/validate`, `.claude/hooks/stop_validate.py` và bảng lệnh trong `CLAUDE.md`

## Tiêu chí hoàn thành
- [ ] `dotnet test` xanh, ít nhất 15 test
