import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { CourseRegistration } from "../../../types/courseRegistration";
import type { PagedResponse } from "../../../types/adminApi";
import Button from "../Components/Ui/Button";
import Modal from "../Components/Ui/Modal";
import Notice from "../Components/Ui/Notice";
import EmptyState from "../Components/Ui/EmptyState";
import Card from "../../../components/ui/Card";
import { SelectField } from "../Components/Ui/FormField";
import { Pager } from "../Components/Api/AdminUi";
import useToast from "../Components/Ui/useToast";
import "../Components/Api/AdminApi.css";

type AvailableClass = { id: number; courseId: number; name: string; teacherName: string; enrolled: number; capacity: number };
const labels = { Pending: "Chờ xếp lớp", Assigned: "Đã xếp lớp", Cancelled: "Đã hủy" };
export default function CourseRegistrations() {
  const [params, setParams] = useSearchParams();
  const status = ["Pending", "Assigned", "Cancelled"].includes(params.get("status") ?? "") ? params.get("status")! : "Pending";
  const raw = Number(params.get("page")); const page = Number.isSafeInteger(raw) && raw > 0 ? raw : 1;
  const list = useAdminQuery<PagedResponse<CourseRegistration>>(`course-registrations?status=${status}&page=${page}&pageSize=10`);
  const classes = useAdminQuery<AvailableClass[]>("classes/available");
  useEffect(() => {
    if (list.loading || list.error || !list.data) return;
    const last = Math.max(1, Math.ceil(list.data.totalItems / 10));
    if (page > last) setParams({ status, page: String(last) }, { replace: true });
  }, [list.loading, list.error, list.data, page, status, setParams]);
  const api = useAdminApi(); const { notify } = useToast();
  const [selected, setSelected] = useState<CourseRegistration | null>(null);
  const [classId, setClassId] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const matching = (classes.data ?? []).filter(c => c.courseId === selected?.courseId);
  function filter(value: string) { setParams({ status: value }); }
  async function assign(event: FormEvent) {
    event.preventDefault(); if (!selected || busy || !matching.some(c => c.id === Number(classId))) return;
    setBusy(true); setError("");
    try { await api.send("POST", `course-registrations/${selected.id}/assign`, { classId: Number(classId) }); setSelected(null); list.reload(); classes.reload(); notify({ title: "Đã xếp lớp cho học viên" }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Chưa xếp được lớp."); classes.reload(); }
    finally { setBusy(false); }
  }
  return <div className="admin-api-stack">
    <p>Học viên đăng ký khóa học; Admin chọn lớp thuộc đúng khóa. Giáo viên và lịch học theo từng lớp.</p>
    <div className="admin-api-filters"><SelectField label="Trạng thái" value={status} options={Object.entries(labels).map(([value, label]) => ({ value, label }))} onChange={e => filter(e.target.value)} /><Button icon="refresh" onClick={() => { list.reload(); classes.reload(); }}>Tải lại</Button></div>
    {list.error && <Notice tone="error" action={<Button onClick={list.reload}>Thử lại</Button>}>{list.error}</Notice>}
    {list.loading ? <p role="status">Đang tải đăng ký khóa học…</p> : !list.error && <Card><div className="admin-api-table"><table className="admin-table"><thead><tr><th>Học viên</th><th>Khóa đăng ký</th><th>Ngày gửi</th><th>Trạng thái / lớp</th><th>Thao tác</th></tr></thead><tbody>{list.data?.items.map(row => <tr key={row.id}>
      <td><Link to={`/admin/students/${row.studentId}`}>{row.studentName}</Link><span className="admin-management-subtitle">{row.studentCode}</span></td><td>{row.courseName}</td><td>{new Date(row.createdAt).toLocaleDateString("vi-VN")}</td><td>{labels[row.status]}{row.classId && <Link className="admin-management-subtitle" to={`/admin/classes/${row.classId}`}>{row.className}</Link>}</td><td>{row.status === "Pending" && <Button variant="primary" onClick={() => { setSelected(row); setClassId(""); setError(""); }}>Xếp lớp</Button>}</td>
    </tr>)}</tbody></table></div>{!list.data?.items.length && <EmptyState title="Chưa có yêu cầu trong trạng thái này" />}</Card>}
    {(list.data?.totalItems ?? 0) > 10 && <Pager page={page} total={list.data!.totalItems} onChange={value => setParams({ status, page: String(value) })} />}
    <Modal open={!!selected} title="Xếp lớp cho học viên" busy={busy} onClose={() => { if (!busy) setSelected(null); }}><form className="admin-api-stack" onSubmit={assign}>
      <p><strong>{selected?.studentName}</strong> — {selected?.courseName}</p>
      {(error || classes.error) && <Notice tone="error">{error || classes.error}</Notice>}
      <SelectField label="Lớp thuộc khóa đã đăng ký" required disabled={busy || classes.loading || !!classes.error} value={classId} onChange={e => setClassId(e.target.value)} options={[{ value: "", label: "Chọn lớp" }, ...matching.map(c => ({ value: String(c.id), label: `${c.name} — ${c.teacherName} (${c.enrolled}/${c.capacity})` }))]} />
      {!classes.loading && !matching.length && <Notice tone="info">Chưa có lớp còn chỗ trong khóa này. <Link to="/admin/classes?action=create">Tạo lớp mới</Link> rồi quay lại xếp lớp.</Notice>}
      <div className="admin-row-actions"><Button disabled={busy} onClick={() => setSelected(null)}>Hủy</Button><Button type="submit" variant="primary" loading={busy} disabled={!matching.some(c => c.id === Number(classId)) || !!classes.error || classes.loading}>Xác nhận xếp lớp</Button></div>
    </form></Modal>
  </div>;
}
