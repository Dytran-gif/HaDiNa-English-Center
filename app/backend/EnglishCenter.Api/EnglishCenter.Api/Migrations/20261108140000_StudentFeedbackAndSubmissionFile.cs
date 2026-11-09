using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    // Viết tay (máy tạo không có NuGet), tương đương `dotnet ef migrations add StudentFeedbackAndSubmissionFile`.
    // - Bảng StudentFeedbacks của module Student (trước đây chỉ có script docs/admin/sql/2026-11-04-student-feedback-table.sql).
    //   Dùng IF NOT EXISTS: máy nào đã chạy script đó thì chỉ bổ sung index còn thiếu, không lỗi "đã tồn tại".
    // - Cột Submissions.AttachmentUrl: file học viên đính kèm khi nộp bài.
    public partial class StudentFeedbackAndSubmissionFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "Submissions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'dbo.StudentFeedbacks', N'U') IS NULL
BEGIN
    CREATE TABLE [StudentFeedbacks] (
        [Id] int NOT NULL IDENTITY,
        [StudentId] int NOT NULL,
        [ClassId] int NOT NULL,
        [TeacherId] int NOT NULL,
        [Content] nvarchar(1000) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_StudentFeedbacks] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StudentFeedbacks_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]),
        CONSTRAINT [FK_StudentFeedbacks_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]),
        CONSTRAINT [FK_StudentFeedbacks_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StudentFeedbacks_ClassId' AND object_id = OBJECT_ID(N'dbo.StudentFeedbacks'))
    CREATE INDEX [IX_StudentFeedbacks_ClassId] ON [StudentFeedbacks] ([ClassId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StudentFeedbacks_StudentId' AND object_id = OBJECT_ID(N'dbo.StudentFeedbacks'))
    CREATE INDEX [IX_StudentFeedbacks_StudentId] ON [StudentFeedbacks] ([StudentId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StudentFeedbacks_TeacherId' AND object_id = OBJECT_ID(N'dbo.StudentFeedbacks'))
    CREATE INDEX [IX_StudentFeedbacks_TeacherId] ON [StudentFeedbacks] ([TeacherId]);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentFeedbacks");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "Submissions");
        }
    }
}
