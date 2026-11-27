using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveClassCodeAndMeetingUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Classes_Code",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "MeetingUrl",
                table: "Classes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Classes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MeetingUrl",
                table: "Classes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            // Rollback recreates unique identifiers; removed values require the backup to restore.
            migrationBuilder.Sql("UPDATE [Classes] SET [Code] = 'LOP-' + CONVERT(varchar(11), [Id])");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Code",
                table: "Classes",
                column: "Code",
                unique: true);
        }
    }
}
