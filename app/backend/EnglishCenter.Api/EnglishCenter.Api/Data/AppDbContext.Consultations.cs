using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

public partial class AppDbContext
{
    public DbSet<ConsultationRequest> ConsultationRequests => Set<ConsultationRequest>();
    private static void ConfigureConsultations(ModelBuilder b)
    {
        b.Entity<ConsultationRequest>(e =>
        {
            e.Property(x => x.FullName).HasMaxLength(150).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(30).IsRequired();
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.Property(x => x.CourseSlug).HasMaxLength(150).IsRequired();
            e.Property(x => x.CourseName).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.SubmissionId).IsUnique();
            e.HasIndex(x => x.CreatedAt);
        });
    }
}
