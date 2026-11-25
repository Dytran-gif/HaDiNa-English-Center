namespace EnglishCenter.Api.Services;

// Lịch của một lớp tính từ lịch tuần (ClassSchedules) trong khoảng StartDate–EndDate.
// Dùng chung cho Student và Teacher để hai bên luôn cùng số buổi / trạng thái lớp.
// (Không có bảng buổi học riêng; EndDate do Admin tính từ tổng số buổi khi tạo lớp.)
public static class ClassCalendar
{
    public const string Upcoming = "Upcoming";   // sắp học
    public const string Ongoing = "Ongoing";     // đang học
    public const string Finished = "Finished";   // đã học xong

    public static string Status(DateOnly start, DateOnly end, DateOnly today) =>
        today < start ? Upcoming : today > end ? Finished : Ongoing;

    public record Slot(int DayOfWeek, TimeOnly StartTime, TimeOnly EndTime);
    public record Session(DateOnly Date, Slot Slot, int Number);

    // Mọi buổi học của lớp theo thứ tự (1 buổi = 1 ca trong lịch tuần ở 1 ngày)
    public static IEnumerable<Session> Sessions(DateOnly start, DateOnly end, IEnumerable<Slot> slots)
    {
        var byDay = slots.GroupBy(s => s.DayOfWeek)
            .ToDictionary(g => g.Key, g => g.OrderBy(s => s.StartTime).ToList());
        if (byDay.Count == 0) yield break;
        var n = 0;
        for (var d = start; d <= end; d = d.AddDays(1))
            if (byDay.TryGetValue(AppTime.DayNo(d), out var list))
                foreach (var s in list) yield return new Session(d, s, ++n);
    }

    public static int TotalSessions(DateOnly start, DateOnly end, IEnumerable<Slot> slots) =>
        Sessions(start, end, slots).Count();

    // Số buổi đã diễn ra tính đến hết ngày today
    public static int DoneSessions(DateOnly start, DateOnly end, IEnumerable<Slot> slots, DateOnly today) =>
        Sessions(start, end < today ? end : today, slots).Count();

    // Buổi kế tiếp (chưa kết thúc) tính từ thời điểm now
    public static Session? Next(DateOnly start, DateOnly end, IEnumerable<Slot> slots, DateTime now)
    {
        var today = DateOnly.FromDateTime(now);
        var time = TimeOnly.FromDateTime(now);
        return Sessions(start, end, slots)
            .FirstOrDefault(s => s.Date > today || (s.Date == today && s.Slot.EndTime > time));
    }

    // Hai lớp có trùng giờ học không: cùng thứ, giờ chồng nhau và khoảng ngày của hai lớp chồng nhau
    public static bool Overlaps(DateOnly aStart, DateOnly aEnd, IEnumerable<Slot> aSlots,
        DateOnly bStart, DateOnly bEnd, IEnumerable<Slot> bSlots, out Slot? clash)
    {
        clash = null;
        if (aStart > bEnd || bStart > aEnd) return false;
        foreach (var a in aSlots)
            foreach (var b in bSlots)
                if (a.DayOfWeek == b.DayOfWeek && a.StartTime < b.EndTime && b.StartTime < a.EndTime)
                {
                    clash = b;
                    return true;
                }
        return false;
    }

    public static string DayNameVi(int d) => d == 7 ? "Chủ nhật" : $"Thứ {d + 1}";
}
