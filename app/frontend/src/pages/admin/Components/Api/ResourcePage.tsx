import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Card from "../../../../components/ui/Card";
import { useAdminApi, useAdminQuery } from "../../../../services/admin/useAdminApi";
import { ApiError } from "../../../../services/apiClient";
import type { AdminRecord, PagedResponse } from "../../../../types/adminApi";
import Button from "../Ui/Button";
import Modal from "../Ui/Modal";
import RowActions from "../Ui/RowActions";
import ActionMenu from "../Ui/ActionMenu";
import Badge from "../Ui/Badge";
import ConfirmDialog from "../Ui/ConfirmDialog";
import EmptyState from "../Ui/EmptyState";
import Notice from "../Ui/Notice";
import TableSkeleton from "../Ui/TableSkeleton";
import { InputField, SelectField, TextareaField } from "../Ui/FormField";
import useToast from "../Ui/useToast";
import { Pager } from "./AdminUi";
import { display, money } from "./adminFormat";
import SearchField from "./SearchField";
import "../../admin-shared.css";
import "./AdminApi.css";

type Field = { key: string; label: string; type?: string; required?: boolean; min?: number; max?: number; step?: number; options?: string[]; createOnly?: boolean; maxLength?: number };
export interface ResourceConfig { path: string; title: string; singular: string; paged: boolean; pageSize?: number; search?: boolean; status?: string[]; fields: Field[]; columns: { key: string; label: string; currency?: boolean }[] }
function errorText(reason: unknown) { return reason instanceof Error ? reason.message : "Không thực hiện được thao tác."; }
function TeacherSpecialtyFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = useAdminQuery<PagedResponse<AdminRecord>>("teachers?pageSize=100", true);
  const values = Array.from(new Set([...(query.data?.items ?? []).map(item => String(item.specialty ?? "")), value].filter(Boolean))).sort((a,b) => a.localeCompare(b,"vi"));
  return <><SelectField label="Chuyên môn" value={value} disabled={query.loading || Boolean(query.error)} onChange={event => onChange(event.target.value)} options={[{value:"",label:query.loading ? "Đang tải chuyên môn…" : "Tất cả chuyên môn"},...values.map(item => ({value:item,label:item}))]}/>{query.error && <Button onClick={query.reload}>Thử lại chuyên môn</Button>}</>;
}
export default function ResourcePage({ config }: { config: ResourceConfig }) {
  const [params, setParams] = useSearchParams(); const location = useLocation(); const api = useAdminApi(); const { notify } = useToast();
  const rawPage = Number(params.get("page")); const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = config.pageSize ?? 10; const accounts = ["teachers","students"].includes(config.path); const isCourse = config.path === "courses";
  const query = new URLSearchParams({page:String(page),pageSize:String(pageSize)});
  for (const key of ["search","status","specialty"]) if (params.get(key)) query.set(key,params.get(key)!);
  const list = useAdminQuery<PagedResponse<AdminRecord> | AdminRecord[]>(config.path + (config.paged ? `?${query}` : ""));
  const rows = Array.isArray(list.data) ? list.data : list.data?.items ?? [];
  const total = Array.isArray(list.data) ? list.data.length : list.data?.totalItems ?? 0;
  const makeForm = (row?: AdminRecord) => Object.fromEntries(config.fields.map(field => [field.key, row ? String(row[field.key] ?? "") : field.options?.[0] ?? (field.key === "discountPercent" ? "0" : "")]));
  const [form,setForm] = useState<Record<string,string>>(() => makeForm()); const [editing,setEditing] = useState<number|null>(null);
  const [open,setOpen] = useState(params.get("action") === "create");
  const [busy,setBusy] = useState(false); const [editorLoading,setEditorLoading] = useState(false); const [actionError,setActionError] = useState("");
  const [fieldErrors,setFieldErrors] = useState<Record<string,string>>({}); const [resetRow,setResetRow] = useState<AdminRecord|null>(null); const [password,setPassword] = useState("");
  const [confirmation,setConfirmation] = useState<{row:AdminRecord; action:"delete"|"lock"}|null>(null);
  const editId = params.get("edit");
  useEffect(() => {
    if (!editId || !Number.isSafeInteger(Number(editId)) || Number(editId) < 1) return;
    const controller = new AbortController(); setEditorLoading(true); setActionError(""); setOpen(true); setFieldErrors({});
    api.get<AdminRecord>(`${config.path}/${editId}`,controller.signal).then(row => {
      if (!controller.signal.aborted) { setEditing(row.id); setForm(Object.fromEntries(config.fields.map(field => [field.key,String(row[field.key] ?? "")]))); }
    }).catch(reason => { if (!controller.signal.aborted) { setActionError(errorText(reason)); setOpen(false); } }).finally(() => { if (!controller.signal.aborted) setEditorLoading(false); });
    return () => controller.abort();
  },[editId,api,config.path,config.fields]);
  useEffect(() => {
    if (!config.paged || list.loading || list.error || !list.data) return;
    const last = Math.max(1,Math.ceil(total/pageSize));
    if (page > last) setParams(previous => { const next = new URLSearchParams(previous); next.set("page",String(last)); return next; },{replace:true});
  },[config.paged,list.loading,list.error,list.data,total,pageSize,page,setParams]);
  function changeParam(key:string,value:string) { setParams(previous => { const next = new URLSearchParams(previous); if(value)next.set(key,value);else next.delete(key); if(key!=="page")next.set("page","1"); return next; }); }
  function closeEditor() { if(busy)return; setOpen(false); setEditorLoading(false); setParams(previous => { const next = new URLSearchParams(previous); next.delete("edit"); next.delete("action"); return next; },{replace:true}); }
  function edit(row?:AdminRecord) { setEditorLoading(false); setParams(previous => { const next = new URLSearchParams(previous); next.delete("edit"); next.delete("action"); return next; },{replace:true}); setEditing(row?.id ?? null); setForm(makeForm(row)); setFieldErrors({}); setActionError(""); setOpen(true); }
  function updateField(key:string,value:string) { setForm(previous => ({...previous,[key]:value})); setFieldErrors(previous => {const next={...previous};delete next[key.toLowerCase()];return next;}); }
  async function mutate(action:()=>Promise<unknown>,success:string,deleted=false,rethrow=false) {
    if(busy)return false;setBusy(true);setActionError("");setFieldErrors({});
    try {await action();list.reload();notify({title:success});if(deleted&&rows.length===1&&page>1)changeParam("page",String(page-1));return true;}
    catch(reason){setActionError(errorText(reason));if(reason instanceof ApiError)setFieldErrors(Object.fromEntries(Object.entries(reason.fieldErrors).map(([key,errors])=>[key.split(".").at(-1)!.toLowerCase(),errors.join(" ")])));if(rethrow)throw reason;return false;}
    finally{setBusy(false);}
  }
  async function save(event:FormEvent) {
    event.preventDefault();if(busy||editorLoading)return;
    if(isCourse){const errors:Record<string,string>={};if(Number(form.bandFrom)>Number(form.bandTo))errors.bandfrom="Band từ phải nhỏ hơn hoặc bằng band đến.";if(Number(form.sessionsPerWeek)>Number(form.totalSessions))errors.sessionsperweek="Số buổi mỗi tuần không được lớn hơn tổng số buổi.";if(Object.keys(errors).length){setFieldErrors(errors);return;}}
    const body=Object.fromEntries(config.fields.filter(field=>editing===null||!field.createOnly).map(field=>[field.key,field.type==="number"?Number(form[field.key]):form[field.key]||null]));
    if(await mutate(()=>api.send(editing===null?"POST":"PUT",config.path+(editing===null?"":`/${editing}`),body),"Đã lưu thay đổi.")) {setOpen(false);setParams(previous=>{const next=new URLSearchParams(previous);next.delete("edit");next.delete("action");return next;},{replace:true});}
  }
  const nameOf=(row:AdminRecord)=>String(row.fullName ?? row.name ?? config.singular);
  function actions(row:AdminRecord){
    const deleteButton=<Button icon="trash" variant="danger" onClick={()=>setConfirmation({row,action:"delete"})} disabled={busy}>Xóa {config.singular}</Button>;
    return <RowActions name={nameOf(row)} onEdit={()=>edit(row)} disabled={busy} onDelete={accounts?undefined:()=>setConfirmation({row,action:"delete"})}>{accounts?<ActionMenu label={nameOf(row)}>
      <Button onClick={()=>{setResetRow(row);setPassword("");setActionError("");setFieldErrors({});}} disabled={busy}>Đặt lại mật khẩu</Button>
      <Button onClick={()=>setConfirmation({row,action:"lock"})} disabled={busy}>{row.isLocked?"Mở khóa tài khoản":"Khóa tài khoản"}</Button>
      {deleteButton}
    </ActionMenu>:null}</RowActions>;
  }
  const filtered=Boolean(params.get("search")||params.get("status")||params.get("specialty"));
  return <div className="admin-api-stack">
    <div className="admin-api-toolbar"><span role="status">{list.loading?"Đang tải danh sách…":list.error?"Chưa tải được danh sách":`${total} ${config.title.toLowerCase()}`}</span><Button variant="primary" icon="plus" onClick={()=>edit()}>Thêm {config.singular}</Button></div>
    <div className="admin-api-filters">
      {config.search&&<SearchField label={`Tìm ${config.singular}`} placeholder={`Nhập ${accounts?"tên hoặc thông tin cần tìm":"tên "+config.singular}…`} value={params.get("search")??""} onSearch={value=>changeParam("search",value)}/>}
      {config.status&&<SelectField label="Trạng thái" value={params.get("status")??""} onChange={event=>changeParam("status",event.target.value)} options={[{value:"",label:"Tất cả trạng thái"},...config.status.map(value=>({value,label:display(value)}))]}/>}
      {config.path==="teachers"&&<TeacherSpecialtyFilter value={params.get("specialty")??""} onChange={value=>changeParam("specialty",value)}/>}
      {filtered&&<Button variant="ghost" onClick={()=>setParams({})}>Xóa bộ lọc</Button>}<Button icon="refresh" loading={list.loading} onClick={list.reload}>Tải lại</Button>
    </div>
    {list.error&&<Notice tone="error" title="Không tải được danh sách" action={<Button onClick={list.reload}>Thử lại</Button>}>{list.error}</Notice>}
    {actionError&&!open&&!resetRow&&!confirmation&&<Notice tone="error">{actionError}</Notice>}
    {!list.error&&(isCourse?<div className="admin-course-grid" aria-busy={list.loading}>
      {list.loading?Array.from({length:4},(_,index)=><Card key={index} className="admin-course-card"><span className="admin-skeleton-line"/><span className="admin-skeleton-line"/>{index===0&&<span role="status" className="admin-sr-only">Đang tải khóa học…</span>}</Card>):rows.map(row=><Card className="admin-course-card" key={row.id}>
        <div className="admin-management-toolbar"><Badge tone="info">Band {display(row.bandFrom)} – {display(row.bandTo)}</Badge>{Number(row.discountPercent)>0&&<Badge tone="success">Giảm {row.discountPercent as number}%</Badge>}</div>
        <h3>{String(row.name)}</h3><p>{display(row.totalSessions)} buổi · {display(row.sessionsPerWeek)} buổi/tuần</p><p>{display(row.activeStudents)} học viên đang học</p>
        <div><strong className="admin-course-price">{money(row.finalPrice)}</strong>{Number(row.discountPercent)>0&&<span className="admin-management-subtitle"><s>{money(row.tuition)}</s></span>}</div>
        <footer>{actions(row)}</footer>
      </Card>)}
    </div>:<Card><div className="admin-api-table" role="region" aria-label={`Danh sách ${config.title.toLowerCase()}`} tabIndex={0}><table className="admin-table" aria-busy={list.loading}><thead><tr>{config.columns.map(column=><th scope="col" key={column.key}>{column.label}</th>)}<th scope="col">Thao tác</th></tr></thead><tbody>
      {list.loading?<TableSkeleton columns={config.columns.length+1}/>:rows.map(row=><tr key={row.id}>{config.columns.map(column=><td key={column.key}>{column.key==="fullName"&&accounts?<Link className="admin-management-name" to={`/admin/${config.path}/${row.id}`} state={{returnTo:location.pathname+location.search}}>{display(row[column.key])}</Link>:column.key==="status"?<Badge status={String(row.status)}/>:column.key==="isLocked"?<Badge tone={row.isLocked?"warning":"success"}>{display(row.isLocked)}</Badge>:column.currency?money(row[column.key]):display(row[column.key])}</td>)}<td>{actions(row)}</td></tr>)}
    </tbody></table></div></Card>)}
    {!list.loading&&!list.error&&!rows.length&&<EmptyState title={filtered?`Không tìm thấy ${config.singular} phù hợp`:`Chưa có ${config.singular}`} description={filtered?"Thử từ khóa khác hoặc xóa bộ lọc để xem lại danh sách.":`Thêm ${config.singular} đầu tiên để bắt đầu quản lý.`} action={filtered?<Button onClick={()=>setParams({})}>Xóa bộ lọc</Button>:<Button variant="primary" onClick={()=>edit()}>Thêm {config.singular}</Button>}/>}
    {config.paged&&total>pageSize&&<Pager page={page} pageSize={pageSize} total={total} loading={list.loading} onChange={value=>{changeParam("page",String(value));document.getElementById("admin-main-content")?.scrollIntoView({block:"start"});}}/>}
    <Modal open={open} title={`${editing===null?"Thêm":"Sửa"} ${config.singular}`} busy={busy} onClose={closeEditor}>
      {editorLoading?<p role="status">Đang tải hồ sơ để chỉnh sửa…</p>:<form className="admin-api-stack" onSubmit={save}>
        {actionError&&<Notice tone="error">{actionError}</Notice>}
        {config.fields.filter(field=>editing===null||!field.createOnly).map(field=>field.options?<SelectField key={field.key} label={field.label} required={field.required} disabled={busy} error={fieldErrors[field.key.toLowerCase()]} value={form[field.key]??""} onChange={event=>updateField(field.key,event.target.value)} options={field.options.map(value=>({value,label:display(value)}))}/>:field.type==="textarea"?<TextareaField key={field.key} label={field.label} disabled={busy} error={fieldErrors[field.key.toLowerCase()]} maxLength={field.maxLength} value={form[field.key]??""} onChange={event=>updateField(field.key,event.target.value)}/>:<InputField key={field.key} label={field.label} placeholder={`Nhập ${field.label.toLowerCase()}`} type={field.type??"text"} required={field.required} disabled={busy} error={fieldErrors[field.key.toLowerCase()]} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength} minLength={field.type==="password"?8:undefined} value={form[field.key]??""} onChange={event=>updateField(field.key,event.target.value)}/>)}
        {isCourse&&<><p>Học phí sau giảm: <strong>{money(Number(form.tuition||0)*(1-Number(form.discountPercent||0)/100))}</strong></p>{editing!==null&&<Notice tone="info">Thay đổi học phí và giảm giá chỉ áp dụng cho học viên ghi danh từ bây giờ.</Notice>}</>}
        {editing!==null&&accounts&&<p className="admin-api-muted">Email đăng nhập được giữ nguyên khi sửa hồ sơ.</p>}
        <div className="admin-row-actions"><Button disabled={busy} onClick={closeEditor}>Hủy</Button><Button type="submit" variant="primary" loading={busy}>Lưu {config.singular}</Button></div>
      </form>}
    </Modal>
    <Modal open={Boolean(resetRow)} title={`Đặt lại mật khẩu: ${resetRow?nameOf(resetRow):""}`} busy={busy} onClose={()=>{if(!busy)setResetRow(null);}}>
      <form className="admin-api-stack" onSubmit={async event=>{event.preventDefault();if(!resetRow)return;if(await mutate(()=>api.send("POST",`${config.path}/${resetRow.id}/reset-password`,{newPassword:password}),"Đã đặt lại mật khẩu và kết thúc các phiên đăng nhập cũ.")){setResetRow(null);setPassword("");}}}>
        <Notice tone="info">Mật khẩu mới sẽ thay mật khẩu hiện tại và kết thúc các phiên đăng nhập cũ của tài khoản này.</Notice>{actionError&&<Notice tone="error">{actionError}</Notice>}
        <InputField label="Mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} help="Tối thiểu 8 ký tự. Chia sẻ mật khẩu mới cho chủ tài khoản qua kênh riêng." disabled={busy} error={fieldErrors.newpassword} value={password} onChange={event=>setPassword(event.target.value)}/><Button type="submit" variant="primary" loading={busy}>Đặt lại mật khẩu</Button>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.action==="delete"?`Xóa ${config.singular}`:confirmation?.row.isLocked?"Mở khóa tài khoản":"Khóa tài khoản"} confirmLabel={confirmation?.action==="delete"?"Xác nhận xóa":confirmation?.row.isLocked?"Mở khóa":"Khóa tài khoản"} danger={confirmation?.action==="delete"||!confirmation?.row.isLocked} onClose={()=>setConfirmation(null)} onConfirm={async()=>{
      if(!confirmation)return;const {row,action}=confirmation;
      await mutate(()=>api.send(action==="delete"?"DELETE":"POST",`${config.path}/${row.id}${action==="delete"?"":`/${row.isLocked?"unlock":"lock"}`}`),action==="delete"?`Đã xóa ${nameOf(row)}.`:"Đã cập nhật trạng thái tài khoản.",action==="delete",true);
    }}><p>{confirmation?.action==="delete"?"Bạn muốn xóa":"Thay đổi quyền đăng nhập của"} <strong>{confirmation?nameOf(confirmation.row):""}</strong>?</p>{confirmation?.action==="delete"&&<p>Dữ liệu đang được sử dụng sẽ được máy chủ kiểm tra trước khi xóa.</p>}</ConfirmDialog>
  </div>;
}
