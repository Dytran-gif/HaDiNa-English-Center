using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    public partial class StrictCourseBands : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Correct the two legacy ranges confirmed by the center administrator.
            migrationBuilder.Sql("UPDATE [Courses] SET [BandFrom] = 5, [BandTo] = 6 WHERE (([Id] = 17 AND [Name] = N'112111') OR ([Id] = 18 AND [Name] = N'11111')) AND [BandFrom] = 0 AND [BandTo] = 0");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Courses_Band",
                table: "Courses");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Courses_Band",
                table: "Courses",
                sql: "[BandFrom] >= 0 AND [BandTo] <= 9 AND [BandFrom] < [BandTo] AND [BandFrom] % 0.5 = 0 AND [BandTo] % 0.5 = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Courses_Band",
                table: "Courses");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Courses_Band",
                table: "Courses",
                sql: "[BandFrom] >= 0 AND [BandTo] <= 9 AND [BandFrom] <= [BandTo]");
        }
    }
}
