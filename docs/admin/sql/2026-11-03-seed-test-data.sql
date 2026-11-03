-- Seed dữ liệu test cho HaDiNa English Center (2026-11-03)
-- CHỈ THÊM DỮ LIỆU - không sửa bảng/cột. Có guard chống chạy trùng (chạy lại an toàn).
-- Bỏ qua: Users, Students, Teachers (theo yêu cầu) và CenterSettings (bảng chỉ có 1 dòng Id=1).
-- Enrollment/Payment gán cho học viên Id=3 (student2@demo.com) để giữ tài khoản demo
-- student@demo.com (Students.Id=1) trống cho việc test đăng ký.
SET NOCOUNT ON;

DECLARE @teacherId int = 1;      -- Nguyen Van A
DECLARE @studentId int = 3;      -- Pham Van D (không phải tài khoản demo)
DECLARE @adminUserId int = 1;    -- admin@demo.com
DECLARE @today date = CAST(GETDATE() AS date);

-- Bảng tạm chứa 10 khóa mới kèm phòng/lịch/phương thức thanh toán
CREATE TABLE #seed (
    Name nvarchar(150), Description nvarchar(500),
    BandFrom decimal(3,1), BandTo decimal(3,1),
    TotalSessions int, SessionsPerWeek int,
    Tuition decimal(18,2), DiscountPercent decimal(5,2),
    RoomName nvarchar(50), DayOfWeek int, StartTime time, EndTime time,
    PayMethod nvarchar(20)
);
INSERT INTO #seed VALUES
 (N'IELTS Writing Foundation', N'Luyện nền tảng viết Task 1 & Task 2', 4.0, 5.0, 20, 2, 3200000, 0,  N'Room 301', 2, '18:00', '20:00', N'Cash'),
 (N'IELTS Speaking Confidence', N'Phản xạ nói theo chủ đề, luyện Part 1-3', 4.5, 5.5, 16, 2, 2800000, 5, N'Room 302', 3, '18:00', '19:30', N'Transfer'),
 (N'IELTS Listening Booster', N'Chiến thuật nghe theo từng dạng bài', 5.0, 6.0, 16, 2, 2200000, 5, N'Room 303', 4, '19:30', '21:00', N'Cash'),
 (N'IELTS Reading Mastery', N'Đọc hiểu học thuật, quản lý thời gian làm bài', 5.5, 6.5, 20, 3, 3600000, 10, N'Room 304', 5, '18:00', '20:00', N'Transfer'),
 (N'IELTS Full Skills 6.5+', N'Luyện tổng hợp 4 kỹ năng mục tiêu 6.5', 5.0, 6.5, 36, 3, 6800000, 10, N'Room 305', 6, '08:00', '11:00', N'Cash'),
 (N'TOEIC 550 Foundation', N'Nền tảng TOEIC 2 kỹ năng Listening & Reading', 3.0, 4.5, 24, 2, 3000000, 0, N'Room 306', 2, '17:30', '19:30', N'Cash'),
 (N'TOEIC 750 Intensive', N'Luyện đề TOEIC cường độ cao', 4.5, 6.0, 30, 3, 4200000, 5, N'Room 307', 3, '18:00', '20:00', N'Transfer'),
 (N'Grammar & Writing Essentials', N'Ngữ pháp chuẩn và viết luận cơ bản', 3.5, 5.0, 18, 2, 2400000, 10, N'Room 308', 4, '18:00', '19:30', N'Cash'),
 (N'Business English Intermediate', N'Tiếng Anh thương mại: email, họp, đàm phán', 5.0, 6.0, 24, 2, 3800000, 5, N'Room 309', 5, '19:00', '21:00', N'Transfer'),
 (N'Conversation Fluency A2-B1', N'Giao tiếp phản xạ cho người đi làm', 2.5, 4.0, 20, 2, 2600000, 0, N'Room 310', 6, '17:00', '19:00', N'Cash');

-- 1) Courses: 10 khóa
INSERT INTO Courses (Name, Description, BandFrom, BandTo, TotalSessions, SessionsPerWeek, Tuition, DiscountPercent)
SELECT s.Name, s.Description, s.BandFrom, s.BandTo, s.TotalSessions, s.SessionsPerWeek, s.Tuition, s.DiscountPercent
FROM #seed s
WHERE NOT EXISTS (SELECT 1 FROM Courses c WHERE c.Name = s.Name);

-- 2) Rooms: 10 phòng
INSERT INTO Rooms (Name, Capacity)
SELECT DISTINCT s.RoomName, 20
FROM #seed s
WHERE NOT EXISTS (SELECT 1 FROM Rooms r WHERE r.Name = s.RoomName);

-- 3) Classes: 10 lớp (1 lớp cho mỗi khóa mới)
INSERT INTO Classes (CourseId, TeacherId, Name, StartDate, EndDate, MaxStudents)
SELECT c.Id, @teacherId, c.Name + N' - Lớp Test', DATEADD(day, 14, @today), DATEADD(day, 164, @today), 15
FROM #seed s
JOIN Courses c ON c.Name = s.Name
WHERE NOT EXISTS (SELECT 1 FROM Classes cl WHERE cl.Name = c.Name + N' - Lớp Test');

-- 4) ClassSchedules: 10 dòng lịch (1 dòng cho mỗi lớp mới)
INSERT INTO ClassSchedules (ClassId, RoomId, DayOfWeek, StartTime, EndTime)
SELECT cl.Id, r.Id, s.DayOfWeek, s.StartTime, s.EndTime
FROM #seed s
JOIN Courses c ON c.Name = s.Name
JOIN Classes cl ON cl.CourseId = c.Id
JOIN Rooms r ON r.Name = s.RoomName
WHERE NOT EXISTS (
    SELECT 1 FROM ClassSchedules cs
    WHERE cs.ClassId = cl.Id AND cs.DayOfWeek = s.DayOfWeek
      AND cs.StartTime = s.StartTime AND cs.EndTime = s.EndTime);

-- 5) Enrollments: 10 ghi danh cho học viên test (Students.Id = 3)
INSERT INTO Enrollments (StudentId, ClassId, TuitionFee, DiscountPercent, DiscountAmount, FinalTuitionFee, Status)
SELECT @studentId, cl.Id, c.Tuition, c.DiscountPercent,
       ROUND(c.Tuition * c.DiscountPercent / 100, 2),
       c.Tuition - ROUND(c.Tuition * c.DiscountPercent / 100, 2),
       N'Active'
FROM #seed s
JOIN Courses c ON c.Name = s.Name
JOIN Classes cl ON cl.CourseId = c.Id
WHERE NOT EXISTS (SELECT 1 FROM Enrollments e WHERE e.StudentId = @studentId AND e.ClassId = cl.Id);

-- 6) Payments: 10 phiếu thu tương ứng
INSERT INTO Payments (EnrollmentId, CreatedByUserId, Amount, Method, PaidDate, Note)
SELECT e.Id, @adminUserId, e.FinalTuitionFee, s.PayMethod, @today, N'Thu học phí đăng ký (dữ liệu test)'
FROM #seed s
JOIN Courses c ON c.Name = s.Name
JOIN Classes cl ON cl.CourseId = c.Id
JOIN Enrollments e ON e.ClassId = cl.Id AND e.StudentId = @studentId
WHERE NOT EXISTS (SELECT 1 FROM Payments p WHERE p.EnrollmentId = e.Id);

-- 7) Posts: 10 bài viết
INSERT INTO Posts (Title, Content, ThumbnailUrl, Status)
SELECT v.Title, v.Content, NULL, v.Status
FROM (VALUES
 (N'Mẹo luyện IELTS Writing tại nhà', N'Bài viết chia sẻ cách luyện viết Task 1 và Task 2 hiệu quả.', N'Published'),
 (N'Lộ trình IELTS 6.5 trong 6 tháng', N'Kế hoạch học tập chi tiết theo từng giai đoạn.', N'Published'),
 (N'TOEIC hay IELTS: nên chọn chứng chỉ nào?', N'So sánh hai chứng chỉ phổ biến nhất hiện nay.', N'Published'),
 (N'5 sai lầm khi học từ vựng tiếng Anh', N'Những thói quen học từ vựng kém hiệu quả cần tránh.', N'Draft'),
 (N'Bí quyết nói tiếng Anh trôi chảy', N'Luyện phản xạ nói qua các tình huống thực tế.', N'Published'),
 (N'Học ngữ pháp qua sơ đồ tư duy', N'Phương pháp hệ thống hóa ngữ pháp dễ nhớ.', N'Draft'),
 (N'Kinh nghiệm thi IELTS Speaking', N'Chia sẻ từ giám khảo về các tiêu chí chấm điểm.', N'Published'),
 (N'Luyện nghe tiếng Anh mỗi ngày', N'Thói quen nghe chủ động giúp cải thiện kỹ năng nghe.', N'Published'),
 (N'Cách viết email tiếng Anh chuyên nghiệp', N'Mẫu câu và cấu trúc email trong môi trường công sở.', N'Draft'),
 (N'Từ vựng IELTS theo chủ đề Education', N'Bộ từ vựng chủ đề giáo dục kèm ví dụ.', N'Published')
) AS v(Title, Content, Status)
WHERE NOT EXISTS (SELECT 1 FROM Posts p WHERE p.Title = v.Title);

-- 8) HomepageImages: 10 ảnh trang chủ
INSERT INTO HomepageImages (Url, AltText, SortOrder)
SELECT v.Url, v.AltText, v.SortOrder
FROM (VALUES
 (N'/uploads/home/test-01.jpg', N'Không gian lớp học', 1),
 (N'/uploads/home/test-02.jpg', N'Học viên luyện nói', 2),
 (N'/uploads/home/test-03.jpg', N'Phòng học hiện đại', 3),
 (N'/uploads/home/test-04.jpg', N'Hoạt động ngoại khóa', 4),
 (N'/uploads/home/test-05.jpg', N'Thư viện trung tâm', 5),
 (N'/uploads/home/test-06.jpg', N'Buổi học nhóm', 6),
 (N'/uploads/home/test-07.jpg', N'Giáo viên hướng dẫn 1-1', 7),
 (N'/uploads/home/test-08.jpg', N'Lễ trao chứng chỉ', 8),
 (N'/uploads/home/test-09.jpg', N'Góc tự học', 9),
 (N'/uploads/home/test-10.jpg', N'Sự kiện trung tâm', 10)
) AS v(Url, AltText, SortOrder)
WHERE NOT EXISTS (SELECT 1 FROM HomepageImages h WHERE h.Url = v.Url);

DROP TABLE #seed;
GO

-- Kiểm tra nhanh số dòng
SET NOCOUNT ON;
SELECT 'Courses' t, COUNT(*) n FROM Courses
UNION ALL SELECT 'Rooms', COUNT(*) FROM Rooms
UNION ALL SELECT 'Classes', COUNT(*) FROM Classes
UNION ALL SELECT 'ClassSchedules', COUNT(*) FROM ClassSchedules
UNION ALL SELECT 'Enrollments', COUNT(*) FROM Enrollments
UNION ALL SELECT 'Payments', COUNT(*) FROM Payments
UNION ALL SELECT 'Posts', COUNT(*) FROM Posts
UNION ALL SELECT 'HomepageImages', COUNT(*) FROM HomepageImages;
