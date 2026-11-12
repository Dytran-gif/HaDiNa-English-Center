-- Bổ sung cột CourseId + khóa ngoại cho bảng Assignments (phân biệt bài tập/bài nộp theo khóa học).
-- Chạy nhiều lần không lỗi (idempotent).
-- sqlcmd -S localhost -d EnglishCenterDb -E -i "D:\Capstone\HaDiNa-English-Center\docs\admin\sql\2026-11-12-assignments-courseid.sql"

IF COL_LENGTH('dbo.Assignments', 'CourseId') IS NULL
    ALTER TABLE Assignments ADD CourseId int NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Assignments_Courses')
    ALTER TABLE Assignments
        ADD CONSTRAINT FK_Assignments_Courses FOREIGN KEY (CourseId) REFERENCES Courses (Id);
GO
