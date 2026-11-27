import { useEffect, useMemo, useState } from "react";
import { notifyCoursesChanged } from "../usePublicCourses";
import { useAuth } from "../../context/AuthContext";
import { ApiError, request, downloadFile } from "../apiClient";
import type { Course, AttendancePage } from "../../types/StudentTypes/MainTypes";

export interface StudentDashboardResponse {
  student: {
    id: string;
    code: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  nextLesson?: {
    courseId?: number;
    courseName: string;
    bandFrom: string;
    bandTo: string;
    description?: string;
    totalSessions?: number;
    imageUrl?: string;
    nextDate?: string;
    startTime?: string;
    endTime?: string;
    // chi tiết buổi để mở popup buổi học
    classId?: number;
    className: string;
    teacherName?: string;
    roomName?: string;
    sessionNo?: number;
    classTotalSessions?: number;
  };
  // Lịch tuần từng khóa (1=Thứ 2 .. 7=Chủ nhật) — FE tính buổi kế theo đồng hồ máy
  lessonSlots?: Array<{
    courseId: number;
    classId?: number;
    startDate?: string;
    endDate?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  courses: Array<{
    id: string;
    name: string;
    description: string;
    bandFrom: string;
    bandTo: string;
    totalSessions: number;
    sessionsPerWeek: number;
    tuition: number;
    discountPercent: number;
    imageUrl?: string;
    teacherName?: string;
    classId?: number;
    classStatus?: ClassStatus;
    startDate?: string;
    endDate?: string;
    sessionsDone?: number;
    classTotalSessions?: number;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
  }>;
}

export function useStudentApi() {
  const { token, logout } = useAuth();
  return useMemo(() => ({
    async get<T>(path: string, signal?: AbortSignal) {
      if (!token) throw new ApiError(401, "Chưa đăng nhập.");
      try {
        return await request<T>(`/api/student/${path}`, token, { signal });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    async send<T = void>(method: string, path: string, body?: unknown) {
      if (!token) throw new ApiError(401, "Chưa đăng nhập.");
      try {
        const result = await request<T>(`/api/student/${path}`, token, {
          method,
          body: body === undefined ? undefined : JSON.stringify(body)
        });
        if (/^(enrollments|course-registrations)(\/|$)/.test(path)) notifyCoursesChanged();
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    // Upload file (multipart/form-data), ví dụ đổi avatar
    async upload<T>(path: string, form: FormData) {
      if (!token) throw new ApiError(401, "Chưa đăng nhập.");
      try {
        return await request<T>(`/api/student/${path}`, token, { method: "POST", body: form });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    // Tải file (kèm Authorization) rồi lưu về máy với tên gốc
    async download(path: string, fileName?: string) {
      if (!token) throw new ApiError(401, "Chưa đăng nhập.");
      try {
        return await downloadFile(`/api/student/${path}`, token, fileName);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    }
  }), [token, logout]);
}

export function useStudentDashboard() {
  // Dùng hook chung: có reload để làm mới "buổi học tiếp theo" khi buổi hiện tại đã qua
  return useStudentQuery<StudentDashboardResponse>("dashboard");
}


// GET api/student/courses - danh sách khóa học của trung tâm (trang Courses)
export function useStudentCourses() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<Course[]>("courses", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách khóa học.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token]);

  return { data, error, loading };
}

export type ClassStatus = "Upcoming" | "Ongoing" | "Finished";
export type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Refunded";

export interface StudentEnrollmentItem {
  enrollmentId: number;
  status: string;
  course: Course;
  tuitionFee: number;       // học phí gốc chốt lúc ghi danh
  discountPercent: number;
  discountAmount: number;
  extraDiscountAmount?: number;
  discountNote?: string;
  finalTuitionFee: number;  // số tiền thực phải thanh toán
  // Lớp + trạng thái theo ngày của lớp
  classId: number;
  className: string;
  classStatus: ClassStatus;
  startDate: string;
  endDate: string;
  teacherName: string;
  scheduleText: string;
  sessionsDone: number;
  classTotalSessions: number;
  canCancel: boolean;
  // Tiền
  isPaid: boolean;          // đã đóng đủ
  paidAmount?: number;
  pendingAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paidDate?: string;
  method?: string;
}

// GET api/student/enrollments - các ghi danh của học viên (khối khóa đã đăng ký trang Courses)
export function useStudentEnrollments() {
  const query = useStudentQuery<StudentEnrollmentItem[]>("enrollments");
  return { ...query, data: query.data ?? [] };
}

export interface StudentPayment {
  id: number;
  receiptNo?: string;
  kind: "Payment" | "Refund";
  status: "Pending" | "Confirmed" | "Rejected" | "Cancelled";
  amount: number;
  method: string;
  paidDate: string;
  transferRef?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface StudentTuitionItem {
  enrollmentId: number;
  classId: number;
  className: string;
  enrollmentStatus: string;
  extraDiscountAmount: number;
  discountNote?: string;
  pendingAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  payments: StudentPayment[];
  courseName: string;
  bandFrom: string;
  bandTo: string;
  totalSessions: number;
  tuitionFee: number;
  discountPercent: number;
  discountAmount: number;
  finalTuitionFee: number;
  paymentId?: number;
  paidAmount?: number;
  paidDate?: string;
  method?: string;
  note?: string;
  isPaid: boolean;
}

// GET api/student/tuition - danh sách học phí của học viên (trang Tuition)
export function useStudentTuition() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentTuitionItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentTuitionItem[]>("tuition", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được dữ liệu học phí.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

export interface StudentScheduleDay {
  key: string;
  label: string;
  dateStr: string;
}

export interface StudentScheduleSession {
  classId: string;
  className: string;
  attendanceStatus?: "Present" | "Late" | "Absent" | "Excused" | null;
  attendanceNote?: string;
  newAssignments?: number;
  courseName: string;
  bandFrom: string;
  bandTo: string;
  description: string;
  totalSessions: number;
  teacherName?: string;
  roomName?: string;
  dayOfWeek: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  sessionNo: number;
  isCancelled: boolean;
  cancelReason?: string;
}

export interface StudentScheduleNotice {
  title: string;
  dateStr: string;
  message: string;
}

export interface StudentScheduleResponse {
  weekStart: string;
  weekEnd: string;
  days: StudentScheduleDay[];
  sessions: StudentScheduleSession[];
  notices: StudentScheduleNotice[];
}

// GET api/student/schedule?date= - thời khóa biểu tuần chứa ngày date
export function useStudentSchedule(dateStr: string) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentScheduleResponse>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentScheduleResponse>(`schedule?date=${dateStr}`, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được lịch học.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, dateStr]);

  return { data, error, loading };
}

export interface StudentScheduleHistoryItem {
  enrollmentId: number;
  status: string;
  classStatus: ClassStatus;
  className: string;
  year: number;
  attendedSessions: number;
  markedSessions: number;
  assignmentCount: number;
  submittedCount: number;
  feedbackCount: number;
  lastFeedbackAt?: string;
  registeredAt: string;
  classId: string;
  startDate: string;
  endDate: string;
  courseName: string;
  band: string;
  totalSessions: number;
  teacherName: string;
}

// GET api/student/schedule/history - khóa đã qua (ghi danh không còn Active)
export function useStudentScheduleHistory() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentScheduleHistoryItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentScheduleHistoryItem[]>("schedule/history", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được lịch sử khóa học.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token]);

  return { data, error, loading };
}

export interface StudentFeedbackClass {
  classId: number;
  className: string;
  courseId: string;
  courseName: string;
  description: string;
  bandFrom: string;
  bandTo: string;
  totalSessions: number;
  sessionsPerWeek: number;
  tuition: number;
  teacherId: number;
  teacherName: string;
}

// GET api/student/feedback/classes - các lớp đang học để gửi phản hồi
export function useStudentFeedbackClasses() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentFeedbackClass[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentFeedbackClass[]>("feedback/classes", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách lớp học.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token]);

  return { data, error, loading };
}

export interface StudentFeedbackItem {
  id: number;
  content: string;
  createdAt: string;
  teacherName: string;
}

// GET api/student/feedback?classId= - nhận xét giáo viên viết cho chính mình (classId null thì không gọi)
export function useStudentFeedbackList(classId: number | null) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentFeedbackItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token || classId == null) {
      setData([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentFeedbackItem[]>(`feedback?classId=${classId}`, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách phản hồi.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, classId, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

export interface StudentAssignmentItem {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  hasFile: boolean;
  createdAt: string;
  mySubmission?: { id: number; fileName: string; submittedAt: string } | null;
}

// GET api/student/assignments?courseId= - bài tập GV giao cho khóa + bài nộp của mình
export function useStudentAssignments(courseId: string | undefined, classId?: number) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentAssignmentItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token || (!courseId && !classId)) {
      setData([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    // Bài tập theo LỚP; dữ liệu chưa có classId thì BE tự lấy lớp của mình trong khóa
    api.get<StudentAssignmentItem[]>(classId ? `assignments?classId=${classId}` : `assignments?courseId=${courseId}`, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách bài tập.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, courseId, classId, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

export interface StudentCourseDetail {
  id: string;
  name: string;
  description?: string;
  bandFrom: string;
  bandTo: string;
  totalSessions: number;
  sessionsPerWeek: number;
  tuition: number;
  discountPercent: number;
  teachers: { fullName: string; specialty?: string; degree?: string }[];
  classes: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    teacherName: string;
    schedules: { dayOfWeek: string; startTime: string; endTime: string; roomName?: string }[];
  }[];
}

// GET api/student/courses/{courseId}/detail - chi tiết khóa (popup Present Lessons)
export function useStudentCourseDetail(courseId: string | undefined) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentCourseDetail>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !courseId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentCourseDetail>(`courses/${courseId}/detail`, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được chi tiết khóa học.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, courseId]);

  return { data, error, loading };
}

// GET api/student/attendance?courseId=&page= - điểm danh của mình trong khóa, 10 buổi/trang
export function useStudentAttendance(courseId: string | undefined, page: number, classId?: number) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<AttendancePage>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || (!courseId && !classId)) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<AttendancePage>(classId ? `attendance?classId=${classId}&page=${page}` : `attendance?courseId=${courseId}&page=${page}`, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được dữ liệu điểm danh.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, courseId, classId, page]);

  return { data, error, loading };
}

export interface StudentProfile {
  code: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  status?: string;
  targetBand?: number;
}

// GET api/student/profile - hồ sơ học viên đang đăng nhập
export function useStudentProfile() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentProfile>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.get<StudentProfile>("profile", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được hồ sơ.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

// ---------- Hook chung + API mới (đăng ký theo lớp, học phí chuyển khoản, đánh giá GV) ----------

// Tải dữ liệu học viên: data / loading / error / reload. path = null thì không tải.
export function useStudentQuery<T>(path: string | null) {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(path !== null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!path || !/^(course-registrations|enrollments|dashboard|tuition|schedule)([/?]|$)/.test(path)) return;
    const refresh = () => setReloadKey(v => v + 1);
    const storage = (e: StorageEvent) => { if (e.key === "ecw_courses_revision") refresh(); };
    window.addEventListener("focus", refresh); window.addEventListener("courses-changed", refresh); window.addEventListener("storage", storage);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("courses-changed", refresh); window.removeEventListener("storage", storage); };
  }, [path]);
  useEffect(() => {
    if (!token || path === null) { setData(undefined); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError("");
    api.get<T>(path, controller.signal)
      .then(res => { if (!controller.signal.aborted) setData(res); })
      .catch(err => { if (!controller.signal.aborted) { setData(undefined); setError(err instanceof Error ? err.message : "Không tải được dữ liệu."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, token, path, reloadKey]);
  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

export interface StudentClassOption {
  id: number;
  name: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  schedules: { dayOfWeek: number; startTime: string; endTime: string; roomName?: string }[];
  enrolled: number;
  maxStudents: number;
  totalSessions: number;
  remainingSessions: number;
  finalTuition: number;
  isFull: boolean;
  conflict?: string | null;
  alreadyInCourse?: string | null;
  canEnroll: boolean;
  reason?: string | null;
}

// GET api/student/courses/{courseId}/classes - lớp còn mở của khóa (để chọn lớp khi đăng ký)
export const useStudentCourseClasses = (courseId: string | null) =>
  useStudentQuery<StudentClassOption[]>(courseId ? `courses/${courseId}/classes` : null);

export interface StudentBankInfo { bankName: string; accountNumber: string; accountName: string; branch?: string }
export const useStudentBankInfo = () => useStudentQuery<StudentBankInfo>("tuition/bank-info");

export interface StudentReviewClass {
  classId: number;
  className: string;
  courseName: string;
  teacherId: number;
  teacherName: string;
  startDate: string;
  endDate: string;
  review?: { id: number; rating: number; comment: string; isPublished: boolean; createdAt: string } | null;
}
export const useStudentReviews = () => useStudentQuery<StudentReviewClass[]>("reviews");
