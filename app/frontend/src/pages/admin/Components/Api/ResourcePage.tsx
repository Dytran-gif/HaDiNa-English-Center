import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../Ui/Button";
import Card from "../../../../components/ui/Card";
import Modal from "../../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../Ui/FormField";
import { useAdminApi, useAdminQuery } from "../../../../services/admin/useAdminApi";
import type { AdminRecord, PagedResponse, PaymentResponse, StudentResponse } from "../../../../types/adminApi";
import { Feedback, Pager } from "./AdminUi";
import { display, money } from "./adminFormat";
import SearchField from "./SearchField";
import "../../admin-shared.css";
import "./AdminApi.css";

type Field = { key: string; label: string; type?: string; required?: boolean; min?: number; max?: number; step?: number; options?: string[]; createOnly?: boolean; maxLength?: number };
export interface ResourceConfig {
  path: string; title: string; singular: string; paged: boolean; pageSize?: number; search?: boolean; status?: string[]; fields: Field[];
  columns: { key: string; label: string; currency?: boolean }[];
}
function ErrorText(reason: unknown) { return reason instanceof Error ? reason.message : "Không thực hiện được thao tác."; }
function ResourceDetail({ config, id, close }: { config: ResourceConfig; id: number; close: () => void }) {
  const { data, loading, error } = useAdminQuery<AdminRecord>(`${config.path}/${id}`);
  const items = (data?.classes ?? data?.enrollments ?? []) as AdminRecord[];
  return <Modal open title={`Chi tiết ${config.singular}`} onClose={close}>
    {loading && <p role="status">Đang tải chi tiết…</p>}<Feedback error={error} />
    {data && <><dl className="admin-api-detail">{config.fields.filter(f => f.type !== "password").map(f => <div key={f.key}><dt>{f.label}</dt><dd>{display(data[f.key])}</dd></div>)}</dl>
      {items.length > 0 && <><h3>{config.path === "teachers" ? "Lớp phụ trách" : "Lịch sử ghi danh"}</h3><div className="admin-api-table"><table className="admin-table"><thead><tr><th>Lớp</th><th>Khóa</th><th>Trạng thái</th></tr></thead><tbody>{items.map(row => <tr key={row.id}><td>{display(row.name ?? row.className)}</td><td>{display(row.courseName)}</td><td>{display(row.classStatus ?? row.status)}</td></tr>)}</tbody></table></div></>}
      {config.path === "students" && <StudentHistory id={id} />}
    </>}
  </Modal>;
}
function StudentHistory({ id }: { id: number }) {
  const { data, error, loading } = useAdminQuery<{ items: PaymentResponse[]; totalPaid: number }>(`students/${id}/payments`);
  const student = useAdminQuery<StudentResponse>(`students/${id}`);
  const classes = useAdminQuery<AdminRecord[]>("classes/available");
  const api = useAdminApi();
  const [classId, setClassId] = useState(""); const [busy, setBusy] = useState(false); const [actionError, setActionError] = useState("");
  async function enroll() {
    if (!classId) return; setBusy(true); setActionError("");
    try { await api.send("POST", `students/${id}/enrollments`, { classId: Number(classId) }); student.reload(); classes.reload(); setClassId(""); }
    catch (e) { setActionError(ErrorText(e)); } finally { setBusy(false); }
  }
  async function withdraw(enrollmentId: number) {
    if (!window.confirm("Rút học viên khỏi lớp này?")) return; setBusy(true); setActionError("");
    try { await api.send("DELETE", `students/${id}/enrollments/${enrollmentId}`); student.reload(); classes.reload(); }
    catch (e) { setActionError(ErrorText(e)); } finally { setBusy(false); }
  }
  return <><h3>Ghi danh</h3><Feedback error={actionError || student.error || classes.error} />
    <SelectField label="Lớp còn chỗ" value={classId} onChange={e => setClassId(e.target.value)} options={[{value:"",label:"Chọn lớp"}, ...(classes.data ?? []).filter(c => !(student.data?.enrollments ?? []).some(e => e.classId === c.id)).map(c => ({value:String(c.id),label:`${c.name} (${c.enrolled}/${c.capacity}) · ${money(c.finalTuition)}`}))]} />
    <Button type="button" disabled={busy || !classId} onClick={enroll}>Ghi danh</Button>
    {(student.data?.enrollments ?? []).map(e => <p key={e.id}>{e.className} · {display(e.status)} · {money(e.finalTuitionFee)} {e.status !== "Dropped" && <Button type="button" disabled={busy} onClick={() => withdraw(e.id)}>Rút khỏi lớp</Button>}</p>)}
    <h3>Lịch sử học phí</h3>{loading && <p>Đang tải học phí…</p>}<Feedback error={error} />
    {data && <><p>Tổng đã đóng: <strong>{money(data.totalPaid)}</strong></p>{data.items.length === 0 ? <p>Chưa có phiếu thu.</p> : data.items.map(p => <p key={p.id}>{p.className} · {money(p.amount)} · {display(p.paidDate)} · {display(p.method)}</p>)}</>}
  </>;
}
export default function ResourcePage({ config }: { config: ResourceConfig }) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const query = new URLSearchParams({ page: String(page), pageSize: String(config.pageSize ?? 10) });
  if (params.get("search")) query.set("search", params.get("search")!);
  if (params.get("status")) query.set("status", params.get("status")!);
  if (params.get("specialty")) query.set("specialty", params.get("specialty")!);
  const { data, loading, error, reload } = useAdminQuery<PagedResponse<AdminRecord> | AdminRecord[]>(config.path + (config.paged ? `?${query}` : ""));
  const api = useAdminApi();
  const [form, setForm] = useState<Record<string, string>>(() => Object.fromEntries(config.fields.map(f => [f.key, f.options?.[0] ?? (f.type === "number" ? "0" : "")]))); const [editing, setEditing] = useState<number | null>(null);
  const [open, setOpen] = useState(params.get("action") === "create"); const [detail, setDetail] = useState<number | null>(null);
  const [resetId, setResetId] = useState<number | null>(null); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [actionError, setActionError] = useState(""); const [message, setMessage] = useState("");
  const rows = Array.isArray(data) ? data : data?.items ?? [];
  const total = Array.isArray(data) ? data.length : data?.totalItems ?? 0;
  const accounts = config.path === "teachers" || config.path === "students";
  function changeParam(key: string, value: string) { setParams(p => { const next = new URLSearchParams(p); if(value) next.set(key,value); else next.delete(key); if(key !== "page") next.set("page","1"); return next; }); }
  function edit(row?: AdminRecord) {
    setEditing(row?.id ?? null); setActionError("");
    setForm(Object.fromEntries(config.fields.map(f => [f.key, row ? String(row[f.key] ?? "") : f.options?.[0] ?? (f.type === "number" ? "0" : "")]))); setOpen(true);
  }
  async function mutate(action: () => Promise<unknown>, success: string, deleted = false) {
    setBusy(true); setActionError(""); setMessage("");
    try { await action(); setMessage(success); reload(); if(deleted && rows.length === 1 && page > 1) changeParam("page",String(page-1)); return true; }
    catch(e) { setActionError(ErrorText(e)); return false; } finally { setBusy(false); }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const body = Object.fromEntries(config.fields.filter(f => editing === null || !f.createOnly).map(f => [f.key, f.type === "number" ? Number(form[f.key]) : (form[f.key] || null)]));
    if (await mutate(() => api.send(editing === null ? "POST" : "PUT", config.path + (editing === null ? "" : `/${editing}`), body), "Đã lưu thay đổi.")) setOpen(false);
  }
  return <div className="admin-api-stack">
    <div className="admin-api-toolbar"><span>{total} {config.title.toLowerCase()}</span><Button variant="primary" onClick={() => edit()}>+ Thêm {config.singular}</Button></div>
    <form className="admin-api-filters" onSubmit={e => e.preventDefault()}>
      {config.search && <SearchField label="Tìm kiếm" value={params.get("search") ?? ""} onSearch={value => changeParam("search", value)} />}
      {config.status && <SelectField label="Trạng thái" value={params.get("status") ?? ""} onChange={e => changeParam("status", e.target.value)} options={[{value:"",label:"Tất cả"},...config.status.map(s => ({value:s,label:display(s)}))]} />}
      {config.path === "teachers" && <SearchField label="Chuyên môn" value={params.get("specialty") ?? ""} onSearch={value => changeParam("specialty", value)} />}
      <Button type="button" onClick={reload} disabled={loading}>Tải lại</Button>
    </form>
    <Feedback error={error || (!open && resetId === null ? actionError : "")} message={message} />
    <Card><div className="admin-api-table"><table className="admin-table"><thead><tr>{config.columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Thao tác</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={config.columns.length+1} role="status">Đang tải…</td></tr> : error ? <tr><td colSpan={config.columns.length+1}>Chưa tải được danh sách.</td></tr> : rows.length === 0 ? <tr><td colSpan={config.columns.length+1}>Chưa có dữ liệu phù hợp.</td></tr> : rows.map(row => <tr key={row.id}>{config.columns.map(c => <td key={c.key}>{c.currency ? money(row[c.key]) : display(row[c.key])}</td>)}<td><div className="admin-row-actions">
        <Button type="button" onClick={() => setDetail(row.id)}>Chi tiết</Button><Button type="button" disabled={busy} onClick={() => edit(row)}>Sửa</Button>
        {accounts && <><Button type="button" disabled={busy} onClick={() => {setResetId(row.id);setPassword("");setActionError("");}}>Đặt mật khẩu</Button><Button type="button" disabled={busy} onClick={() => {if(window.confirm(`${row.isLocked ? "Mở" : "Khóa"} tài khoản này?`)) void mutate(() => api.send("POST",`${config.path}/${row.id}/${row.isLocked ? "unlock" : "lock"}`),"Đã cập nhật tài khoản.");}}>{row.isLocked ? "Mở khóa" : "Khóa"}</Button></>}
        <Button type="button" disabled={busy} onClick={() => {if(window.confirm(`Xóa ${config.singular} này?`)) void mutate(() => api.send("DELETE",`${config.path}/${row.id}`),"Đã xóa.",true);}}>Xóa</Button>
      </div></td></tr>)}
    </tbody></table></div></Card>
    {config.paged && <Pager page={page} pageSize={config.pageSize ?? 10} total={total} onChange={p => changeParam("page",String(p))} />}
    <Modal open={open} title={`${editing === null ? "Thêm" : "Sửa"} ${config.singular}`} onClose={() => {if(!busy)setOpen(false);}}>
      <form className="admin-api-stack" onSubmit={save}><Feedback error={actionError} />
        {config.fields.filter(f => editing === null || !f.createOnly).map(f => f.options ? <SelectField key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => setForm(v => ({...v,[f.key]:e.target.value}))} options={f.options.map(s => ({value:s,label:display(s)}))} /> : f.type === "textarea" ? <TextareaField key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => setForm(v => ({...v,[f.key]:e.target.value}))} /> : <InputField key={f.key} label={f.label} type={f.type ?? "text"} required={f.required} min={f.min} max={f.max} step={f.step} maxLength={f.maxLength} minLength={f.type === "password" ? 8 : undefined} value={form[f.key] ?? ""} onChange={e => setForm(v => ({...v,[f.key]:e.target.value}))} />)}
        {editing !== null && accounts && <p className="admin-api-muted">Email đăng nhập được giữ nguyên khi sửa hồ sơ.</p>}
        <Button type="submit" variant="primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu"}</Button>
      </form>
    </Modal>
    <Modal open={resetId !== null} title="Đặt lại mật khẩu" onClose={() => {if(!busy)setResetId(null);}}><form onSubmit={async e => {e.preventDefault();if(await mutate(() => api.send("POST",`${config.path}/${resetId}/reset-password`,{newPassword:password}),"Đã đặt lại mật khẩu và thu hồi phiên cũ.")){setResetId(null);setPassword("");}}}><Feedback error={actionError}/><InputField label="Mật khẩu mới" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/><Button type="submit" disabled={busy}>Xác nhận</Button></form></Modal>
    {detail !== null && <ResourceDetail config={config} id={detail} close={() => setDetail(null)} />}
  </div>;
}
