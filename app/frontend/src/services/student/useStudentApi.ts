import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, request } from "../apiClient";

export interface StudentDashboardResponse {
  student: {
    id: number;
    code: string;
    fullName: string;
    avatarUrl?: string;
    targetBand?: number;
  };
  stats: {
    ongoingClasses: number;
    pendingAssignments: number;
    attendanceRate: number;
    targetBand?: number;
    latestBand?: number;
  };
  nextLesson?: {
    classId: number;
    className: string;
    courseName: string;
    description?: string;
    bandFrom: number;
    bandTo: number;
    totalSessions: number;
    imageUrl?: string;
    teacherName?: string;
    nextDate?: string;
    startTime?: string;
    endTime?: string;
    roomName?: string;
    meetingUrl?: string;
  };
  todaySessions: Array<{
    sessionId: number;
    classId: number;
    kind: string;
    title: string;
    sessionNo: number;
    date: string;
    startTime: string;
    endTime: string;
    roomName?: string;
    teacherName?: string;
    meetingUrl?: string;
    status: string;
  }>;
  nextSession?: {
    sessionId: number;
    classId: number;
    kind: string;
    title: string;
    sessionNo: number;
    date: string;
    startTime: string;
    endTime: string;
    roomName?: string;
    teacherName?: string;
    meetingUrl?: string;
    status: string;
  };
  courses: Array<{
    id: number;
    classId: number;
    name: string;
    className: string;
    description?: string;
    bandFrom: number;
    bandTo: number;
    totalSessions: number;
    sessionsPerWeek: number;
    tuition: number;
    discountPercent: number;
    imageUrl?: string;
    teacherName?: string;
    progressPercent: number;
    startDate: string;
    endDate: string;
  }>;
  dueAssignments: Array<{
    id: number;
    classId: number;
    className: string;
    title: string;
    skill: string;
    type: string;
    dueAt: string;
    allowLate: boolean;
  }>;
  recentResults: Array<{
    submissionId: number;
    assignmentId: number;
    title: string;
    skill: string;
    overallBand?: number;
    autoScore?: number;
    autoMaxScore?: number;
    publishedAt?: string;
  }>;
  notifications: {
    unreadCount: number;
    items: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      content: string;
      link?: string;
      isRead: boolean;
      createdAt: string;
    }>;
  };
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

