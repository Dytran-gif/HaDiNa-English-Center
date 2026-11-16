using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    public partial class StudentModuleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Hai bảng này trước đây được tạo tay trong DB của nhóm (module Student), chưa có migration.
            // Viết bằng SQL có kiểm tra tồn tại: DB đã có bảng thì chỉ bổ sung phần thiếu, DB mới thì tạo đủ.
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'dbo.Assignments', N'U') IS NULL
BEGIN
    CREATE TABLE [Assignments] (
        [Id] int NOT NULL IDENTITY,
        [TeacherId] int NOT NULL,
        [StudentId] int NULL,
        [CourseId] int NULL,
        [AssignmentId] int NULL,
        [Title] nvarchar(250) NOT NULL,
        [Description] nvarchar(2000) NULL,
        [FileName] nvarchar(260) NOT NULL,
        [FilePath] nvarchar(500) NOT NULL,
        [FileType] nvarchar(10) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_Assignments] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Assignments_FileType] CHECK ([FileType] IN ('Student','Teacher')),
        CONSTRAINT [FK_Assignments_Courses] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]),
        CONSTRAINT [FK_Assignments_Students] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]),
        CONSTRAINT [FK_Assignments_Teachers] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
    );
END;
-- Bảng Assignments tạo tay bản cũ thiếu CourseId / AssignmentId (script docs/admin/sql/2026-11-12-assignments-courseid.sql)
IF COL_LENGTH(N'dbo.Assignments', N'CourseId') IS NULL
    ALTER TABLE [Assignments] ADD [CourseId] int NULL;
IF COL_LENGTH(N'dbo.Assignments', N'AssignmentId') IS NULL
    ALTER TABLE [Assignments] ADD [AssignmentId] int NULL;
");
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.Assignments') AND referenced_object_id = OBJECT_ID(N'dbo.Courses'))
    ALTER TABLE [Assignments] ADD CONSTRAINT [FK_Assignments_Courses] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Assignments') AND name = N'IX_Assignments_CourseId')
    CREATE INDEX [IX_Assignments_CourseId] ON [Assignments] ([CourseId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Assignments') AND name = N'IX_Assignments_StudentId')
    CREATE INDEX [IX_Assignments_StudentId] ON [Assignments] ([StudentId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Assignments') AND name = N'IX_Assignments_TeacherId')
    CREATE INDEX [IX_Assignments_TeacherId] ON [Assignments] ([TeacherId]);

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
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.StudentFeedbacks') AND name = N'IX_StudentFeedbacks_ClassId')
    CREATE INDEX [IX_StudentFeedbacks_ClassId] ON [StudentFeedbacks] ([ClassId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.StudentFeedbacks') AND name = N'IX_StudentFeedbacks_StudentId')
    CREATE INDEX [IX_StudentFeedbacks_StudentId] ON [StudentFeedbacks] ([StudentId]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.StudentFeedbacks') AND name = N'IX_StudentFeedbacks_TeacherId')
    CREATE INDEX [IX_StudentFeedbacks_TeacherId] ON [StudentFeedbacks] ([TeacherId]);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "StudentFeedbacks");
        }
    }
}
