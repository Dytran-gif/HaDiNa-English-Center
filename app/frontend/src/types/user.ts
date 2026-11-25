export type UserRole = "student" | "teacher" | "admin";

export interface User {
  user_id: number;
  full_name: string;
  avatar_url?: string | null;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Enrollment {
  enrollment_id: number;
  user_id: number;
  course_id: number;
  enroll_date: string;
  status: "pending" | "confirmed" | "cancelled";
}
