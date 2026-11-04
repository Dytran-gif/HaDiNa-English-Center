-- Tạo bảng StudentFeedbacks cho module Student (2026-11-04)
-- CHỈ THÊM BẢNG MỚI - không sửa bảng/cột khác. Có guard chạy lại an toàn.
-- Lưu ý: tạo bằng script (như tiền lệ TokenVersion) vì DB local đang drift schema,
-- chưa thể dùng dotnet-ef migrations add (sẽ kéo theo toàn bộ bảng TeacherFeatures của plan 00).
-- Khi tạo migration TeacherFeatures, nhóm nhớ gộp bảng này vào cùng migration.

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
        CONSTRAINT [FK_StudentFeedbacks_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]),
        CONSTRAINT [FK_StudentFeedbacks_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]),
        CONSTRAINT [FK_StudentFeedbacks_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
    );

    CREATE INDEX [IX_StudentFeedbacks_ClassId] ON [StudentFeedbacks] ([ClassId]);
END
