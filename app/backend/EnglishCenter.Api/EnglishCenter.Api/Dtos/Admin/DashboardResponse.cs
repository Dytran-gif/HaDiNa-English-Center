namespace EnglishCenter.Api.Dtos.Admin;

public sealed record DashboardKpisResponse(int ActiveStudents, int OpenClasses, int Teachers,
    decimal MonthlyRevenue, decimal TotalRevenue);

public sealed record RevenueMonthResponse(string Month, decimal Revenue);

public sealed record RevenueBucket(int Year, int Month, decimal Revenue);
