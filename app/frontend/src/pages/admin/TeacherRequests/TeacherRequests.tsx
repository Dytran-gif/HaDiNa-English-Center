import { useState, type FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { SelectField, TextareaField } from "../../../components/ui/FormField";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { TeacherRequestResponse } from "../../../types/adminApi";
import { Feedback } from "../Components/Api/AdminUi";
import { display } from "../Components/Api/adminFormat";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";
export default function TeacherRequests(){
 const [status,setStatus]=useState("Pending");const [type,setType]=useState("");const query=new URLSearchParams();if(status)query.set("status",status);if(type)query.set("type",type);
 const {data,error,loading,reload}=useAdminQuery<TeacherRequestResponse[]>(`teacher-requests?${query}`);const api=useAdminApi();
 const [selected,setSelected]=useState<{id:number;approve:boolean}|null>(null);const [note,setNote]=useState("");const [busy,setBusy]=useState(false);const [actionError,setActionError]=useState("");const [message,setMessage]=useState("");
 async function submit(e:FormEvent){e.preventDefault();if(!selected)return;setBusy(true);setActionError("");setMessage("");try{await api.send("POST",`teacher-requests/${selected.id}/${selected.approve?"approve":"reject"}`,selected.approve?{note}:{reason:note});setSelected(null);setMessage("Đã xử lý đơn.");reload();}catch(e){setActionError(e instanceof Error?e.message:"Không xử lý được đơn.");}finally{setBusy(false);}}
 return <div className="admin-api-stack"><div className="admin-api-filters"><SelectField label="Trạng thái" value={status} onChange={e=>setStatus(e.target.value)} options={[{value:"",label:"Tất cả"},...["Pending","Approved","Rejected","Cancelled"].map(value=>({value,label:display(value)}))]}/><SelectField label="Loại đơn" value={type} onChange={e=>setType(e.target.value)} options={[{value:"",label:"Tất cả"},...["Leave","Reschedule","AttendanceUnlock"].map(value=>({value,label:display(value)}))]}/><Button type="button" onClick={reload}>Tải lại</Button></div><Feedback error={error} message={message}/>
 <Card><div className="admin-api-table"><table className="admin-table"><thead><tr><th>Giáo viên</th><th>Loại đơn</th><th>Buổi học</th><th>Lý do / Đề xuất</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{loading?<tr><td colSpan={6}>Đang tải…</td></tr>:!data?.length?<tr><td colSpan={6}>{error?"Chưa tải được danh sách.":"Chưa có đơn phù hợp."}</td></tr>:data.map(r=><tr key={r.id}><td>{r.teacher.fullName}</td><td>{display(r.type)}</td><td>{r.session.className}<br/>{display(r.session.date)} {r.session.startTime.slice(0,5)}–{r.session.endTime.slice(0,5)}<br/>{r.session.roomName}</td><td>{r.reason}{r.proposedDate&&<p>Đề xuất: {display(r.proposedDate)} {r.proposedStartTime?.slice(0,5)}–{r.proposedEndTime?.slice(0,5)}</p>}{r.adminNote&&<p>Ghi chú: {r.adminNote}</p>}</td><td>{display(r.status)}</td><td>{r.status==="Pending"&&<div className="admin-row-actions"><Button type="button" onClick={()=>{setSelected({id:r.id,approve:true});setNote("");setActionError("");}}>Duyệt</Button><Button type="button" onClick={()=>{setSelected({id:r.id,approve:false});setNote("");setActionError("");}}>Từ chối</Button></div>}</td></tr>)}</tbody></table></div></Card>
 <Modal open={!!selected} title={selected?.approve?"Duyệt đơn":"Từ chối đơn"} onClose={()=>{if(!busy)setSelected(null);}}><form onSubmit={submit}><Feedback error={actionError}/>{selected?.approve&&<p>Kiểm tra kỹ buổi học và lịch bù trước khi xác nhận.</p>}<TextareaField label={selected?.approve?"Ghi chú":"Lý do từ chối"} required={!selected?.approve} value={note} onChange={e=>setNote(e.target.value)}/><Button type="submit" disabled={busy||(!selected?.approve&&!note.trim())}>{busy?"Đang xử lý…":"Xác nhận"}</Button></form></Modal></div>;
}
