# Ngày giờ

## Luật vàng

**Toàn hệ thống dùng giờ địa phương của trung tâm (Việt Nam, UTC+7). Không dùng UTC, không gửi `Z`.**

| Kiểu | C# | JSON | Ví dụ |
|---|---|---|---|
| Ngày | `DateOnly` | `"yyyy-MM-dd"` | `"2026-11-05"` |
| Giờ | `TimeOnly` | `"HH:mm:ss"` | `"18:00:00"` |
| Thời điểm | `DateTime` (Kind = Local/Unspecified) | `"yyyy-MM-ddTHH:mm:ss"` | `"2026-11-10T23:59:00"` |

Ngoại lệ đã có sẵn: `User.CreatedAt` có default `SYSUTCDATETIME()` (chỉ để log, không hiển thị như giờ nghiệp vụ).

## Backend: dùng `AppTime` (`Services/SessionService.cs`)

```csharp
AppTime.Now                    // DateTime hiện tại
AppTime.Today                  // DateOnly hôm nay
AppTime.At(date, time)         // ghép DateOnly + TimeOnly → DateTime
AppTime.DayNo(date)            // Thứ Hai = 1 … Chủ nhật = 7 (khớp ClassSchedule.DayOfWeek)
AppTime.StartOfWeek(date)      // Thứ Hai của tuần
```
Không gọi `DateTime.Now`/`DateTime.UtcNow` trực tiếp trong controller mới.

## Mốc nghiệp vụ (hằng số, đừng hardcode lại)

| Luật | Ở đâu |
|---|---|
| Điểm danh mở trước giờ học 30 phút | `SessionService.AttendanceOpenMinutesBefore` |
| Điểm danh khóa 48 giờ sau khi buổi kết thúc | `SessionService.AttendanceLockHours` |
| Admin mở lại điểm danh thì được sửa trong 24 giờ | `TeacherRequestsController.UnlockHours` |
| Bài chưa chấm sau 24 giờ = trễ hạn chấm | `SubmissionService.GradingDueHours` |
| Trạng thái buổi `Upcoming/Ongoing/Done/Cancelled` | `SessionService.StatusOf(...)` |
| Trạng thái lớp `Upcoming/Ongoing/Finished` | `TeacherControllerBase.ClassStatus(...)` |

## Frontend

- Hiển thị: tách chuỗi trực tiếp (`"2026-11-05"` → `05/11/2026`) hoặc `new Date("2026-11-05T18:00:00")`. Chuỗi không có `Z` nên trình duyệt hiểu là giờ máy, đúng giờ VN.
- Gửi lên: **không** dùng `toISOString()` (ra UTC + `Z`). Format tay `yyyy-MM-ddTHH:mm:ss`.
- Gom helper vào một file dùng chung khi cần (vd `src/services/datetime.ts` hoặc `src/utils/`). Báo nhóm vì đây là file dùng chung.
- Tuần bắt đầu **Thứ Hai**.
