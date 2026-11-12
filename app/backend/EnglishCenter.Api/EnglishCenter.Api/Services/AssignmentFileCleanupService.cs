using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

// Định kỳ dọn file bài tập/bài nộp quá 7 ngày trong wwwroot/uploads/AssignmentUploads.
// - Xóa file vật lý (không ném lỗi khi file đã mất).
// - Xóa trắng FilePath/FileName để DB không còn trỏ tới file đã xóa, nhưng GIỮ record bài tập.
public class AssignmentFileCleanupService : BackgroundService
{
    public const int RetentionDays = 7;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    private readonly IServiceProvider _sp;
    private readonly ILogger<AssignmentFileCleanupService> _logger;

    public AssignmentFileCleanupService(IServiceProvider sp, ILogger<AssignmentFileCleanupService> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(Interval);
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AssignmentFileCleanupService gặp lỗi");
            }

            try
            {
                await timer.WaitForNextTickAsync(ct);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = _sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

        var cutoff = AppTime.Now.AddDays(-RetentionDays);
        var expired = await db.AssignmentFiles
            .Where(f => f.FilePath != "" && f.CreatedAt < cutoff)
            .ToListAsync(ct);

        foreach (var f in expired)
        {
            AssignmentFileStorage.Delete(env, f.FilePath);
            // Bảng Assignments có cột FilePath NOT NULL -> xóa trắng thay vì NULL
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Assignments SET FilePath = {""}, FileName = {""} WHERE Id = {f.Id}", ct);
        }

        if (expired.Count > 0)
            _logger.LogInformation("AssignmentFileCleanupService: đã dọn {n} file quá hạn", expired.Count);
    }
}
