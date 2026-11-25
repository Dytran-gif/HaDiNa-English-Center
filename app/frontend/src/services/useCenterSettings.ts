import { useSyncExternalStore } from "react";
import { request } from "./apiClient";
import type { CenterResponse } from "../types/adminApi";

type State = { center: CenterResponse | null; loading: boolean; error: string };
const initial: State = { center: null, loading: true, error: "" };
let state = initial;
let pending: Promise<void> | undefined;
let revision = 0;
const listeners = new Set<() => void>();
const getSnapshot = () => state;
const notify = () => listeners.forEach(listener => listener());

export function reloadCenterSettings() {
  if (pending) return pending;
  const version = ++revision;
  state = { ...state, loading: true, error: "" }; notify();
  pending = request<CenterResponse>("/api/public/center", null, { cache: "no-store" })
    .then(center => { if (revision === version) { state = { center, loading: false, error: "" }; notify(); } })
    .catch(reason => { if (revision === version) { state = { ...state, loading: false, error: reason instanceof Error ? reason.message : "Không tải được thông tin trung tâm." }; notify(); } })
    .finally(() => { pending = undefined; });
  return pending;
}

export function publishCenterSettings(center: CenterResponse) {
  revision++;
  state = { center, loading: false, error: "" }; notify();
  try { localStorage.setItem("ecw_center_revision", `${Date.now()}-${Math.random()}`); } catch { /* Same-tab updates still work. */ }
}
const refresh = () => { void reloadCenterSettings(); };
const onStorage = (event: StorageEvent) => { if (event.key === "ecw_center_revision") refresh(); };
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    refresh();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { window.removeEventListener("focus", refresh); window.removeEventListener("storage", onStorage); }
  };
}
export default function useCenterSettings() {
  return { ...useSyncExternalStore(subscribe, getSnapshot, () => initial), reload: reloadCenterSettings };
}
