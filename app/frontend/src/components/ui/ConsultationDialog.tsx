import { useEffect, useId, useRef, useState } from "react";
import type { PublicCourse } from "../../services/usePublicCourse";
import ConsultationForm from "./ConsultationForm";
import "./Modal.css";

export default function ConsultationDialog({ course, onClose }: { course: PublicCourse; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const titleId = useId(); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const element = dialog.current; const previous = document.body.style.overflow;
    if (element && !element.open) element.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} className="modal-panel consultation-dialog" aria-labelledby={titleId} aria-busy={busy || undefined} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
    <div className="modal-header"><h2 id={titleId}>Đăng ký khóa học</h2><button type="button" className="modal-close" disabled={busy} onClick={onClose} aria-label="Đóng">×</button></div>
    <div className="modal-body"><ConsultationForm course={course} idPrefix="course-registration" onBusyChange={setBusy} /></div>
  </dialog>;
}
