import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, request } from "../apiClient";
import type { Course } from "../../types/StudentTypes/MainTypes";

export interface StudentDashboardResponse {
  student: {
    id: string;
    code: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  nextLesson?: {
    courseName: string;
    bandFrom: string;
    bandTo: string;
    description?: string;
    totalSessions?: number;
    imageUrl?: string;
    nextDate?: string;
    startTime?: string;
    endTime?: string;
  };
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
        return await request<T>(`/api/student/${path}`, token, {
          method,
          body: body === undefined ? undefined : JSON.stringify(body)
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    }
  }), [token, logout]);
}

export function useStudentDashboard() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentDashboardResponse>();
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

    api.get<StudentDashboardResponse>("dashboard", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được dữ liệu dashboard.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token]);

  return { data, error, loading };
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

export interface StudentEnrollmentItem {
  enrollmentId: number;
  status: string;
  course: Course;
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: string;
  method?: string;
}

// GET api/student/enrollments - các ghi danh của học viên (khối khóa đã đăng ký trang Courses)
export function useStudentEnrollments() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentEnrollmentItem[]>([]);
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

    api.get<StudentEnrollmentItem[]>("enrollments", controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách ghi danh.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [api, token, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey(k => k + 1) };
}

export interface StudentTuitionItem {
  enrollmentId: number;
  className: string;
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
  registeredAt: string;
  classId: string;
  className: string;
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
  studentName: string;
}

// GET api/student/feedback?classId= - phản hồi của lớp (classId null thì không gọi)
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
  targetBand?: number;
}

// GET api/student/profile - hồ sơ học viên đang đăng nhập
export function useStudentProfile() {
  const api = useStudentApi();
  const { token } = useAuth();
  const [data, setData] = useState<StudentProfile>();
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
  }, [api, token]);

  return { data, error, loading };
}
