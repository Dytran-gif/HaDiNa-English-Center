using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

public partial class AppDbContext
{
    public DbSet<PublicTeacherProfile> PublicTeacherProfiles => Set<PublicTeacherProfile>();

    private static void ConfigurePublic(ModelBuilder b)
    {
        b.Entity<PublicTeacherProfile>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(150).IsRequired();
            e.Property(x => x.FullName).HasMaxLength(150).IsRequired();
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Bio).HasMaxLength(4000).IsRequired();
            e.Property(x => x.CredentialsJson).HasMaxLength(4000).IsRequired();
            e.Property(x => x.AvatarUrl).HasMaxLength(500);
        });
    }
}
