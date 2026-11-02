// Kiểu dữ liệu trả về từ api/teacher/* (camelCase, đúng như BE trả). Xem docs/api/TEACHER_API.md.
// Ngày "yyyy-MM-dd", giờ "HH:mm:ss", ngày giờ "yyyy-MM-ddTHH:mm:ss" (giờ VN, không có Z).

export type SessionStatus = "Upcoming" | "Ongoing" | "Done" | "Cancelled";
export type AttendanceMark = "Present" | "Late" | "Absent" | "Excused";
export type Skill = "Writing" | "Speaking" | "Reading" | "Listening";
export type AssignmentType = "Writing" | "Speaking" | "Quiz";
export type SubmissionStatus = "Submitted" | "Draft" | "Published" | "Returned";
export type Criterion = "TR" | "CC" | "FC" | "LR" | "GRA" | "P";

export interface Paged<T> { items: T[]; totalItems: number; page: number; pageSize: number; totalPages?: number }

export interface NotificationItem {
  id: number; type: string; title: string; content?: string | null; link?: string | null;
  isRead: boolean; createdAt: string;
}

// ---------- §1 Dashboard ----------
export interface DashboardScheduleItem {
  kind: "Class" | "Makeup" | "OneOnOne"; sessionId: number; classId: number; title: string; sessionNo: number;
  startTime: string; endTime: string; roomName?: string | null; enrolledCount?: number | null;
  maxStudents?: number | null; status: SessionStatus; attendanceTaken: boolean;
}
export interface TeacherDashboard {
  today: string; teacherName: string;
  stats: { ongoingClasses: number; activeStudents: number; sessionsToday: number; pendingGrading: number };
  todaySchedule: DashboardScheduleItem[];
  grading: { pending: number; overdue: number; writing: number; speaking: number; nextSubmissionId?: number | null };
  attentionStudents: { studentId: number; code: string; fullName: string; classId: number; className: string; reasons: string[] }[];
  pendingRequests: { count: number; items: { id: number; type: string; createdAt: string; date?: string | null; reason?: string | null; studentName: string; className?: string | null }[] };
  notifications: { unreadCount: number; latest: NotificationItem[] };
  shortcuts: { attendanceSessionId?: number | null; attendanceClassId?: number | null; nextSubmissionId?: number | null };
}

// ---------- §2 Lịch dạy ----------
export interface ScheduleEvent {
  kind: "Class" | "Makeup" | "OneOnOne"; id: number; classId?: number | null; title: string; courseName?: string | null;
  sessionNo?: number | null; date: string; startTime: string; endTime: string; roomName?: string | null;
  enrolledCount?: number | null; maxStudents?: number | null; studentName?: string | null; meetingUrl?: string | null;
  status: SessionStatus; attendanceTaken: boolean;
}
export interface AvailabilitySlot { id: number; date: string; startTime: string; endTime: string; note?: string | null; isBooked: boolean }
export interface ScheduleResponse {
  from: string; to: string; today: string; previous: string; next: string;
  events: ScheduleEvent[];
  days: { date: string; dayOfWeek: number; isToday: boolean; events: ScheduleEvent[] }[];
  availability?: AvailabilitySlot[] | null;
}
export interface LeaveRequestItem {
  id: number; type: "Leave" | "Reschedule"; status: string; reason: string; adminNote?: string | null;
  createdAt: string; processedAt?: string | null;
  proposedDate?: string | null; proposedStartTime?: string | null; proposedEndTime?: string | null;
  session: { id: number; classId: number; className: string; sessionNo: number; date: string; startTime: string; endTime: string };
}

// ---------- §3 Lớp ----------
export interface ClassScheduleSlot { id?: number; dayOfWeek: number; startTime: string; endTime: string; roomName: string }
export interface TeacherClass {
  id: number; name: string; courseId: number; courseName: string; startDate: string; endDate: string;
  enrolledCount: number; maxStudents: number; meetingUrl?: string | null; schedules: ClassScheduleSlot[];
  totalSessions: number; doneSessions: number; taughtLessons: number; progressPercent: number;
  status: "Upcoming" | "Ongoing" | "Finished";
}
export interface ClassStudent {
  studentId: number; code: string; fullName: string; phone?: string | null; email?: string | null;
  targetBand?: number | null; status: string; studentStatus?: string | null;
  attendanceRate?: number | null; absenceWarning: boolean;
}
export interface TeacherClassDetail extends TeacherClass {
  bandFrom: number; bandTo: number; syllabusLessons: number; defaultSessionId?: number | null; students: ClassStudent[];
}
export interface ClassSessionRow {
  id: number; sessionNo: number; date: string; startTime: string; endTime: string; type: string;
  roomName?: string | null; syllabusLessonId?: number | null; lessonTitle?: string | null; isTaught: boolean;
  materialCount: number; hasLog: boolean; attendanceTaken: boolean; status: SessionStatus;
}
export interface ClassSessionsResponse { defaultSessionId?: number | null; sessions: ClassSessionRow[] }
export interface SyllabusResponse {
  courseId: number; totalLessons: number; taughtLessons: number; completionPercent: number;
  lessons: { id: number; orderNo: number; title: string; description?: string | null; isTaught: boolean;
    sessions: { sessionId: number; sessionNo: number; date: string; isTaught: boolean }[] }[];
}
export interface SessionMaterial { id: number; title: string; kind: string; url: string; createdAt: string }
export interface SessionDetail {
  id: number; classId: number; className: string; courseName: string; sessionNo: number; date: string;
  startTime: string; endTime: string; type: string; roomName?: string | null; status: SessionStatus;
  lesson?: { id: number; orderNo: number; title: string } | null; isTaught: boolean; taughtAt?: string | null;
  meetingUrl?: string | null; classMeetingUrl?: string | null; effectiveMeetingUrl?: string | null;
  contentTaught?: string | null; homework?: string | null; materials: SessionMaterial[];
  attendance: { taken: boolean; attendanceTakenAt?: string | null; locked: boolean; lockAt: string;
    present: number; late: number; absent: number; excused: number };
}

// ---------- §4 Điểm danh ----------
export interface AttendanceSheetStudent {
  studentId: number; code: string; fullName: string; enrollmentStatus: string; requiresAttendance: boolean;
  status: AttendanceMark | null; note?: string | null; isMarked: boolean; autoExcused: boolean; hasApprovedLeave: boolean;
  attendanceRate?: number | null; absenceRate?: number | null; absenceWarning: boolean;
}
export interface AttendanceSheet {
  session: { id: number; classId: number; className: string; sessionNo: number; date: string; startTime: string; endTime: string; type: string; status: SessionStatus };
  taken: boolean; takenAt?: string | null; canTakeYet: boolean; locked: boolean; lockAt: string;
  unlockedUntil?: string | null; pendingUnlockRequest: boolean;
  summary: { total: number; present: number; late: number; absent: number; excused: number; unmarked: number };
  students: AttendanceSheetStudent[];
  notRequired: { studentId: number; code: string; fullName: string; enrollmentStatus: string }[];
}
export interface AttendanceSaveResponse {
  message: string; warnings: { studentId: number; fullName?: string | null; absenceRate?: number | null }[]; sheet: AttendanceSheet;
}
export interface ClassAttendanceSummary {
  warningThresholdPercent: number;
  sessions: { id: number; sessionNo: number; date: string }[];
  students: { studentId: number; code: string; fullName: string; enrollmentStatus: string;
    marks: { sessionId: number; status: AttendanceMark | null }[];
    present: number; late: number; absent: number; excused: number;
    attendanceRate?: number | null; absenceRate?: number | null; consecutiveAbsences: number; warning: boolean }[];
}

// ---------- §5 Bài tập ----------
export interface AssignmentListItem {
  id: number; title: string; classId: number; className: string; skill: Skill; type: AssignmentType; dueAt: string;
  allowLate: boolean; assignToAll: boolean; examId?: number | null; createdAt: string; isOpen: boolean;
  assignedCount: number; submittedCount: number; pendingGrading: number;
}
export interface QuestionInput {
  questionType: "MultipleChoice" | "FillBlank"; content: string; options?: string[] | null; correctAnswer: string; points: number;
}
export interface AssignmentDetail {
  id: number; classId: number; className: string; title: string; skill: Skill; type: AssignmentType; prompt: string;
  dueAt: string; minWords?: number | null; attachmentUrl?: string | null; note?: string | null; allowLate: boolean;
  assignToAll: boolean; examId?: number | null; isOpen: boolean; assignedCount: number; submittedCount: number;
  students?: { studentId: number; code: string; fullName: string }[] | null;
  questions: (QuestionInput & { id: number; orderNo: number })[];
}
export interface AssignmentRequestBody {
  classId: number; skill: Skill; type: AssignmentType; title: string; prompt: string; dueAt: string;
  minWords: number | null; attachmentUrl: string | null; note: string | null; allowLate: boolean;
  assignToAll: boolean; studentIds: number[]; questions: QuestionInput[]; examId: number | null;
}
export interface MissingResponse {
  assignmentId: number; dueAt: string; isOverdue: boolean; count: number;
  students: { id: number; code: string; fullName: string; phone?: string | null }[];
}

// ---------- §6 Chấm bài ----------
export interface GradingListItem {
  id: number; assignmentId: number; assignmentTitle: string; skill: Skill; type: AssignmentType; classId: number;
  className: string; studentId: number; studentCode: string; studentName: string; attemptNo: number;
  submittedAt: string; isLate: boolean; status: SubmissionStatus; overallBand?: number | null;
  autoScore?: number | null; autoMaxScore?: number | null; wordCount?: number | null;
  gradingOverdue: boolean; gradingDueAt: string;
}
export interface GradingSummary { pending: number; overdue: number; writing: number; speaking: number }
export interface Annotation {
  id?: number; startOffset: number; endOffset: number; selectedText: string;
  errorType: "Grammar" | "Vocabulary" | "Coherence"; suggestion?: string | null; comment?: string | null;
}
export interface Scores { tr?: number | null; cc?: number | null; fc?: number | null; lr?: number | null; gra?: number | null; p?: number | null }
export interface GradingDetail {
  id: number; status: SubmissionStatus; attemptNo: number; submittedAt: string; isLate: boolean; gradingOverdue: boolean;
  student: { id: number; code: string; fullName: string; targetBand?: number | null };
  assignment: { id: number; title: string; skill: Skill; type: AssignmentType; prompt: string; attachmentUrl?: string | null;
    minWords?: number | null; dueAt: string; classId: number; className: string };
  content?: string | null; wordCount?: number | null; minWordsWarning: boolean; minWordsMessage?: string | null;
  audioUrl?: string | null;
  quiz?: { questionId: number; content: string; answer?: string | null; correctAnswer: string; isCorrect: boolean; points: number }[] | null;
  criteria: Criterion[]; scores: Scores; overallBand?: number | null; autoScore?: number | null; autoMaxScore?: number | null;
  feedback?: string | null; feedbackAudioUrl?: string | null; returnNote?: string | null;
  gradedAt?: string | null; publishedAt?: string | null; annotations: Annotation[];
  history: { id: number; attemptNo: number; submittedAt: string; status: SubmissionStatus; overallBand?: number | null; isLate: boolean; returnNote?: string | null }[];
  nextSubmissionId?: number | null;
}
export interface CommentTemplate { id: number; skill: string; criterion?: string | null; content: string; isMine: boolean }

// ---------- §7 Kiểm tra & sổ điểm ----------
export type ExamType = "Periodic" | "Midterm" | "Final";
export interface ExamListItem {
  id: number; classId: number; className: string; title: string; type: ExamType; skill?: Skill | null; examDate: string;
  durationMinutes?: number | null; maxScore: number; createdAt: string; studentCount: number; scoredCount: number;
  averageScore?: number | null; onlinePartCount: number;
}
export interface ExamDetail extends Omit<ExamListItem, "studentCount" | "scoredCount" | "averageScore" | "onlinePartCount"> {
  onlineParts: { id: number; title: string; skill: Skill; type: AssignmentType; dueAt: string; submittedCount: number; pendingGrading: number }[];
  results: { studentId: number; code: string; fullName: string; enrollmentStatus: string; score?: number | null; source?: string | null; note?: string | null; updatedAt?: string | null }[];
}
export interface GradeConfig { classId?: number; assignmentWeight: number; periodicWeight: number; midtermWeight: number; finalWeight: number; passScore: number }
export interface Gradebook {
  classId: number; className: string; config: GradeConfig;
  columns: { id: number; kind: "Assignment" | "Exam"; title: string; type?: string | null; skill?: string | null; date: string; maxScore: number }[];
  rows: { studentId: number; code: string; fullName: string; enrollmentStatus: string;
    cells: { columnId: number; kind: "Assignment" | "Exam"; score?: number | null; score10?: number | null; band?: number | null; missing: boolean }[];
    assignmentAverage?: number | null; periodicAverage?: number | null; midtermAverage?: number | null; finalAverage?: number | null;
    finalScore?: number | null; result?: "Pass" | "Fail" | null }[];
}

// ---------- §8 Học viên ----------
export interface TeacherStudentItem {
  id: number; code: string; fullName: string; phone?: string | null; email?: string | null; targetBand?: number | null;
  status: string; classes: { classId: number; className: string; enrollmentStatus: string }[];
  attendanceRate?: number | null; absenceWarning: boolean; latestBand?: number | null;
}
export interface AttendanceStat {
  totalMarked: number; present: number; late: number; absent: number; excused: number;
  attendanceRate?: number | null; absenceRate?: number | null; consecutiveAbsences: number; warning: boolean;
}
export interface StudentProfile {
  student: { id: number; code: string; fullName: string; phone?: string | null; email?: string | null; dateOfBirth?: string | null;
    parentName?: string | null; parentPhone?: string | null; targetBand?: number | null; status: string; avatarUrl?: string | null };
  classes: { classId: number; className: string; courseName: string; startDate: string; endDate: string; enrollmentStatus: string;
    attendance?: AttendanceStat | null; missingAssignments: number }[];
  targetBand?: number | null;
  bandHistory: { submissionId: number; date: string; skill: string; title: string; band: number; attemptNo: number }[];
  bandBySkill: { skill: string; average: number; latest: number }[];
  examHistory: { examId: number; title: string; type: string; skill?: string | null; date: string; score: number; maxScore: number; score10: number }[];
  submissions: { id: number; assignmentId: number; title: string; skill: string; type: string; className: string; attemptNo: number;
    submittedAt: string; isLate: boolean; status: SubmissionStatus; overallBand?: number | null; autoScore?: number | null; autoMaxScore?: number | null }[];
}
export type ReviewPeriod = "Monthly" | "MidCourse" | "EndCourse";
export interface StudentReviewBody {
  classId: number; period: ReviewPeriod; periodLabel?: string | null; attitude?: string | null; attendanceComment?: string | null;
  strengths?: string | null; improvements?: string | null; listeningComment?: string | null; readingComment?: string | null;
  writingComment?: string | null; speakingComment?: string | null; overallComment?: string | null;
}
export interface StudentReview extends StudentReviewBody { id: number; studentId: number; className: string; createdAt: string; updatedAt?: string | null }
export interface PromotionItem {
  id: number; studentId: number; studentName: string; studentCode: string; fromClassId: number; fromClassName: string;
  recommendedCourseId?: number | null; recommendedCourseName?: string | null; reason?: string | null; status: string; createdAt: string;
}

// ---------- §9 Yêu cầu & thông báo ----------
export interface StudentRequestItem {
  id: number; type: "Leave" | "Reschedule" | "OneOnOneBooking" | "OneOnOneCancel"; status: string;
  reason?: string | null; responseNote?: string | null; createdAt: string; processedAt?: string | null;
  student: { id: number; code: string; fullName: string; phone?: string | null };
  class?: { id: number; name: string } | null;
  session?: { id: number; sessionNo: number; date: string; startTime: string; endTime: string } | null;
  availabilityId?: number | null; oneOnOneSessionId?: number | null;
  date?: string | null; startTime?: string | null; endTime?: string | null;
}
export interface OneOnOneItem {
  id: number; date: string; startTime: string; endTime: string; topic?: string | null; meetingUrl?: string | null; status: string;
  student: { id: number; code: string; fullName: string };
}
export interface AnnouncementItem {
  id: number; title: string; content: string; classId?: number | null; className?: string | null;
  recipientCount: number; readCount: number; createdAt: string;
}

// ---------- §10 Hồ sơ ----------
export interface TeacherProfile {
  id: number; fullName: string; email: string; phone?: string | null; specialty?: string | null; degree?: string | null;
  hireDate?: string | null; status?: string | null; avatarUrl?: string | null; classCount: number;
}
export interface TeacherRatings {
  totalRatings: number; averageScore?: number | null; distribution: { score: number; count: number }[];
  comments: { id: number; score: number; comment?: string | null; createdAt: string; className?: string | null; studentName: string }[];
}
export interface Timesheet {
  month: string; classSessions: number; classHours: number; makeupSessions: number; oneOnOneSessions: number;
  oneOnOneHours: number; totalSessions: number; totalHours: number; sessionsNotMarked: number;
  byClass: { classId: number; className: string; sessions: number; hours: number }[];
  details: { kind: string; id: number; date: string; startTime: string; endTime: string; title: string; sessionNo: number; roomName?: string | null; hours: number }[];
}
