import { request } from "./apiClient";

export async function sendConsultation(input: { submissionId: string; fullName: string; phone: string; email: string; courseSlug: string; courseName: string }) {
  const result = await request<{ message: string }>("/api/public/consultations", null, { method: "POST", body: JSON.stringify(input) });
  window.dispatchEvent(new Event("consultations-changed"));
  try { localStorage.setItem("ecw_consultations_revision", `${Date.now()}-${Math.random()}`); } catch { /* Same-tab refresh still works. */ }
  return result;
}
