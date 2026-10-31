import { useEffect, useRef, useState, type ReactNode } from "react";
import Button from "./Button";
import Dialog from "./Dialog";
import Notice from "./Notice";
export default function ConfirmDialog({ open, title = "Xác nhận thao tác", children, confirmLabel = "Xác nhận", danger = true, onConfirm, onClose, onFailure }: { open: boolean; title?: string; children: ReactNode; confirmLabel?: string; danger?: boolean; onConfirm: () => void | Promise<void>; onClose: () => void; onFailure?: (reason: unknown) => void }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState(""); const locked = useRef(false);
  useEffect(() => { if (open) setError(""); }, [open]);
  async function confirm() {
    if (locked.current) return;
    locked.current = true; setPending(true); setError("");
    try { await onConfirm(); onClose(); }
    catch (reason) {
      if (onFailure) onFailure(reason);
      else setError(reason instanceof Error ? reason.message : "Không thực hiện được thao tác. Vui lòng thử lại.");
    }
    finally { locked.current = false; setPending(false); }
  }
  return <Dialog open={open} title={title} busy={pending} onClose={onClose} footer={<><Button autoFocus disabled={pending} onClick={onClose}>Hủy</Button><Button variant={danger ? "danger" : "primary"} loading={pending} onClick={confirm}>{confirmLabel}</Button></>}><div>{children}</div>{error && <Notice tone="error">{error}</Notice>}</Dialog>;
}
