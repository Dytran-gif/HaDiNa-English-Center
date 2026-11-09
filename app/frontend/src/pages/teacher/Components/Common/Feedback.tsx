import type { ReactNode } from "react";
import Tag from "../../../../components/ui/Tag";
import { toneOf } from "./format";

export function Loading({ text = "Đang tải dữ liệu..." }: { text?: string }) {
  return <div className="t-state t-state--loading" role="status"><span className="t-spinner" aria-hidden />{text}</div>;
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="t-state t-state--error" role="alert">
      <span>{message}</span>
      {onRetry && <button type="button" className="teacher-action-link" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="t-state t-state--empty">{children}</div>;
}

/** Thông báo ngắn sau thao tác (thành công / lỗi) */
export function Notice({ message, tone = "ok", onClose }: { message: string; tone?: "ok" | "error" | "warn"; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div className={`t-notice t-notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span>{message}</span>
      {onClose && <button type="button" className="t-notice__close" onClick={onClose} aria-label="Đóng">✕</button>}
    </div>
  );
}

export function StatusTag({ status, labels }: { status?: string | null; labels: Record<string, string> }) {
  if (!status) return <Tag>—</Tag>;
  return <Tag tone={toneOf(status)}>{labels[status] ?? status}</Tag>;
}

/** Bọc phần nội dung: loading -> lỗi -> nội dung */
export function QueryState({ loading, error, onRetry, children }: {
  loading: boolean; error: string; onRetry?: () => void; children: ReactNode;
}) {
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;
  return <>{children}</>;
}
