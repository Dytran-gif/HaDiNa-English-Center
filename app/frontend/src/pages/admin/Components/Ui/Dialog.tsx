import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./Button";
export default function Dialog({ open, title, children, footer, onClose, busy = false, className = "" }: { open: boolean; title: string; children: ReactNode; footer?: ReactNode; onClose: () => void; busy?: boolean; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null); const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
    return () => {
      if (element.open) element.close();
      if (open) document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return <dialog ref={dialog} className={`admin-dialog ${className}`} aria-labelledby={titleId} aria-modal="true" aria-busy={busy || undefined} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="admin-dialog-inner"><div className="admin-dialog-header"><h2 id={titleId}>{title}</h2><IconButton icon="close" label="Đóng hộp thoại" variant="ghost" disabled={busy} onClick={onClose}/></div><div className="admin-dialog-body">{children}</div>{footer && <div className="admin-dialog-footer">{footer}</div>}</div>
  </dialog>;
}
