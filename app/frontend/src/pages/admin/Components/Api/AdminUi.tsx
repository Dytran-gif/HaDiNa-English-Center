import Notice from "../Ui/Notice";
import Pagination from "../Ui/Pagination";
export function Feedback({ error, message }: { error?: string; message?: string }) {
  if (error) return <Notice tone="error">{error}</Notice>;
  return message ? <Notice tone="success">{message}</Notice> : null;
}
export function Pager(props: { page: number; total: number; pageSize?: number; loading?: boolean; onChange: (page: number) => void }) {
  return <Pagination {...props}/>;
}
