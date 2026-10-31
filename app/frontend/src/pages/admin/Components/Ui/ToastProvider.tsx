import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IconButton } from "./Button";
import Notice from "./Notice";
import { ToastContext, type ToastEntry, type ToastInput } from "./ToastContext";
function ToastItem({ toast, dismiss }: { toast: ToastEntry; dismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false); const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (hovered || focused || toast.duration === 0) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration ?? (toast.tone === "error" ? 8000 : 5000));
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, toast.tone, hovered, focused, dismiss]);
  return <div className="admin-toast" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}><Notice tone={toast.tone ?? "success"} title={toast.title}>{toast.description}</Notice><IconButton icon="close" label="Đóng thông báo" variant="ghost" className="admin-toast-close" onClick={() => dismiss(toast.id)}/></div>;
}
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]); const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setToasts(items => items.filter(item => item.id !== id)), []);
  const notify = useCallback((toast: ToastInput) => {
    const id = ++nextId.current;
    const key = toast.key ?? `${toast.tone ?? "success"}:${toast.title}`;
    setToasts(items => [...items.filter(item => item.key !== key), { ...toast, key, id }].slice(-3));
    return id;
  }, []);
  const api = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  return <ToastContext.Provider value={api}>{children}<div className="admin-toast-stack" aria-label="Thông báo thao tác">{toasts.map(toast => <ToastItem key={toast.id} toast={toast} dismiss={dismiss}/>)}</div></ToastContext.Provider>;
}
