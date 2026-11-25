import { request } from "./apiClient";

export function registerStudent(input: { fullName: string; email: string; phone: string; password: string; confirmPassword: string }) {
  return request<{ message: string; code: string }>("/api/auth/register", null, { method: "POST", body: JSON.stringify(input) });
}
