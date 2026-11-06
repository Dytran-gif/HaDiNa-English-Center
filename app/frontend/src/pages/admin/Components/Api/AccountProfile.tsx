import { useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import type { AdminRecord, EnrollmentResponse, PaymentResponse, StudentResponse } from "../../../../types/adminApi";
import { useAdminApi, useAdminQuery } from "../../../../services/admin/useAdminApi";
import { teachersConfig, studentsConfig } from "./resourceConfigs";
import { display, money } from "./adminFormat";
import Button from "../Ui/Button";
import Badge from "../Ui/Badge";
import Notice from "../Ui/Notice";
import EmptyState from "../Ui/EmptyState";
import SectionCard from "../Ui/SectionCard";
import TableSkeleton from "../Ui/TableSkeleton";
import ConfirmDialog from "../Ui/ConfirmDialog";
import { SelectField } from "../Ui/FormField";
import useToast from "../Ui/useToast";
import "./AdminApi.css";

function PaymentHistory({ id }: { id: number }) {
  const { data, loading, error, reload } = useAdminQuery<{ items: PaymentResponse[]; totalPaid: number }>(`students/${id}/payments`);
  if (error) return <Notice tone="error" action={<Button onClick={reload}>Thử lại</Button>}>{error}</Notice>;
  return <><p>Tổng đã đóng: <strong>{loading ? "Đang tải…" : data ? money(data.totalPaid) : "--"}</strong></p>
    {!loading && !data?.items.length ? <EmptyState title="Chưa có phiếu thu" description="Các khoản học phí đã thu của học viên sẽ xuất hiện tại đây."/> :
      <div className="admin-api-table"><table className="admin-table"><thead><tr><th>Lớp / Khóa</th><th>Đã thu</th><th>Ngày thu</th><th>Hình thức</th></tr></thead><tbody>{loading ? <TableSkeleton columns={4}/> : data?.items.map(item => <tr key={item.id}><td>{item.className}<span className="admin-management-subtitle">{item.courseName}</span></td><td>{money(item.amount)}</td><td>{display(item.paidDate)}</td><td>{display(item.method)}</td></tr>)}</tbody></table></div>}
  </>;
}
function Enrollments({ student, onChanged }: { student: StudentResponse; onChanged: () => void }) {
  const classes = useAdminQuery<AdminRecord[]>("classes/available");
  const api = useAdminApi(); const { notify } = useToast();
  const [classId, setClassId] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [withdrawal, setWithdrawal] = useState<EnrollmentResponse | null>(null);
  const eligible = (classes.data ?? []).filter(item => !student.enrollments.some(e => e.classId === item.id));
  async function enroll() {
    if (!classId || busy) return;
    setBusy(true); setError("");
    try { await api.send("POST", `students/${student.id}/enrollments`, { classId: Number(classId) }); setClassId(""); classes.reload(); onChanged(); notify({ title: "Đã ghi danh học viên" }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không ghi danh được."); }
    finally { setBusy(false); }
  }
  return <div className="admin-api-stack">
    {error && <Notice tone="error">{error}</Notice>}
    {classes.error && <Notice tone="error" action={<Button onClick={classes.reload}>Thử lại danh sách lớp</Button>}>{classes.error}</Notice>}
    <div className="admin-api-filters"><SelectField label="Ghi danh vào lớp còn chỗ" value={classId} disabled={busy || classes.loading || Boolean(classes.error) || student.status === "Dropped"} onChange={event => setClassId(event.target.value)} options={[{ value: "", label: classes.loading ? "Đang tải lớp…" : "Chọn lớp" }, ...eligible.map(item => ({ value: String(item.id), label: `${item.name} · ${item.enrolled}/${item.capacity} · ${money(item.finalTuition)}` }))]}/><Button variant="primary" loading={busy} disabled={!classId || classes.loading || Boolean(classes.error) || student.status === "Dropped"} onClick={enroll}>Ghi danh</Button></div>
    {student.status === "Dropped" && <Notice tone="info">Học viên đã nghỉ. Cập nhật trạng thái hồ sơ trước khi ghi danh mới.</Notice>}
    {!classes.loading && !classes.error && !eligible.length && <p className="admin-api-muted">Hiện không có lớp còn chỗ mà học viên chưa ghi danh.</p>}
    {!student.enrollments.length ? <EmptyState title="Chưa ghi danh lớp nào" description="Chọn một lớp còn chỗ ở trên để bắt đầu."/> : <div className="admin-api-table"><table className="admin-table"><thead><tr><th>Lớp / Khóa</th><th>Trạng thái</th><th>Học phí ghi danh</th><th>Thao tác</th></tr></thead><tbody>{student.enrollments.map(item => <tr key={item.id}><td><Link className="admin-management-name" to={`/admin/classes/${item.classId}`}>{item.className}</Link><span className="admin-management-subtitle">{item.courseName}</span></td><td><Badge status={item.status}/></td><td>{money(item.finalTuitionFee)}</td><td>{item.status === "Active" && <Button variant="ghost" onClick={() => setWithdrawal(item)}>Rút khỏi lớp</Button>}</td></tr>)}</tbody></table></div>}
    <ConfirmDialog open={Boolean(withdrawal)} title="Rút học viên khỏi lớp" confirmLabel="Rút khỏi lớp" onClose={() => setWithdrawal(null)} onConfirm={async () => {
      if (!withdrawal) return;
      await api.send("DELETE", `students/${student.id}/enrollments/${withdrawal.id}`); onChanged(); classes.reload(); notify({ title: "Đã rút học viên khỏi lớp" });
    }}>Rút <strong>{student.fullName}</strong> khỏi lớp <strong>{withdrawal?.className}</strong>? Phiếu thu đã có sẽ được giữ lại.</ConfirmDialog>
  </div>;
}
export default function AccountProfile({ kind }: { kind: "teachers" | "students" }) {
  const { id = "" } = useParams(); const [params] = useSearchParams(); const location = useLocation();
  const config = kind === "students" ? studentsConfig : teachersConfig;
  const query = useAdminQuery<AdminRecord>(`${kind}/${id}`);
  const tabs = [{ key: "profile", label: "Thông tin" }, { key: "classes", label: kind === "students" ? "Ghi danh & lớp học" : "Lớp phụ trách" }, ...(kind === "students" ? [{ key: "payments", label: "Lịch sử học phí" }] : [])];
  const tab = tabs.some(item => item.key === params.get("tab")) ? params.get("tab") : "profile";
  const returnTo = typeof location.state?.returnTo === "string" && location.state.returnTo.startsWith(`/admin/${kind}`) ? location.state.returnTo : `/admin/${kind}`;
  const classes = Array.isArray(query.data?.classes) ? query.data.classes as AdminRecord[] : [];
  return <div className="admin-api-stack">
    <div className="admin-management-toolbar"><Button to={returnTo} variant="ghost">← Danh sách {config.singular}</Button>{query.data && <Button to={`/admin/${kind}?edit=${id}`} icon="edit">Sửa hồ sơ</Button>}</div>
    <SectionCard title={query.loading ? "Đang tải hồ sơ…" : String(query.data?.fullName ?? `Hồ sơ ${config.singular}`)} action={query.data && <Badge status={String(query.data.status)}/>}>
      <nav className="admin-management-tabs" aria-label={`Các phần hồ sơ ${config.singular}`}>{tabs.map(item => <Link key={item.key} to={`?tab=${item.key}`} state={location.state} aria-current={tab === item.key ? "page" : undefined}>{item.label}</Link>)}</nav>
      {query.error ? <Notice tone="error" action={<Button onClick={query.reload}>Thử lại</Button>}>{query.error}</Notice> : query.loading ? <p role="status">Đang tải thông tin…</p> : query.data && <>
        {tab === "profile" && <dl className="admin-management-fields">{config.fields.filter(field => field.type !== "password").map(field => <div key={field.key}><dt>{field.label}</dt><dd>{display(query.data![field.key])}</dd></div>)}</dl>}
        {tab === "classes" && (kind === "students" ? <Enrollments student={query.data as StudentResponse} onChanged={query.reload}/> : classes.length ? <div className="admin-api-table"><table className="admin-table"><thead><tr><th>Lớp</th><th>Khóa học</th><th>Trạng thái</th></tr></thead><tbody>{classes.map(item => <tr key={item.id}><td><Link className="admin-management-name" to={`/admin/classes/${item.id}`}>{display(item.name ?? item.className)}</Link></td><td>{display(item.courseName)}</td><td><Badge status={String(item.status ?? item.classStatus ?? "")}/></td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có lớp phụ trách" description="Các lớp được phân công sẽ xuất hiện tại đây." icon="classes"/>)}
        {tab === "payments" && <PaymentHistory id={Number(id)}/>}
      </>}
    </SectionCard>
  </div>;
}
