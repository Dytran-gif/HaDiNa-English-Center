import type { User, Enrollment } from "../types";

// Demo-only accounts — the project has no real backend/auth yet (see docs/6).
export const demoUser: User = {
  user_id: 1,
  full_name: "Lê Văn Duy",
  email: "duy@example.com",
  phone: "0901234567",
  role: "student",
  created_at: "2026-07-01T08:00:00",
};

export const enrollments: Enrollment[] = [
  {
    enrollment_id: 1,
    user_id: 1,
    course_id: 1,
    enroll_date: "2026-07-10",
    status: "confirmed",
  },
  {
    enrollment_id: 2,
    user_id: 1,
    course_id: 5,
    enroll_date: "2026-07-20",
    status: "pending",
  },
];

export function getEnrollmentsByUser(userId: number): Enrollment[] {
  return enrollments.filter((e) => e.user_id === userId);
}
// Tài khoản demo (giả lập — chưa có backend). Mật khẩu chỉ để test.
export const demoAccounts: { email: string; password: string; user: User }[] = [
  { email: "student@demo.com", password: "123456", user: demoUser },
  {
    email: "teacher@demo.com", password: "123456",
    user: { user_id: 2, full_name: "Nguyễn Thị Lan", email: "teacher@demo.com",
            phone: "0902000002", role: "teacher", created_at: "2026-07-01T08:00:00" },
  },
  {
    email: "admin@demo.com", password: "123456",
    user: { user_id: 3, full_name: "Trần Quản Trị", email: "admin@demo.com",
            phone: "0902000003", role: "admin", created_at: "2026-07-01T08:00:00" },
  },
];

// Tìm tài khoản khớp email + mật khẩu; không khớp trả về null.
export function findAccount(email: string, password: string): User | null {
  const acc = demoAccounts.find((a) => a.email === email && a.password === password);
  return acc ? acc.user : null;
}
