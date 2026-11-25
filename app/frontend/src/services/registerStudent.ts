import { request } from "./apiClient";

export interface RegisterStudentInput {
  fullName: string; email: string; phone: string; password: string; confirmPassword: string;
  dateOfBirth?: string | null; parentName?: string | null; parentPhone?: string | null;
}

// POST /api/auth/register — tạo Users + Students; trả kèm token để đăng nhập luôn (docs/api/STUDENT-REGISTRATION.md)
export function registerStudent(input: RegisterStudentInput) {
  return request<{ message: string; code: string; login?: { token: string; userId: number; email: string; role: string } }>(
    "/api/auth/register", null, { method: "POST", body: JSON.stringify(input) });
}
