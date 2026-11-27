import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import ConfirmDialog from "../Components/Ui/ConfirmDialog";
import useToast from "../Components/Ui/useToast";
import Button from "../Components/Ui/Button";
import Notice from "../Components/Ui/Notice";
import EmptyState from "../Components/Ui/EmptyState";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import Pagination from "../Components/Ui/Pagination";
import SearchField from "../Components/Api/SearchField";

interface Consultation { id: number; fullName: string; phone: string; email: string; courseName: string; createdAt: string }
interface Page { items: Consultation[]; total: number; page: number; pageSize: number }
const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function Consultations() {
  const api = useAdminApi();
  const { notify } = useToast();
  const [deletion, setDeletion] = useState<Consultation | null>(null);
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const number = Number(params.get("page") ?? 1);
  const page = Number.isSafeInteger(number) && number > 0 ? number : 1;
  const list = useAdminQuery<Page>(`consultations?${new URLSearchParams({ search, page: String(page), pageSize: "10" })}`);
  function update(key: string, value: string) {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); if (key === "search") next.delete("page"); return next; });
  }
  return <div className="admin-api-stack">
    <div className="admin-api-toolbar"><p role="status">{list.loading ? "Đang tải yêu cầu…" : list.error ? "Chưa tải được dữ liệu" : `${list.data?.total ?? 0} yêu cầu tư vấn`}</p><Button icon="refresh" loading={list.loading} onClick={list.reload}>Tải lại</Button></div>
    <SearchField label="Tìm yêu cầu tư vấn" placeholder="Họ tên, điện thoại, email hoặc khóa học…" value={search} onSearch={value => update("search", value)}/>
    {list.error ? <Notice tone="error" action={<Button onClick={list.reload}>Thử lại</Button>}>{list.error}</Notice> : <Card><div className="admin-api-table" role="region" aria-label="Danh sách yêu cầu tư vấn" tabIndex={0}><table className="admin-table" aria-busy={list.loading}>
      <thead><tr><th scope="col">Họ tên</th><th scope="col">Điện thoại</th><th scope="col">Email</th><th scope="col">Khóa học quan tâm</th><th scope="col">Thời gian gửi</th><th scope="col">Thao tác</th></tr></thead>
      <tbody>{list.loading ? <TableSkeleton columns={6}/> : list.data?.items.map(item => <tr key={item.id}><td>{item.fullName}</td><td>{item.phone}</td><td>{item.email}</td><td>{item.courseName}</td><td>{date.format(new Date(item.createdAt))}</td><td><Button icon="trash" variant="danger" aria-label={`Xóa yêu cầu của ${item.fullName}`} onClick={() => setDeletion(item)}>Xóa</Button></td></tr>)}</tbody>
    </table></div>{!list.loading && !list.data?.items.length && <EmptyState title={search ? "Không tìm thấy yêu cầu phù hợp" : "Chưa có yêu cầu tư vấn"} description={search ? "Thử từ khóa khác hoặc xóa tìm kiếm." : "Các đăng ký từ form tư vấn trên trang chủ sẽ xuất hiện tại đây."}/>}</Card>}
    {!list.error && <Pagination page={list.data?.page ?? page} total={list.data?.total ?? 0} loading={list.loading} itemLabel="yêu cầu" onChange={value => update("page", String(value))}/>}
    <ConfirmDialog open={Boolean(deletion)} title="Xóa yêu cầu tư vấn" confirmLabel="Xóa yêu cầu" onClose={() => setDeletion(null)} onConfirm={async () => {
      if (!deletion) return;
      await api.send("DELETE", `consultations/${deletion.id}`);
      list.reload();
      notify({ title: "Đã xóa yêu cầu tư vấn" });
    }}><p>Xóa yêu cầu tư vấn của <strong>{deletion?.fullName}</strong>?</p><p>Yêu cầu sẽ bị xóa vĩnh viễn. Thao tác này không xóa tài khoản, ghi danh hoặc phiếu thu.</p></ConfirmDialog>
  </div>;
}
