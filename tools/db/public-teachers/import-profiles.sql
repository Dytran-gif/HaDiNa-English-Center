SET XACT_ABORT ON;
BEGIN TRANSACTION;
SET IDENTITY_INSERT dbo.PublicTeacherProfiles ON;
IF NOT EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Slug=N'hoang-huy')
BEGIN
 IF EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Id=1) THROW 51000, 'Public teacher profile ID conflict', 1;
 INSERT dbo.PublicTeacherProfiles (Id,Slug,FullName,Title,Bio,CredentialsJson,AvatarUrl,IsPublished) VALUES (1,N'hoang-huy',N'Thầy Hoàng Huy',N'Thạc sĩ — FHNW University, Switzerland',N'Tốt nghiệp thạc sĩ tại FHNW University, Thụy Sĩ. Người xây dựng mô hình học University Lecture của Hadi IELTS, chuyên luyện Writing và Speaking cho học viên target band 7.0+.',N'["FHNW University","IELTS 8.5","8 năm giảng dạy"]',N'/uploads/public-teachers/teacher1.png',1);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Slug=N'le-khanh-hoang')
BEGIN
 IF EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Id=2) THROW 51000, 'Public teacher profile ID conflict', 1;
 INSERT dbo.PublicTeacherProfiles (Id,Slug,FullName,Title,Bio,CredentialsJson,AvatarUrl,IsPublished) VALUES (2,N'le-khanh-hoang',N'Lê Khánh Hoàng',N'Thạc sĩ Ngôn ngữ học',N'Giảng viên chính thức tại Đại học Kinh tế Tài chính TP.HCM, chuyên đào tạo nền tảng ngữ pháp và tư duy ngôn ngữ cho học viên mọi trình độ.',N'["Thạc sĩ Ngôn ngữ học","Giảng viên ĐH Kinh tế Tài chính TP.HCM"]',N'/uploads/public-teachers/teacher2.png',1);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Slug=N'duy-quoc-tran')
BEGIN
 IF EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Id=3) THROW 51000, 'Public teacher profile ID conflict', 1;
 INSERT dbo.PublicTeacherProfiles (Id,Slug,FullName,Title,Bio,CredentialsJson,AvatarUrl,IsPublished) VALUES (3,N'duy-quoc-tran',N'Duy Quốc Trần',N'Cử nhân Đại học Việt Đức — SAT 1500',N'Cử nhân Đại học Việt Đức, đạt SAT 1500. Phụ trách lộ trình luyện thi SAT tại Hadi IELTS với phương pháp bám sát tiêu chí chấm điểm thực tế.',N'["Đại học Việt Đức","SAT 1500"]',N'/uploads/public-teachers/teacher3.jpg',1);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Slug=N'nguyen-ngoc-hoang')
BEGIN
 IF EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Id=4) THROW 51000, 'Public teacher profile ID conflict', 1;
 INSERT dbo.PublicTeacherProfiles (Id,Slug,FullName,Title,Bio,CredentialsJson,AvatarUrl,IsPublished) VALUES (4,N'nguyen-ngoc-hoang',N'Nguyễn Ngọc Hoàng',N'Cử nhân Kỹ thuật phần mềm — ĐH Quốc tế Miền Đông',N'Tốt nghiệp cử nhân ngành kỹ thuật phần mềm, Đại học Quốc tế Miền Đông. Phụ trách chương trình Kid & Teenager, xây nền tảng tiếng Anh và tư duy phản biện cho học viên nhỏ tuổi.',N'["Đại học EIU","Chuyên đào tạo Kid & Teenager"]',N'/uploads/public-teachers/Teacher4.png',1);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Slug=N'tran-quoc-duy')
BEGIN
 IF EXISTS (SELECT 1 FROM dbo.PublicTeacherProfiles WHERE Id=5) THROW 51000, 'Public teacher profile ID conflict', 1;
 INSERT dbo.PublicTeacherProfiles (Id,Slug,FullName,Title,Bio,CredentialsJson,AvatarUrl,IsPublished) VALUES (5,N'tran-quoc-duy',N'Trần Quốc Duy',N'Cử nhân Kỹ thuật AI — Tiểu học mầm non',N'Tốt nghiệp mỗi trường tiểu học. Phụ trách chương trình quản trị AI, dạy cách làm project bằng Ctrl+C, Ctrl+V cho học viên nhỏ tuổi.',N'["Tiểu học mầm non","Chuyên đào tạo Kid & Teenager"]',N'/uploads/public-teachers/teacher5.png',1);
END;
SET IDENTITY_INSERT dbo.PublicTeacherProfiles OFF;
COMMIT;
