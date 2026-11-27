using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

public static class StudentLifecycle
{
    // All callers hold a transaction. Serialize deletion with enrollment/payment creation.
    public static Task LockAsync(AppDbContext db, int studentId) => db.Database.ExecuteSqlInterpolatedAsync(
        $"SELECT [Id] FROM [Students] WITH (UPDLOCK, HOLDLOCK) WHERE [Id] = {studentId}");
}
