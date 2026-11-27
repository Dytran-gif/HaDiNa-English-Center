// Kiểu dữ liệu API vùng Teacher (docs/api/TEACHER_API.md). Ngày giờ là chuỗi giờ VN, không có "Z".

export interface ScheduleSlot { dayOfWeek: number; startTime: string; endTime: string; roomName: string }

export interface TeacherClass {
  id: number; name: string; courseId: number; courseName: string; startDate: string; endDate: string;
  maxStudents: number; enrolledCount: number; schedules: ScheduleSlot[];
  status: "Ongoing" | "Upcoming" | "Finished";
}

export interface ClassStudent {
  id: number; code: string; fullName: string; phone?: string | null; email: string;
  enrollmentStatus: string; enrolledAt: string;
}
export interface TeacherClassDetail extends TeacherClass { totalSessions: number; sessionsDone: number; students: ClassStudent[] }

export interface ScheduleEvent {
  date: string; classId: number; className: string; courseName: string;
  startTime: string; endTime: string; roomName: string; attendanceMarked: boolean;
}

export interface RecentSubmission {
  id: number; assignmentId?: number | null; assignmentTitle: string; studentCode: string; studentName: string;
  submittedAt: string; hasFile: boolean;
}
export interface TeacherDashboard {
  classCount: number; ongoingClassCount: number; studentCount: number; assignmentCount: number;
  newSubmissionCount: number; today: ScheduleEvent[]; recentSubmissions: RecentSubmission[];
  /** Buổi 7 ngày qua (tính cả hôm nay) chưa điểm danh */
  unmarkedSessions: ScheduleEvent[];
}

export interface TeacherStudentItem {
  id: number; code: string; fullName: string; phone?: string | null; email: string; status: string;
  classes: { id: number; name: string; enrollmentStatus: string }[];
}

export interface FeedbackItem {
  id: number; studentId: number; studentCode: string; studentName: string;
  classId: number; className: string; content: string; createdAt: string;
}

export interface StudentSubmissionRow {
  id: number; assignmentId?: number | null; assignmentTitle: string; fileName: string; hasFile: boolean; submittedAt: string;
}
export interface TeacherStudentDetail {
  student: {
    id: number; code: string; fullName: string; phone?: string | null; email: string; dateOfBirth?: string | null;
    address?: string | null; parentName?: string | null; parentPhone?: string | null; status: string; avatarUrl?: string | null;
  };
  classes: { id: number; name: string; courseName: string; status: string; startDate: string; endDate: string }[];
  submissions: StudentSubmissionRow[];
  feedbacks: FeedbackItem[];
  attendance: { classId: number; present: number; late: number; absent: number; excused: number }[];
  recentAbsences: { classId: number; className: string; date: string; status: AttendanceStatus; note?: string | null }[];
}

export interface CourseOption { id: number; name: string }

/** Lớp mình dạy để chọn khi giao bài (GET assignments/classes) */
export interface ClassOption { id: number; name: string; courseId: number; courseName: string; status: "Ongoing" | "Upcoming" | "Finished" }

/** Hồ sơ hiển thị trên website (GET/PUT profile/public) */
export interface TeacherPublicProfile {
  exists: boolean; slug?: string | null; fullName: string; avatarUrl?: string | null; title: string; bio: string;
  credentials: string[]; isPublished: boolean; courses: string[];
}

/** Đánh giá của học viên về mình (GET reviews) */
export interface TeacherReviewList {
  average: number; count: number;
  items: { id: number; rating: number; comment: string; isPublished: boolean; createdAt: string; className: string; studentName: string }[];
}

export interface TeacherAssignment {
  id: number; title: string; description?: string | null; fileName: string; hasFile: boolean;
  courseId?: number | null; courseName?: string | null; createdAt: string; submittedCount: number; studentCount: number;
  /** Lớp nhận bài; null = giao chung cho mọi lớp của mình trong khóa (hoặc bài cũ) */
  classId?: number | null; className?: string | null;
}

export interface AssignmentSubmissions {
  assignment: Omit<TeacherAssignment, "submittedCount" | "studentCount">;
  items: {
    studentId: number; code: string; fullName: string; className: string; attemptCount: number;
    submission: { id: number; fileName: string; hasFile: boolean; submittedAt: string } | null;
  }[];
}

export interface TeacherProfile {
  id: number; fullName: string; email: string; phone?: string | null; specialty?: string | null; degree?: string | null;
  hireDate?: string | null; status?: string | null; avatarUrl?: string | null; classCount: number;
}

export type AttendanceStatus = "Present" | "Late" | "Absent" | "Excused";

export interface AttendanceSession {
  date: string; startTime: string; endTime: string; roomName: string; isToday: boolean;
  studentCount: number; markedCount: number; absentCount: number; lateCount: number;
}

export interface AttendanceRoster {
  classId: number; className: string; date: string; startTime: string; endTime: string; roomName: string; canEdit: boolean;
  items: { studentId: number; code: string; fullName: string; enrollmentStatus: string; status: AttendanceStatus | null; note: string | null }[];
}

export interface AttendanceSummary {
  heldDays: number; markedDays: number;
  items: {
    studentId: number; code: string; fullName: string; enrollmentStatus: string;
    present: number; late: number; absent: number; excused: number; total: number; attendanceRate: number | null;
  }[];
}
