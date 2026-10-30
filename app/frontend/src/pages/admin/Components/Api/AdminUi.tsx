import Button from "../../../../components/ui/Button";
export function Feedback({ error, message }: { error?: string; message?: string }) {
  return <>{error && <p className="admin-api-error" role="alert">{error}</p>}{message && <p className="admin-api-notice" role="status">{message}</p>}</>;
}
export function Pager({ page, total, pageSize = 10, onChange }: { page: number; total: number; pageSize?: number; onChange: (page: number) => void }) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  return <nav className="admin-api-toolbar" aria-label="Phân trang"><span>{total} bản ghi · Trang {page}/{last}</span><div className="admin-row-actions"><Button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Trước</Button><Button type="button" disabled={page >= last} onClick={() => onChange(page + 1)}>Sau</Button></div></nav>;
}
