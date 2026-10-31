import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../Components/Ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField } from "../Components/Ui/FormField";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, ClassResponse, PagedResponse, Schedule } from "../../../types/adminApi";
import { Feedback, Pager } from "../Components/Api/AdminUi";
import { display } from "../Components/Api/adminFormat";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";
const statusOptions=[{value:"",label:"Tất cả"},...['Upcoming','Ongoing','Finished'].map(value=>({value,label:display(value)}))];
const newSchedule=():Schedule=>({dayOfWeek:1,startTime:"18:00",endTime:"19:30",roomId:0});
interface ClassForm {name:string;courseId:number;teacherId:number;startDate:string;endDate:string;maxStudents:number;meetingUrl:string;schedules:Schedule[]}
const blank=():ClassForm=>({name:"",courseId:0,teacherId:0,startDate:"",endDate:"",maxStudents:20,meetingUrl:"",schedules:[newSchedule()]});
function ClassEditor({item,close,saved}:{item:ClassResponse|null;close:()=>void;saved:()=>void}){
 const api=useAdminApi();const courses=useAdminQuery<PagedResponse<AdminRecord>>("courses?pageSize=100", true);const teachers=useAdminQuery<PagedResponse<AdminRecord>>("teachers?pageSize=100&status=Teaching", true);const rooms=useAdminQuery<AdminRecord[]>("rooms");
 const [form,setForm]=useState<ClassForm>(item?{name:item.name,courseId:item.courseId,teacherId:item.teacherId,startDate:item.startDate,endDate:item.endDate,maxStudents:item.maxStudents,meetingUrl:item.meetingUrl??"",schedules:item.schedules.map(s=>({...s,startTime:s.startTime.slice(0,5),endTime:s.endTime.slice(0,5)}))}:blank);
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const course=courses.data?.items.find(c=>c.id===form.courseId);
 function changeSchedule(index:number,key:keyof Schedule,value:string|number){setForm(v=>({...v,schedules:v.schedules.map((s,i)=>i===index?{...s,[key]:value}:s)}));}
 async function submit(e:FormEvent){e.preventDefault();setError("");
  if(form.schedules.some(s=>s.startTime>=s.endTime)){setError("Giờ kết thúc phải sau giờ bắt đầu.");return;}
  if(form.meetingUrl){try{if(!["http:","https:"].includes(new URL(form.meetingUrl).protocol))throw new Error();}catch{setError("Link học phải là URL http hoặc https hợp lệ.");return;}}
  setBusy(true);try{await api.send(item?"PUT":"POST",`classes${item?`/${item.id}`:""}`,{...form,endDate:form.endDate||null,meetingUrl:form.meetingUrl||null,schedules:form.schedules.map(s=>({dayOfWeek:s.dayOfWeek,startTime:s.startTime.length===5?s.startTime+":00":s.startTime,endTime:s.endTime.length===5?s.endTime+":00":s.endTime,roomId:s.roomId}))});saved();close();}catch(e){setError(e instanceof Error?e.message:"Không lưu được lớp.");}finally{setBusy(false);}
 }
 return <Modal open title={item?"Sửa lớp học":"Tạo lớp học"} onClose={()=>{if(!busy)close();}}><form className="admin-api-stack" onSubmit={submit}><Feedback error={error||courses.error||teachers.error||rooms.error}/>
  <InputField label="Tên lớp" required maxLength={150} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
  <SelectField label="Khóa học" required value={form.courseId||""} onChange={e=>setForm({...form,courseId:Number(e.target.value)})} options={[{value:"",label:"Chọn khóa"},...(courses.data?.items??[]).map(c=>({value:String(c.id),label:String(c.name)}))]}/>
  <SelectField label="Giáo viên" required value={form.teacherId||""} onChange={e=>setForm({...form,teacherId:Number(e.target.value)})} options={[{value:"",label:"Chọn giáo viên"},...(teachers.data?.items??[]).map(t=>({value:String(t.id),label:String(t.fullName)}))]}/>
  <div className="admin-api-grid"><InputField label="Ngày bắt đầu" type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/><InputField label="Ngày kết thúc (để trống để tự tính)" type="date" min={form.startDate} value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div>
  <InputField label="Sĩ số tối đa" type="number" required min={1} max={1000} value={form.maxStudents} onChange={e=>setForm({...form,maxStudents:Number(e.target.value)})}/><InputField label="Link học online" type="url" value={form.meetingUrl} onChange={e=>setForm({...form,meetingUrl:e.target.value})}/>
  <h3>Lịch học mỗi tuần</h3>{course&&form.schedules.length!==Number(course.sessionsPerWeek)&&<Feedback message={`Khóa có ${course.sessionsPerWeek} buổi/tuần; lịch đang có ${form.schedules.length} buổi.`}/>}
  {form.schedules.map((s,i)=><div className="admin-api-schedule admin-api-grid" key={i}>
   <SelectField label={`Thứ — buổi ${i+1}`} value={s.dayOfWeek} onChange={e=>changeSchedule(i,"dayOfWeek",Number(e.target.value))} options={Array.from({length:7},(_,d)=>({value:String(d+1),label:d===6?"Chủ nhật":`Thứ ${d+2}`}))}/>
   <InputField label={`Bắt đầu — buổi ${i+1}`} type="time" required value={s.startTime} onChange={e=>changeSchedule(i,"startTime",e.target.value)}/><InputField label={`Kết thúc — buổi ${i+1}`} type="time" required value={s.endTime} onChange={e=>changeSchedule(i,"endTime",e.target.value)}/>
   <SelectField label={`Phòng — buổi ${i+1}`} required value={s.roomId||""} onChange={e=>changeSchedule(i,"roomId",Number(e.target.value))} options={[{value:"",label:"Chọn phòng"},...(rooms.data??[]).map(r=>({value:String(r.id),label:`${r.name} (${r.capacity} chỗ)`}))]}/>
   <Button type="button" disabled={form.schedules.length===1||busy} onClick={()=>setForm({...form,schedules:form.schedules.filter((_,n)=>n!==i)})}>Bỏ buổi này</Button></div>)}
  <Button type="button" onClick={()=>setForm({...form,schedules:[...form.schedules,newSchedule()]})}>+ Thêm buổi</Button><Button type="submit" variant="primary" disabled={busy||courses.loading||teachers.loading||rooms.loading||!!courses.error||!!teachers.error||!!rooms.error}>{busy?"Đang lưu…":"Lưu lớp"}</Button>
 </form></Modal>;
}
function ClassDetail({id,close,edit}:{id:number;close:()=>void;edit:(item:ClassResponse)=>void}){
 const {data,error,loading,reload}=useAdminQuery<ClassResponse>(`classes/${id}`);const api=useAdminApi();const [errorAction,setErrorAction]=useState("");const [busy,setBusy]=useState(false);
 async function withdraw(enrollmentId:number){if(!window.confirm("Rút học viên khỏi lớp?"))return;setBusy(true);setErrorAction("");try{await api.send("DELETE",`classes/${id}/students/${enrollmentId}`);reload();}catch(e){setErrorAction(e instanceof Error?e.message:"Không rút được học viên.");}finally{setBusy(false);}}
 return <Modal open title="Chi tiết lớp" onClose={close}><Feedback error={error||errorAction}/>{loading&&<p>Đang tải…</p>}{data&&<><h3>{data.name}</h3><p>{data.courseName} · {data.teacherName} · {display(data.status)}</p><p>{display(data.startDate)} – {display(data.endDate)} · {data.enrolledCount}/{data.maxStudents} học viên</p>{data.meetingUrl&&/^https?:\/\//i.test(data.meetingUrl)&&<a href={data.meetingUrl} target="_blank" rel="noreferrer">Mở link lớp học</a>}
 {data.schedules.map((s,i)=><p key={i}>{s.dayOfWeek===7?"CN":`T${s.dayOfWeek+1}`} {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)} · {s.roomName}</p>)}<Button type="button" onClick={()=>edit(data)}>Sửa lớp</Button>
 <h3>Học viên ({data.students?.length??0})</h3><p>Để thêm học viên, mở mục Học viên → Chi tiết → Ghi danh.</p>{(data.students??[]).map(s=><p key={String(s.enrollmentId)}>{String(s.code)} · {String(s.fullName)} · {display(s.status)} {s.status!=="Dropped"&&<Button type="button" disabled={busy} onClick={()=>withdraw(Number(s.enrollmentId))}>Rút</Button>}</p>)}</>}</Modal>;
}
export default function ClassesManagement(){
 const [params,setParams]=useSearchParams();const page=Math.max(1,Number(params.get("page"))||1);const query=new URLSearchParams(params);query.delete("action");query.set("page",String(page));query.set("pageSize","10");
 const {data,error,loading,reload}=useAdminQuery<PagedResponse<ClassResponse>>(`classes?${query}`);const courses=useAdminQuery<PagedResponse<AdminRecord>>("courses?pageSize=100", true);const teachers=useAdminQuery<PagedResponse<AdminRecord>>("teachers?pageSize=100", true);const api=useAdminApi();
 const [editor,setEditor]=useState<ClassResponse|null|undefined>(params.get("action")==="create"?null:undefined);const [detail,setDetail]=useState<number|null>(null);const [busy,setBusy]=useState(false);const [actionError,setActionError]=useState("");
 function filter(key:string,value:string){setParams(p=>{const n=new URLSearchParams(p);if(value)n.set(key,value);else n.delete(key);if(key!=="page")n.set("page","1");return n;});}
 async function remove(id:number){if(!window.confirm("Xóa lớp này?"))return;setBusy(true);setActionError("");try{await api.send("DELETE",`classes/${id}`);reload();if(data?.items.length===1&&page>1)filter("page",String(page-1));}catch(e){setActionError(e instanceof Error?e.message:"Không xóa được lớp.");}finally{setBusy(false);}}
 return <div className="admin-api-stack"><div className="admin-api-toolbar"><span>{data?.totalItems??0} lớp học</span><Button variant="primary" onClick={()=>setEditor(null)}>+ Tạo lớp</Button></div>
 <div className="admin-api-filters"><SelectField label="Khóa học" value={params.get("courseId")??""} onChange={e=>filter("courseId",e.target.value)} options={[{value:"",label:"Tất cả"},...(courses.data?.items??[]).map(c=>({value:String(c.id),label:String(c.name)}))]}/><SelectField label="Giáo viên" value={params.get("teacherId")??""} onChange={e=>filter("teacherId",e.target.value)} options={[{value:"",label:"Tất cả"},...(teachers.data?.items??[]).map(t=>({value:String(t.id),label:String(t.fullName)}))]}/><SelectField label="Trạng thái" value={params.get("status")??""} options={statusOptions} onChange={e=>filter("status",e.target.value)}/><Button type="button" onClick={reload}>Tải lại</Button></div>
 <Feedback error={error||actionError||courses.error||teachers.error}/><Card><div className="admin-api-table"><table className="admin-table"><thead><tr><th>Lớp / Khóa</th><th>Giáo viên</th><th>Lịch</th><th>Sĩ số</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{loading?<tr><td colSpan={6}>Đang tải…</td></tr>:!(data?.items.length)?<tr><td colSpan={6}>{error?"Chưa tải được danh sách.":"Chưa có lớp phù hợp."}</td></tr>:data.items.map(c=><tr key={c.id}><td>{c.name}<br/>{c.courseName}</td><td>{c.teacherName}</td><td>{c.schedules.map((s,i)=><div key={i}>{s.dayOfWeek===7?"CN":`T${s.dayOfWeek+1}`} {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)} · {s.roomName}</div>)}</td><td>{c.enrolledCount}/{c.maxStudents}</td><td>{display(c.status)}</td><td><div className="admin-row-actions"><Button type="button" onClick={()=>setDetail(c.id)}>Chi tiết</Button><Button type="button" disabled={busy} onClick={()=>setEditor(c)}>Sửa</Button><Button type="button" disabled={busy} onClick={()=>remove(c.id)}>Xóa</Button></div></td></tr>)}</tbody></table></div></Card>
 <Pager page={page} total={data?.totalItems??0} onChange={p=>setParams(v=>{const n=new URLSearchParams(v);n.set("page",String(p));return n;})}/>
 {editor!==undefined&&<ClassEditor item={editor} close={()=>setEditor(undefined)} saved={reload}/>}{detail!==null&&<ClassDetail id={detail} close={()=>{setDetail(null);reload();}} edit={item=>{setDetail(null);setEditor(item);}}/>}</div>;
}
