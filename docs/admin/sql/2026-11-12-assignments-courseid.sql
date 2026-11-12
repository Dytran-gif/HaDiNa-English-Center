-- Bổ sung các cột còn thiếu cho bảng Assignments (module Student).
-- - CourseId: phân biệt bài tập/bài nộp theo khóa học.
-- - AssignmentId: với bài nộp (FileType='Student'), lưu Id của bài tập gốc để khớp đúng (không lẫn khi trùng tiêu đề).
-- Chạy nhiều lần không lỗi (idempotent).
-- sqlcmd -S localhost -d EnglishCenterDb -E -i "D:\Capstone\HaDiNa-English-Center\docs\admin\sql\2026-11-12-assignments-courseid.sql"

IF COL_LENGTH('dbo.Assignments', 'CourseId') IS NULL
    ALTER TABLE Assignments ADD CourseId int NULL;
GO

IF COL_LENGTH('dbo.Assignments', 'AssignmentId') IS NULL
    ALTER TABLE Assignments ADD AssignmentId int NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Assignments_Courses')
    ALTER TABLE Assignments
        ADD CONSTRAINT FK_Assignments_Courses FOREIGN KEY (CourseId) REFERENCES Courses (Id);
GO
