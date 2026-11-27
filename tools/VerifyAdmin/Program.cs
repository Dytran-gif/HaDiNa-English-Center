using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;
using EnglishCenter.Api.Controllers.Admin;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var passed = 0;
void Check(bool condition, string label) { if (!condition) throw new Exception(label); passed++; Console.WriteLine($"PASS {label}"); }
Check(typeof(CourseClass).GetProperty("Code") == null && typeof(CourseClass).GetProperty("MeetingUrl") == null, "class entity no longer stores code or online URL");
Check(typeof(ClassRequest).GetProperty("Code") == null && typeof(ClassRequest).GetProperty("MeetingUrl") == null, "class editor request excludes removed fields");
Check(typeof(ClassResponse).GetProperty("Code") == null && typeof(ClassResponse).GetProperty("MeetingUrl") == null, "class responses exclude removed fields");
var assembly = typeof(DashboardController).Assembly;
var scheduledClass = new CourseClass { Id = 77, TeacherId = 2, StartDate = new DateOnly(2027, 2, 1), EndDate = new DateOnly(2027, 2, 8),
    Schedules = [new ClassSchedule { DayOfWeek = 1, StartTime = new TimeOnly(18, 0), EndTime = new TimeOnly(19, 30), RoomId = 3 },
        new ClassSchedule { DayOfWeek = 3, StartTime = new TimeOnly(18, 0), EndTime = new TimeOnly(19, 30), RoomId = 4 }] };
ClassRequest OriginalSchedule() => new() { Name = "Renamed", TeacherId = 2, StartDate = scheduledClass.StartDate, EndDate = scheduledClass.EndDate,
    Schedules = scheduledClass.Schedules.Select(s => new ClassScheduleRequest { DayOfWeek = s.DayOfWeek, StartTime = s.StartTime, EndTime = s.EndTime, RoomId = s.RoomId }).ToList() };
var scheduleRequest = OriginalSchedule();
Check(ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "rename does not change the timetable");
scheduleRequest.Schedules.Reverse();
Check(ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "schedule order does not trigger conflict checks");
scheduleRequest = OriginalSchedule(); scheduleRequest.TeacherId++;
Check(!ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "teacher change triggers timetable checks");
scheduleRequest = OriginalSchedule(); scheduleRequest.Schedules[0].RoomId++;
Check(!ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "room change triggers timetable checks");
scheduleRequest = OriginalSchedule(); scheduleRequest.Schedules[0].StartTime = new TimeOnly(18, 1);
Check(!ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "time change triggers timetable checks");
scheduleRequest = OriginalSchedule(); scheduleRequest.StartDate = scheduleRequest.StartDate.AddDays(1);
Check(!ScheduleService.SameSchedule(scheduledClass, scheduleRequest, scheduledClass.EndDate), "start date change triggers timetable checks");
Check(!ScheduleService.SameSchedule(scheduledClass, OriginalSchedule(), scheduledClass.EndDate.AddDays(1)), "effective end date change triggers timetable checks");
var paging = assembly.GetType("EnglishCenter.Api.Controllers.Admin.AdminPaging")!.GetMethod("SlicePage", BindingFlags.Static | BindingFlags.NonPublic)!.MakeGenericMethod(typeof(int));
var numbers = Enumerable.Range(1, 5).AsQueryable();
var overflow = (IQueryable<int>)paging.Invoke(null, [numbers, int.MaxValue, 100, 5])!;
Check(!overflow.Any(), "extreme page returns empty without int overflow");
var ordinary = (IQueryable<int>)paging.Invoke(null, [numbers, 2, 2, 5])!;
Check(ordinary.SequenceEqual([3,4]), "normal page slicing remains correct");
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var valid = "{\"name\":\"Test\",\"bandFrom\":0,\"bandTo\":0.5,\"totalSessions\":1,\"sessionsPerWeek\":1,\"tuition\":0}";
var course = JsonSerializer.Deserialize<CourseRequest>(valid, jsonOptions)!;
Check(Validator.TryValidateObject(course, new ValidationContext(course), new List<ValidationResult>(), true), "valid increasing bands and free tuition allowed");
foreach (var (from, to) in new[] { (5m,5m), (6m,5m), (5.2m,6m), (-0.5m,6m), (5m,9.5m) }) {
    course.BandFrom=from; course.BandTo=to;
    Check(!Validator.TryValidateObject(course,new ValidationContext(course),new List<ValidationResult>(),true), $"invalid bands {from} to {to} rejected");
}
Check(typeof(CoursesController).GetCustomAttribute<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>()?.Roles == "admin", "all course mutations require admin");
foreach (var key in new[] { "bandFrom", "bandTo", "tuition" }) {
    var fields = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(valid)!;
    fields.Remove(key);
    var rejected = false;
    try { JsonSerializer.Deserialize<CourseRequest>(JsonSerializer.Serialize(fields), jsonOptions); }
    catch (JsonException) { rejected = true; }
    Check(rejected, $"omitted {key} rejected rather than defaulting silently to zero");
}
var password = new ChangePasswordRequest { CurrentPassword="samepass8",NewPassword="samepass8",ConfirmPassword="samepass8" };
var errors = new List<ValidationResult>();
Check(!Validator.TryValidateObject(password,new ValidationContext(password),errors,true) && errors.Any(e=>e.MemberNames.Contains("NewPassword")), "same old/new password rejected with field error");
foreach (var length in new[] { 7,8 }) {
    var reset = new ResetPasswordRequest { NewPassword=new string('a',length) };
    Check(Validator.TryValidateObject(reset,new ValidationContext(reset),new List<ValidationResult>(),true)==(length>=8), $"reset password boundary {length}");
}
Check(Math.Abs((AppTime.Now - DateTime.UtcNow.AddHours(7)).TotalSeconds) < 2 && AppTime.Now.Kind == DateTimeKind.Unspecified, "Vietnam business time independent of server timezone, serialized without Z");
var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer("Server=localhost;Database=VerifyOnly;Trusted_Connection=True;TrustServerCertificate=True").Options;
using var db = new AppDbContext(options);
Check(db.Model.FindEntityType(typeof(Student))!.FindProperty(nameof(Student.DeletedAt))!.IsNullable,
    "student archive marker leaves existing records active by default");
var retainedHistorySql = db.Payments.Select(p => new { p.Id, p.Amount, p.Enrollment.Student.FullName }).ToQueryString();
Check(!retainedHistorySql.Contains("DeletedAt"), "financial history is not filtered away when a student is archived");
Check(db.Model.FindEntityType(typeof(Enrollment))!.GetForeignKeys()
    .Single(fk => fk.PrincipalEntityType.ClrType == typeof(Student)).DeleteBehavior == DeleteBehavior.Restrict,
    "student enrollment history keeps restrictive foreign key");
var search = assembly.GetType("EnglishCenter.Api.Controllers.Admin.AdminSearch")!.GetMethod("WhereContains",BindingFlags.Static|BindingFlags.NonPublic)!.MakeGenericMethod(typeof(Course));
Expression<Func<Course,string>>[] names = [c=>c.Name];
var query = (IQueryable<Course>)search.Invoke(null,[db.Courses,"ielts",names])!;
Check(query.ToQueryString().Contains("Vietnamese_CI_AI"), "accent-insensitive search translates to SQL Server COLLATE");
var revenueQuery = typeof(DashboardController).GetMethod("RevenueQuery", BindingFlags.Static|BindingFlags.NonPublic)!;
var revenue = (IQueryable<RevenueBucket>)revenueQuery.Invoke(null,[db,new DateOnly(2026,1,1),new DateOnly(2027,1,1)])!;
var sql = revenue.ToQueryString();
Check(sql.Contains("SUM(") && sql.Contains("GROUP BY") && sql.Contains("ConfirmedAt"), "revenue aggregation translates to SQL without connecting to DB");
var controller = new DashboardController(db);
var fill = typeof(DashboardController).GetMethod("FillMonths",BindingFlags.Static|BindingFlags.NonPublic)!;
var months = (RevenueMonthResponse[])fill.Invoke(null,[new DateOnly(2025,12,1),3,new[] {new RevenueBucket(2026,1,1250000m)}])!;
Check(months.Select(m=>m.Month).SequenceEqual(["2025-12","2026-01","2026-02"]), "month sequence crosses year boundary in order");
Check(months.Select(m=>m.Revenue).SequenceEqual([0m,1250000m,0m]), "missing months zero-filled without dropping existing revenue");
Check(await controller.GetRevenue(0) is BadRequestObjectResult, "zero months rejected before querying DB");
Check(await controller.GetRevenue(37) is BadRequestObjectResult, "excessive months rejected before querying DB");
Check(typeof(DashboardController).GetCustomAttribute<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>()?.Roles == "admin", "dashboard endpoints require admin");
Console.WriteLine($"TOTAL {passed} checks passed. No API host, connection, migration or seed was run.");
