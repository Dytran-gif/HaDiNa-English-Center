import Button from "./Button";
export default function Pagination({ page, total, pageSize = 10, loading = false, onChange }: { page: number; total: number; pageSize?: number; loading?: boolean; onChange: (page: number) => void }) {
  const count = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 10;
  const current = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const last = Math.max(1, Math.ceil(count / size));
  return <nav className="admin-pagination" aria-label="Phân trang"><span aria-live="polite">Trang {current}/{last} · {count.toLocaleString("vi-VN")} bản ghi</span><div className="admin-pagination-actions"><Button icon="chevron-left" disabled={loading || current <= 1} aria-label="Trang trước" onClick={() => onChange(current - 1)}>Trước</Button><Button icon="chevron-right" disabled={loading || current >= last} aria-label="Trang sau" onClick={() => onChange(current + 1)}>Sau</Button></div></nav>;
}
