import { useEffect, useSyncExternalStore } from "react";
import { request } from "./apiClient";
import type { PublicCourse } from "./usePublicCourse";

type Catalog = { courses: PublicCourse[]; loading: boolean; error: string };
let snapshot: Catalog = { courses: [], loading: true, error: "" };
let pending: Promise<void> | null = null;
let refreshAgain = false;
const listeners = new Set<() => void>();
const publish = (value: Catalog) => { snapshot = value; listeners.forEach(listener => listener()); };
function reload() {
  if (pending) return pending;
  publish({ ...snapshot, loading: true, error: "" });
  pending = request<PublicCourse[]>("/api/public/courses", null, { cache: "no-store" })
    .then(courses => { publish({ courses, loading: false, error: "" }); })
    .catch(reason => publish({ courses: [], loading: false, error: reason instanceof Error ? reason.message : "Không tải được khóa học." }))
    .finally(() => { pending = null; if (refreshAgain) { refreshAgain = false; void reload(); } });
  return pending;
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
const refresh = () => { if (pending) refreshAgain = true; else void reload(); };
const storage = (event: StorageEvent) => { if (event.key === "ecw_courses_revision") refresh(); };
let mounts = 0;
export function notifyCoursesChanged() {
  window.dispatchEvent(new Event("courses-changed"));
  try { localStorage.setItem("ecw_courses_revision", `${Date.now()}-${Math.random()}`); } catch { /* Same-tab event still refreshes. */ }
}
export default function usePublicCourses() {
  const state = useSyncExternalStore(subscribe, () => snapshot);
  useEffect(() => {
    if (mounts++ === 0) {
      window.addEventListener("focus", refresh);
      window.addEventListener("courses-changed", refresh);
      window.addEventListener("storage", storage);
      void reload();
    }
    return () => {
      if (--mounts === 0) {
        window.removeEventListener("focus", refresh);
        window.removeEventListener("courses-changed", refresh);
        window.removeEventListener("storage", storage);
      }
    };
  }, []);
  return { ...state, reload };
}

export const formatCoursePrice = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", currencyDisplay: "code", maximumFractionDigits: 0 }).format(value);
export const courseBand = (course: PublicCourse) => `Band ${course.band_from} → ${course.band_to}`;
