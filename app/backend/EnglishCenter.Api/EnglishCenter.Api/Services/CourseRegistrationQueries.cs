using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Dtos.Common;

namespace EnglishCenter.Api.Services;

public static class CourseRegistrationQueries
{
    public static IQueryable<CourseRegistrationResponse> Project(IQueryable<CourseRegistration> query) => query.Select(r => new CourseRegistrationResponse
    {
        Id = r.Id, StudentId = r.StudentId, StudentCode = r.Student.Code, StudentName = r.Student.FullName,
        CourseId = r.CourseId, CourseName = r.Course.Name, Status = r.Status, CreatedAt = r.CreatedAt,
        ClassId = r.ClassId, ClassName = r.Class == null ? null : r.Class.Name, AssignedAt = r.AssignedAt
    });
}
