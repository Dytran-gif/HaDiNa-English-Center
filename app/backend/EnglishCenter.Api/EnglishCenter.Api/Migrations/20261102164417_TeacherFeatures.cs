using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCenter.Api.Migrations
{
    /// <inheritdoc />
    public partial class TeacherFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TargetBand",
                table: "Students",
                type: "decimal(3,1)",
                precision: 3,
                scale: 1,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    RecipientCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Announcements_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Announcements_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CommentTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: true),
                    Skill = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Criterion = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentTemplates_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Exams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ExamDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    MaxScore = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exams", x => x.Id);
                    table.CheckConstraint("CK_Exams_MaxScore", "[MaxScore] > 0");
                    table.CheckConstraint("CK_Exams_Type", "[Type] IN ('Periodic','Midterm','Final')");
                    table.ForeignKey(
                        name: "FK_Exams_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Exams_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GradeConfigs",
                columns: table => new
                {
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    AssignmentWeight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    PeriodicWeight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MidtermWeight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    FinalWeight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    PassScore = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GradeConfigs", x => x.ClassId);
                    table.ForeignKey(
                        name: "FK_GradeConfigs_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OneOnOneSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    AvailabilityId = table.Column<int>(type: "int", nullable: true),
                    RequestId = table.Column<int>(type: "int", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    Topic = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MeetingUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OneOnOneSessions", x => x.Id);
                    table.CheckConstraint("CK_OneOnOneSessions_Status", "[Status] IN ('Scheduled','Cancelled')");
                    table.ForeignKey(
                        name: "FK_OneOnOneSessions_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OneOnOneSessions_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PromotionRecommendations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    FromClassId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    RecommendedCourseId = table.Column<int>(type: "int", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromotionRecommendations_Classes_FromClassId",
                        column: x => x.FromClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionRecommendations_Courses_RecommendedCourseId",
                        column: x => x.RecommendedCourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionRecommendations_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionRecommendations_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Period = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PeriodLabel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Attitude = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AttendanceComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Strengths = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Improvements = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ListeningComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ReadingComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    WritingComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SpeakingComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    OverallComment = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentReviews", x => x.Id);
                    table.CheckConstraint("CK_StudentReviews_Period", "[Period] IN ('Monthly','MidCourse','EndCourse')");
                    table.ForeignKey(
                        name: "FK_StudentReviews_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentReviews_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentReviews_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SyllabusLessons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    OrderNo = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SyllabusLessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SyllabusLessons_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeacherAvailabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsBooked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherAvailabilities", x => x.Id);
                    table.CheckConstraint("CK_TeacherAvailabilities_Time", "[StartTime] < [EndTime]");
                    table.ForeignKey(
                        name: "FK_TeacherAvailabilities_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeacherRatings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherRatings", x => x.Id);
                    table.CheckConstraint("CK_TeacherRatings_Score", "[Score] BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "FK_TeacherRatings_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeacherRatings_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeacherRatings_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecipientUserId = table.Column<int>(type: "int", nullable: false),
                    SenderUserId = table.Column<int>(type: "int", nullable: true),
                    AnnouncementId = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Link = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    ExamId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Prompt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MinWords = table.Column<int>(type: "int", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AllowLate = table.Column<bool>(type: "bit", nullable: false),
                    AssignToAll = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.CheckConstraint("CK_Assignments_Skill", "[Skill] IN ('Writing','Speaking','Reading','Listening')");
                    table.CheckConstraint("CK_Assignments_Type", "[Type] IN ('Writing','Speaking','Quiz')");
                    table.ForeignKey(
                        name: "FK_Assignments_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Assignments_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Assignments_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExamResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamResults_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamResults_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassId = table.Column<int>(type: "int", nullable: false),
                    RoomId = table.Column<int>(type: "int", nullable: true),
                    SessionNo = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReplacesSessionId = table.Column<int>(type: "int", nullable: true),
                    SyllabusLessonId = table.Column<int>(type: "int", nullable: true),
                    IsTaught = table.Column<bool>(type: "bit", nullable: false),
                    TaughtAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MeetingUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ContentTaught = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Homework = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AttendanceTakenAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AttendanceUnlockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSessions", x => x.Id);
                    table.CheckConstraint("CK_ClassSessions_Status", "[Status] IN ('Scheduled','Cancelled')");
                    table.CheckConstraint("CK_ClassSessions_Time", "[StartTime] < [EndTime]");
                    table.CheckConstraint("CK_ClassSessions_Type", "[Type] IN ('Regular','Makeup')");
                    table.ForeignKey(
                        name: "FK_ClassSessions_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassSessions_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSessions_SyllabusLessons_SyllabusLessonId",
                        column: x => x.SyllabusLessonId,
                        principalTable: "SyllabusLessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentId = table.Column<int>(type: "int", nullable: false),
                    OrderNo = table.Column<int>(type: "int", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Points = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentQuestions", x => x.Id);
                    table.CheckConstraint("CK_AssignmentQuestions_Type", "[QuestionType] IN ('MultipleChoice','FillBlank')");
                    table.ForeignKey(
                        name: "FK_AssignmentQuestions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentStudents",
                columns: table => new
                {
                    AssignmentId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentStudents", x => new { x.AssignmentId, x.StudentId });
                    table.ForeignKey(
                        name: "FK_AssignmentStudents_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentStudents_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    AttemptNo = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AnswersJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WordCount = table.Column<int>(type: "int", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsLate = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Tr = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Cc = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Fc = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Lr = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Gra = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    P = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    OverallBand = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    AutoScore = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    AutoMaxScore = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeedbackAudioUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReturnNote = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    GradedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissions", x => x.Id);
                    table.CheckConstraint("CK_Submissions_Status", "[Status] IN ('Submitted','Draft','Published','Returned')");
                    table.ForeignKey(
                        name: "FK_Submissions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Submissions_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsAuto = table.Column<bool>(type: "bit", nullable: false),
                    MarkedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.Id);
                    table.CheckConstraint("CK_Attendances_Status", "[Status] IN ('Present','Late','Absent','Excused')");
                    table.ForeignKey(
                        name: "FK_Attendances_ClassSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Attendances_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SessionMaterials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Kind = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionMaterials", x => x.Id);
                    table.CheckConstraint("CK_SessionMaterials_Kind", "[Kind] IN ('Pdf','Audio','Video','Link','Other')");
                    table.ForeignKey(
                        name: "FK_SessionMaterials_ClassSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClassId = table.Column<int>(type: "int", nullable: true),
                    SessionId = table.Column<int>(type: "int", nullable: true),
                    AvailabilityId = table.Column<int>(type: "int", nullable: true),
                    OneOnOneSessionId = table.Column<int>(type: "int", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: true),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ResponseNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentRequests", x => x.Id);
                    table.CheckConstraint("CK_StudentRequests_Status", "[Status] IN ('Pending','Approved','Rejected','Cancelled')");
                    table.CheckConstraint("CK_StudentRequests_Type", "[Type] IN ('Leave','Reschedule','OneOnOneBooking','OneOnOneCancel')");
                    table.ForeignKey(
                        name: "FK_StudentRequests_ClassSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentRequests_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentRequests_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentRequests_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeacherRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SessionId = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ProposedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ProposedStartTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    ProposedEndTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AdminNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherRequests", x => x.Id);
                    table.CheckConstraint("CK_TeacherRequests_Status", "[Status] IN ('Pending','Approved','Rejected','Cancelled')");
                    table.CheckConstraint("CK_TeacherRequests_Type", "[Type] IN ('Leave','Reschedule','AttendanceUnlock')");
                    table.ForeignKey(
                        name: "FK_TeacherRequests_ClassSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeacherRequests_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubmissionAnnotations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubmissionId = table.Column<int>(type: "int", nullable: false),
                    StartOffset = table.Column<int>(type: "int", nullable: false),
                    EndOffset = table.Column<int>(type: "int", nullable: false),
                    SelectedText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ErrorType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Suggestion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmissionAnnotations", x => x.Id);
                    table.CheckConstraint("CK_SubmissionAnnotations_Type", "[ErrorType] IN ('Grammar','Vocabulary','Coherence')");
                    table.ForeignKey(
                        name: "FK_SubmissionAnnotations_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_ClassId",
                table: "Announcements",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_TeacherId",
                table: "Announcements",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestions_AssignmentId",
                table: "AssignmentQuestions",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_ClassId_DueAt",
                table: "Assignments",
                columns: new[] { "ClassId", "DueAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_ExamId",
                table: "Assignments",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_TeacherId",
                table: "Assignments",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudents_StudentId",
                table: "AssignmentStudents",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_SessionId_StudentId",
                table: "Attendances",
                columns: new[] { "SessionId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_StudentId",
                table: "Attendances",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_ClassId_Date_StartTime",
                table: "ClassSessions",
                columns: new[] { "ClassId", "Date", "StartTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_RoomId",
                table: "ClassSessions",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_SyllabusLessonId",
                table: "ClassSessions",
                column: "SyllabusLessonId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentTemplates_TeacherId",
                table: "CommentTemplates",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamResults_ExamId_StudentId",
                table: "ExamResults",
                columns: new[] { "ExamId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamResults_StudentId",
                table: "ExamResults",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_ClassId",
                table: "Exams",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_TeacherId",
                table: "Exams",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_AnnouncementId",
                table: "Notifications",
                column: "AnnouncementId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_IsRead",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_OneOnOneSessions_StudentId",
                table: "OneOnOneSessions",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_OneOnOneSessions_TeacherId_Date",
                table: "OneOnOneSessions",
                columns: new[] { "TeacherId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRecommendations_FromClassId",
                table: "PromotionRecommendations",
                column: "FromClassId");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRecommendations_RecommendedCourseId",
                table: "PromotionRecommendations",
                column: "RecommendedCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRecommendations_StudentId",
                table: "PromotionRecommendations",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRecommendations_TeacherId",
                table: "PromotionRecommendations",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionMaterials_SessionId",
                table: "SessionMaterials",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentRequests_ClassId",
                table: "StudentRequests",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentRequests_SessionId",
                table: "StudentRequests",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentRequests_StudentId",
                table: "StudentRequests",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentRequests_TeacherId_Status",
                table: "StudentRequests",
                columns: new[] { "TeacherId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StudentReviews_ClassId",
                table: "StudentReviews",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentReviews_StudentId",
                table: "StudentReviews",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentReviews_TeacherId",
                table: "StudentReviews",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionAnnotations_SubmissionId",
                table: "SubmissionAnnotations",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_AssignmentId_StudentId_AttemptNo",
                table: "Submissions",
                columns: new[] { "AssignmentId", "StudentId", "AttemptNo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_Status_SubmittedAt",
                table: "Submissions",
                columns: new[] { "Status", "SubmittedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_StudentId",
                table: "Submissions",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SyllabusLessons_CourseId_OrderNo",
                table: "SyllabusLessons",
                columns: new[] { "CourseId", "OrderNo" });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAvailabilities_TeacherId_Date",
                table: "TeacherAvailabilities",
                columns: new[] { "TeacherId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherRatings_ClassId",
                table: "TeacherRatings",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherRatings_StudentId",
                table: "TeacherRatings",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherRatings_TeacherId",
                table: "TeacherRatings",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherRequests_SessionId",
                table: "TeacherRequests",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherRequests_TeacherId",
                table: "TeacherRequests",
                column: "TeacherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentQuestions");

            migrationBuilder.DropTable(
                name: "AssignmentStudents");

            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.DropTable(
                name: "CommentTemplates");

            migrationBuilder.DropTable(
                name: "ExamResults");

            migrationBuilder.DropTable(
                name: "GradeConfigs");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "OneOnOneSessions");

            migrationBuilder.DropTable(
                name: "PromotionRecommendations");

            migrationBuilder.DropTable(
                name: "SessionMaterials");

            migrationBuilder.DropTable(
                name: "StudentRequests");

            migrationBuilder.DropTable(
                name: "StudentReviews");

            migrationBuilder.DropTable(
                name: "SubmissionAnnotations");

            migrationBuilder.DropTable(
                name: "TeacherAvailabilities");

            migrationBuilder.DropTable(
                name: "TeacherRatings");

            migrationBuilder.DropTable(
                name: "TeacherRequests");

            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "ClassSessions");

            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "SyllabusLessons");

            migrationBuilder.DropTable(
                name: "Exams");

            migrationBuilder.DropColumn(
                name: "TargetBand",
                table: "Students");
        }
    }
}
