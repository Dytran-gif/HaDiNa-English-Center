using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    public partial class AlignPublicTeachers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM [PublicTeacherProfiles]
WHERE [TeacherId] IS NULL AND [Slug] IN
 (N'hoang-huy', N'le-khanh-hoang', N'duy-quoc-tran', N'nguyen-ngoc-hoang', N'tran-quoc-duy');

INSERT INTO [PublicTeacherProfiles]
 ([TeacherId], [Slug], [FullName], [Title], [Bio], [CredentialsJson], [AvatarUrl], [IsPublished])
SELECT t.[Id], N'giao-vien-' + CONVERT(nvarchar(20), t.[Id]), t.[FullName],
 COALESCE(NULLIF(t.[Degree], N''), t.[Specialty]), N'', N'[]', NULL, 1
FROM [Teachers] t
WHERE NOT EXISTS (SELECT 1 FROM [PublicTeacherProfiles] p WHERE p.[TeacherId] = t.[Id]);

-- No orphan editorial profile should remain publicly visible after a Teacher is deleted.
UPDATE [PublicTeacherProfiles] SET [IsPublished] = 0 WHERE [TeacherId] IS NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Data cleanup is intentional; do not resurrect deleted mock teacher profiles.
        }
    }
}
