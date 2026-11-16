namespace EnglishCenter.Api.Services;

// Giờ nghiệp vụ trung tâm: Việt Nam (UTC+7), không phụ thuộc timezone máy chủ.
public static class AppTime
{
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.CreateCustomTimeZone(
        "Vietnam", TimeSpan.FromHours(7), "Vietnam", "Vietnam");
    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);
    public static DateOnly Today => DateOnly.FromDateTime(Now);

    public static DateTime At(DateOnly date, TimeOnly time) => date.ToDateTime(time);

    // Thứ Hai = 1 ... Chủ nhật = 7 (giống quy ước ClassSchedules.DayOfWeek)
    public static int DayNo(DateOnly date) => date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;

    // Ngày Thứ Hai của tuần chứa date
    public static DateOnly StartOfWeek(DateOnly date) => date.AddDays(1 - DayNo(date));
}
