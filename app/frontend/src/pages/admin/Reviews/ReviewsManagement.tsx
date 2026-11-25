import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../Components/Ui/Button";
import Badge from "../Components/Ui/Badge";
import ConfirmDialog from "../Components/Ui/ConfirmDialog";
import EmptyState from "../Components/Ui/EmptyState";
import Notice from "../Components/Ui/Notice";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import { SelectField } from "../Components/Ui/FormField";
import useToast from "../Components/Ui/useToast";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { PagedResponse } from "../../../types/adminApi";
import { Pager } from "../Components/Api/AdminUi";
import SearchField from "../Components/Api/SearchField";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";

// Duyệt đánh giá GV: học viên gửi -> chờ duyệt -> admin bật hiển thị thì mới lên trang public (tên rút gọn + lớp).
interface ReviewItem {
  id: number; rating: number; comment: string; isPublished: boolean; createdAt: string;
  studentId: number; studentCode: string; studentName: string; classId: number; classCode: string; courseName: string;
  teacherId: number; teacherName: string;
}

export default function ReviewsManagement() {
  const [params, setParams] = useSearchParams();
  const api = useAdminApi(); const { notify } = useToast();
  const rawPage = Number(params.get("page")); const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const status = params.get("status") ?? "pending"; const search = params.get("search") ?? "";
  const list = useAdminQuery<PagedResponse<ReviewItem>>(`reviews?${new URLSearchParams({ page: String(page), pageSize: "10", status, search })}`);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deletion, setDeletion] = useState<ReviewItem | null>(null);
  function set(key: string, value: string) { setParams(prev => { const n = new URLSearchParams(prev); if (value) n.set(key, value); else n.delete(key); if (key !== "page") n.set("page", "1"); return n; }); }
  async function toggle(r: ReviewItem) {
    setBusyId(r.id);
    try { const res = await api.send<{ message: string }>("POST", `reviews/${r.id}/${r.isPublished ? "hide" : "publish"}`, {}); notify({ title: res.message }); list.reload(); }
    catch (e) { notify({ title: "Không cập nhật được", description: e instanceof Error ? e.message : "", tone: "error" }); }
    finally { setBusyId(null); }
  }
  const total = list.data?.totalItems ?? 0;
  return (
    <div className="admin-api-stack">
      <div className="admin-api-filters">
        <SelectField label="Trạng thái" value={status} onChange={e => set("status", e.target.value)}
          options={[{ value: "pending", label: "Chờ duyệt" }, { value: "published", label: "Đang hiển thị" }, { value: "all", label: "Tất cả" }]} />
        <SearchField label="Tìm" placeholder="Học viên, giáo viên, mã lớp, nội dung…" value={search} onSearch={v => set("search", v)} />
        <Button icon="refresh" loading={list.loading} onClick={list.reload}>Tải lại</Button>
      </div>
      {list.error ? <Notice tone="error" action={<Button onClick={list.reload}>Thử lại</Button>}>{list.error}</Notice> : (
        <Card>
          <div className="admin-api-table" role="region" aria-label="Danh sách đánh giá" tabIndex={0}>
            <table className="admin-table" aria-busy={list.loading}>
              <thead><tr><th>Học viên / Lớp</th><th>Giáo viên</th><th>Đánh giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>{list.loading ? <TableSkeleton columns={5} /> : (list.data?.items ?? []).map(r => (
                <tr key={r.id}>
                  <td><Link className="admin-management-name" to={`/admin/students/${r.studentId}`}>{r.studentName}</Link>
                    <span className="admin-management-subtitle"><span className="admin-code">{r.classCode}</span> {r.courseName}</span></td>
                  <td><Link className="admin-management-name" to={`/admin/teachers/${r.teacherId}`}>{r.teacherName}</Link></td>
                  <td><span aria-label={`${r.rating} trên 5 sao`} style={{ color: "#d99a00", letterSpacing: 1 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className="admin-management-subtitle" style={{ whiteSpace: "normal", maxWidth: 420 }}>{r.comment}</span>
                    <span className="admin-management-subtitle">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span></td>
                  <td><Badge tone={r.isPublished ? "success" : "warning"}>{r.isPublished ? "Đang hiển thị" : "Chờ duyệt"}</Badge></td>
                  <td><div className="admin-row-actions">
                    <Button variant={r.isPublished ? "secondary" : "primary"} icon={r.isPublished ? "eye-off" : "check"} loading={busyId === r.id} onClick={() => toggle(r)}>{r.isPublished ? "Ẩn" : "Hiển thị"}</Button>
                    <Button variant="ghost" icon="trash" onClick={() => setDeletion(r)}>Xóa</Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!list.loading && total === 0 && <EmptyState title={status === "pending" ? "Không có đánh giá chờ duyệt" : "Chưa có đánh giá"} description="Học viên gửi đánh giá giáo viên ở mục Phản hồi của trang học viên." />}
        </Card>
      )}
      {total > 10 && <Pager page={page} total={total} loading={list.loading} onChange={v => set("page", String(v))} />}
      <ConfirmDialog open={Boolean(deletion)} title="Xóa đánh giá" confirmLabel="Xóa" onClose={() => setDeletion(null)}
        onConfirm={async () => { if (!deletion) return; await api.send("DELETE", `reviews/${deletion.id}`); list.reload(); notify({ title: "Đã xóa đánh giá" }); }}>
        <p>Xóa đánh giá của <strong>{deletion?.studentName}</strong> cho {deletion?.teacherName}? Học viên có thể gửi lại.</p>
      </ConfirmDialog>
    </div>
  );
}
