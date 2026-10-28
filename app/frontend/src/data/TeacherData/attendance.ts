import type { AttendanceRecord } from "../../types";

// Mock điểm danh khởi tạo — chưa có backend thật.
export const teacherAttendanceSeed: AttendanceRecord[] = [
    { attendance_id: 1, course_id: 1, user_id: 1, session_date: "2026-08-10", status: "present" },
    { attendance_id: 2, course_id: 1, user_id: 4, session_date: "2026-08-10", status: "late" },
    { attendance_id: 3, course_id: 1, user_id: 1, session_date: "2026-08-12", status: "present" },
    { attendance_id: 4, course_id: 1, user_id: 4, session_date: "2026-08-12", status: "absent" },
];
