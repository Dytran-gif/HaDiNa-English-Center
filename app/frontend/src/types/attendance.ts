export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  attendance_id: number;
  course_id: number;
  user_id: number;
  session_date: string;
  status: AttendanceStatus;
}
