import { useEffect, useState } from "react";
import { request, assetUrl } from "./apiClient";
import type { Teacher } from "../types";
export function notifyTeachersChanged() {
  window.dispatchEvent(new Event("teachers-changed"));
  try { localStorage.setItem("ecw_teachers_revision", `${Date.now()}-${Math.random()}`); } catch { /* Refresh still works in this tab. */ }
}

export default function usePublicTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    const storage = (event: StorageEvent) => { if (event.key === "ecw_teachers_revision") refresh(); };
    window.addEventListener("focus", refresh); window.addEventListener("teachers-changed", refresh); window.addEventListener("storage", storage);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("teachers-changed", refresh); window.removeEventListener("storage", storage); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    request<Teacher[]>("/api/public/teachers", null, { signal: controller.signal, cache: "no-store" })
      .then(data => { if (!controller.signal.aborted) setTeachers(data.map(t => ({ ...t, avatar: assetUrl(t.avatar) }))); })
      .catch(reason => { if (!controller.signal.aborted) { setTeachers([]); setError(reason instanceof Error ? reason.message : "Không tải được giáo viên."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return { teachers, loading, error, reload: () => setRevision(value => value + 1) };
}
