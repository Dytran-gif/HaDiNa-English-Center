using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

// Đánh giá giáo viên của học viên (bảng TeacherReviews).
public partial class AppDbContext
{
    public DbSet<TeacherReview> TeacherReviews => Set<TeacherReview>();

    private static void ConfigureReviews(ModelBuilder b)
    {
        b.Entity<TeacherReview>(e =>
        {
            e.Property(x => x.Comment).HasMaxLength(1000).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.StudentId, x.ClassId }).IsUnique();
            e.HasIndex(x => x.TeacherId);

            e.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Class).WithMany().HasForeignKey(x => x.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Teacher).WithMany().HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            e.ToTable(t => t.HasCheckConstraint("CK_TeacherReviews_Rating", "[Rating] BETWEEN 1 AND 5"));
        });
    }
}
