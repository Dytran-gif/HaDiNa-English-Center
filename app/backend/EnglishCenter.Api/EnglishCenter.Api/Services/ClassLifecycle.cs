using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

public static class ClassLifecycle
{
    // Caller owns a transaction; serialize class edits/deletion with assignment and capacity checks.
    public static Task LockAsync(AppDbContext db, int classId) => db.Database.ExecuteSqlInterpolatedAsync(
        $"SELECT [Id] FROM [Classes] WITH (UPDLOCK, HOLDLOCK) WHERE [Id] = {classId}");
}
