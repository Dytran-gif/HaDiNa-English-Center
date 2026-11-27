using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

public partial class AppDbContext
{
    public DbSet<CourseRegistration> CourseRegistrations => Set<CourseRegistration>();
    private static void ConfigureCourseRegistrations(ModelBuilder b)
    {
        b.Entity<CourseRegistration>(e =>
        {
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.HasIndex(x => new { x.StudentId, x.CourseId }).IsUnique().HasFilter("[Status] = N'Pending'");
            e.HasIndex(x => new { x.Status, x.CreatedAt });
            e.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Class).WithMany().HasForeignKey(x => x.ClassId).OnDelete(DeleteBehavior.SetNull);
            e.ToTable(t => t.HasCheckConstraint("CK_CourseRegistrations_Status", "[Status] IN ('Pending','Assigned','Cancelled')"));
        });
    }
}
