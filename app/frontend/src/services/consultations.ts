import { request } from "./apiClient";

export function sendConsultation(input: { submissionId: string; fullName: string; phone: string; email: string; courseSlug: string; courseName: string }) {
  return request<{ message: string }>("/api/public/consultations", null, { method: "POST", body: JSON.stringify(input) });
}
