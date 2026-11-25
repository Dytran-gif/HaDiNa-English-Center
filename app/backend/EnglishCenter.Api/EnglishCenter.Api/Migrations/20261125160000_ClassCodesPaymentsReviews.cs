using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <summary>
    /// Rà soát 25/11/2026 (xem reports/2026-11-25-ra-soat-va-sua.md):
    /// - Classes.Code, Courses.Code/Slug/ImageUrl/IsPublished (mã lớp thống nhất, API khóa học public)
    /// - Assignments.ClassId (bài tập theo lớp; NULL = bài cũ / giao cho mọi lớp của GV trong khóa)
    /// - Payments: nhiều phiếu / ghi danh, Kind (Payment/Refund), Status (Pending/Confirmed/Rejected/Cancelled), số biên lai
    /// - Enrollments.ExtraDiscountAmount/DiscountNote (ưu đãi riêng)
    /// - PublicTeacherProfiles.TeacherId (hồ sơ public gắn giáo viên thật)
    /// - Bảng TeacherReviews (học viên đánh giá giáo viên)
    /// Viết bằng SQL từng bước vì phải điền dữ liệu cho các dòng cũ trước khi đặt NOT NULL / UNIQUE.
    /// </summary>
    public partial class ClassCodesPaymentsReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ---------- Courses: Code, Slug, ImageUrl, IsPublished ----------
            migrationBuilder.Sql(@"ALTER TABLE [Courses] ADD [Code] nvarchar(10) NULL, [Slug] nvarchar(150) NULL,
                [ImageUrl] nvarchar(500) NULL, [IsPublished] bit NOT NULL CONSTRAINT [DF_Courses_IsPublished] DEFAULT CAST(1 AS bit);");
            // Mã/slug tạm cho khóa cũ; Admin sửa lại trong trang Khóa học
            migrationBuilder.Sql(@"UPDATE [Courses] SET [Code] = CONCAT(N'KH', [Id]), [Slug] = CONCAT(N'khoa-hoc-', [Id]);");
            migrationBuilder.Sql(@"ALTER TABLE [Courses] ALTER COLUMN [Code] nvarchar(10) NOT NULL;");
            migrationBuilder.Sql(@"ALTER TABLE [Courses] ALTER COLUMN [Slug] nvarchar(150) NOT NULL;");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_Courses_Code] ON [Courses] ([Code]);");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_Courses_Slug] ON [Courses] ([Slug]);");

            // ---------- Classes: Code = <mã khóa>-<YYMM khai giảng>-<A,B,C...> ----------
            migrationBuilder.Sql(@"ALTER TABLE [Classes] ADD [Code] nvarchar(20) NULL;");
            migrationBuilder.Sql(@"
WITH x AS (
    SELECT c.[Id], CONCAT(co.[Code], N'-', FORMAT(c.[StartDate], 'yyMM')) AS [Prefix],
           ROW_NUMBER() OVER (PARTITION BY c.[CourseId], FORMAT(c.[StartDate], 'yyMM') ORDER BY c.[Id]) AS [Rn]
    FROM [Classes] c JOIN [Courses] co ON co.[Id] = c.[CourseId])
UPDATE c SET [Code] = CONCAT(x.[Prefix], N'-',
    CASE WHEN x.[Rn] <= 26 THEN NCHAR(64 + x.[Rn]) ELSE CAST(x.[Rn] AS nvarchar(5)) END)
FROM [Classes] c JOIN x ON x.[Id] = c.[Id];");
            migrationBuilder.Sql(@"ALTER TABLE [Classes] ALTER COLUMN [Code] nvarchar(20) NOT NULL;");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_Classes_Code] ON [Classes] ([Code]);");

            // ---------- Enrollments: ưu đãi riêng ----------
            migrationBuilder.Sql(@"ALTER TABLE [Enrollments] ADD
                [ExtraDiscountAmount] decimal(18,2) NOT NULL CONSTRAINT [DF_Enrollments_ExtraDiscountAmount] DEFAULT 0,
                [DiscountNote] nvarchar(300) NULL;");

            // ---------- Payments: nhiều phiếu / ghi danh + trạng thái ----------
            migrationBuilder.Sql(@"DROP INDEX [IX_Payments_EnrollmentId] ON [Payments];");
            migrationBuilder.Sql(@"CREATE INDEX [IX_Payments_EnrollmentId] ON [Payments] ([EnrollmentId]);");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] ADD
                [ReceiptNo] nvarchar(20) NULL,
                [Kind] nvarchar(10) NOT NULL CONSTRAINT [DF_Payments_Kind] DEFAULT N'Payment',
                [Status] nvarchar(12) NOT NULL CONSTRAINT [DF_Payments_Status] DEFAULT N'Confirmed',
                [TransferRef] nvarchar(100) NULL,
                [ConfirmedByUserId] int NULL,
                [ConfirmedAt] datetime2 NULL,
                [CancelReason] nvarchar(300) NULL;");
            // Phiếu do Admin lập: đã xác nhận (giữ nguyên doanh thu cũ theo ngày thu).
            // Phiếu học viên tự tạo bằng nút thanh toán giả lập: chuyển về Pending để Admin đối soát.
            migrationBuilder.Sql(@"
UPDATE p SET
    [Status] = CASE WHEN u.[Role] = N'student' THEN N'Pending' ELSE N'Confirmed' END,
    [ConfirmedByUserId] = CASE WHEN u.[Role] = N'student' THEN NULL ELSE p.[CreatedByUserId] END,
    [ConfirmedAt] = CASE WHEN u.[Role] = N'student' THEN NULL ELSE CAST(p.[PaidDate] AS datetime2) END,
    [Note] = CASE WHEN u.[Role] = N'student'
        THEN LEFT(CONCAT(N'[Chuyển từ thanh toán giả lập, cần xác nhận] ', p.[Note]), 500) ELSE p.[Note] END
FROM [Payments] p JOIN [Users] u ON u.[Id] = p.[CreatedByUserId];");
            migrationBuilder.Sql(@"
WITH x AS (
    SELECT [Id], CONCAT(N'PT-', FORMAT([PaidDate], 'yyMM'), N'-',
        RIGHT(CONCAT(N'0000', ROW_NUMBER() OVER (PARTITION BY FORMAT([PaidDate], 'yyMM') ORDER BY [Id])), 4)) AS [No]
    FROM [Payments] WHERE [Status] = N'Confirmed')
UPDATE p SET [ReceiptNo] = x.[No] FROM [Payments] p JOIN x ON x.[Id] = p.[Id];");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_Payments_ReceiptNo] ON [Payments] ([ReceiptNo]) WHERE [ReceiptNo] IS NOT NULL;");
            migrationBuilder.Sql(@"CREATE INDEX [IX_Payments_Status] ON [Payments] ([Status]);");
            migrationBuilder.Sql(@"CREATE INDEX [IX_Payments_ConfirmedByUserId] ON [Payments] ([ConfirmedByUserId]);");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Users_ConfirmedByUserId]
                FOREIGN KEY ([ConfirmedByUserId]) REFERENCES [Users] ([Id]);");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] ADD CONSTRAINT [CK_Payments_Kind] CHECK ([Kind] IN ('Payment','Refund'));");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] ADD CONSTRAINT [CK_Payments_Status]
                CHECK ([Status] IN ('Pending','Confirmed','Rejected','Cancelled'));");

            // ---------- Assignments: ClassId ----------
            // Bài GV giao trước đây giữ ClassId = NULL (= mọi lớp của GV đó trong khóa), không đổi hành vi cũ.
            // Bài nộp: điền lớp của học viên (ghi danh vào lớp của đúng GV, đúng khóa).
            migrationBuilder.Sql(@"ALTER TABLE [Assignments] ADD [ClassId] int NULL;");
            migrationBuilder.Sql(@"
UPDATE s SET [ClassId] = (
    SELECT TOP 1 e.[ClassId] FROM [Enrollments] e JOIN [Classes] c ON c.[Id] = e.[ClassId]
    WHERE e.[StudentId] = s.[StudentId] AND c.[CourseId] = s.[CourseId] AND c.[TeacherId] = s.[TeacherId]
    ORDER BY e.[Id] DESC)
FROM [Assignments] s WHERE s.[FileType] = N'Student';");
            migrationBuilder.Sql(@"CREATE INDEX [IX_Assignments_ClassId] ON [Assignments] ([ClassId]);");
            migrationBuilder.Sql(@"ALTER TABLE [Assignments] ADD CONSTRAINT [FK_Assignments_Classes]
                FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]);");

            // ---------- PublicTeacherProfiles: TeacherId ----------
            migrationBuilder.Sql(@"ALTER TABLE [PublicTeacherProfiles] ADD [TeacherId] int NULL;");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_PublicTeacherProfiles_TeacherId] ON [PublicTeacherProfiles] ([TeacherId])
                WHERE [TeacherId] IS NOT NULL;");
            migrationBuilder.Sql(@"ALTER TABLE [PublicTeacherProfiles] ADD CONSTRAINT [FK_PublicTeacherProfiles_Teachers_TeacherId]
                FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id]) ON DELETE SET NULL;");

            // ---------- TeacherReviews ----------
            migrationBuilder.Sql(@"
CREATE TABLE [TeacherReviews] (
    [Id] int NOT NULL IDENTITY,
    [StudentId] int NOT NULL,
    [ClassId] int NOT NULL,
    [TeacherId] int NOT NULL,
    [Rating] int NOT NULL,
    [Comment] nvarchar(1000) NOT NULL,
    [IsPublished] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_TeacherReviews] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_TeacherReviews_Rating] CHECK ([Rating] BETWEEN 1 AND 5),
    CONSTRAINT [FK_TeacherReviews_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]),
    CONSTRAINT [FK_TeacherReviews_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]),
    CONSTRAINT [FK_TeacherReviews_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
);");
            migrationBuilder.Sql(@"CREATE INDEX [IX_TeacherReviews_ClassId] ON [TeacherReviews] ([ClassId]);");
            migrationBuilder.Sql(@"CREATE INDEX [IX_TeacherReviews_TeacherId] ON [TeacherReviews] ([TeacherId]);");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_TeacherReviews_StudentId_ClassId] ON [TeacherReviews] ([StudentId], [ClassId]);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE [TeacherReviews];");

            migrationBuilder.Sql(@"ALTER TABLE [PublicTeacherProfiles] DROP CONSTRAINT [FK_PublicTeacherProfiles_Teachers_TeacherId];");
            migrationBuilder.Sql(@"DROP INDEX [IX_PublicTeacherProfiles_TeacherId] ON [PublicTeacherProfiles];");
            migrationBuilder.Sql(@"ALTER TABLE [PublicTeacherProfiles] DROP COLUMN [TeacherId];");

            migrationBuilder.Sql(@"ALTER TABLE [Assignments] DROP CONSTRAINT [FK_Assignments_Classes];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Assignments_ClassId] ON [Assignments];");
            migrationBuilder.Sql(@"ALTER TABLE [Assignments] DROP COLUMN [ClassId];");

            // Quay về 1 phiếu / ghi danh: chỉ giữ phiếu thu đã xác nhận đầu tiên của mỗi ghi danh
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP CONSTRAINT [CK_Payments_Status];");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP CONSTRAINT [CK_Payments_Kind];");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP CONSTRAINT [FK_Payments_Users_ConfirmedByUserId];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Payments_ConfirmedByUserId] ON [Payments];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Payments_Status] ON [Payments];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Payments_ReceiptNo] ON [Payments];");
            migrationBuilder.Sql(@"
DELETE p FROM [Payments] p
WHERE p.[Status] <> N'Confirmed' OR p.[Kind] <> N'Payment'
   OR EXISTS (SELECT 1 FROM [Payments] q WHERE q.[EnrollmentId] = p.[EnrollmentId] AND q.[Status] = N'Confirmed'
              AND q.[Kind] = N'Payment' AND q.[Id] < p.[Id]);");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP CONSTRAINT [DF_Payments_Kind];");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP CONSTRAINT [DF_Payments_Status];");
            migrationBuilder.Sql(@"ALTER TABLE [Payments] DROP COLUMN [ReceiptNo], [Kind], [Status], [TransferRef],
                [ConfirmedByUserId], [ConfirmedAt], [CancelReason];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Payments_EnrollmentId] ON [Payments];");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX [IX_Payments_EnrollmentId] ON [Payments] ([EnrollmentId]);");

            migrationBuilder.Sql(@"ALTER TABLE [Enrollments] DROP CONSTRAINT [DF_Enrollments_ExtraDiscountAmount];");
            migrationBuilder.Sql(@"ALTER TABLE [Enrollments] DROP COLUMN [ExtraDiscountAmount], [DiscountNote];");

            migrationBuilder.Sql(@"DROP INDEX [IX_Classes_Code] ON [Classes];");
            migrationBuilder.Sql(@"ALTER TABLE [Classes] DROP COLUMN [Code];");

            migrationBuilder.Sql(@"DROP INDEX [IX_Courses_Slug] ON [Courses];");
            migrationBuilder.Sql(@"DROP INDEX [IX_Courses_Code] ON [Courses];");
            migrationBuilder.Sql(@"ALTER TABLE [Courses] DROP CONSTRAINT [DF_Courses_IsPublished];");
            migrationBuilder.Sql(@"ALTER TABLE [Courses] DROP COLUMN [Code], [Slug], [ImageUrl], [IsPublished];");
        }
    }
}
