using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

// Cấu hình các bảng của module Student (xem .claude/context/data-model.md).
// Tách file riêng để không đụng nhiều vào AppDbContext.cs của cả nhóm.
public partial class AppDbContext
{
    public DbSet<StudentFeedback> StudentFeedbacks => Set<StudentFeedback>();

    private static void ConfigureStudentFeatures(ModelBuilder b)
    {
        // ---------- StudentFeedbacks (học viên phản hồi về giáo viên/lớp) ----------
        b.Entity<StudentFeedback>(e =>
        {
            e.Property(x => x.Content).HasMaxLength(1000).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => x.ClassId);

            e.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Class).WithMany().HasForeignKey(x => x.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Teacher).WithMany().HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
