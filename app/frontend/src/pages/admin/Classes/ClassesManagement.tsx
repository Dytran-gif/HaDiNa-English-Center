import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Button from "../Components/Ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../Components/Ui/Modal";
import { InputField, SelectField } from "../Components/Ui/FormField";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, ClassResponse, PagedResponse, Schedule } from "../../../types/adminApi";
import { Feedback, Pager } from "../Components/Api/AdminUi";
import { display } from "../Components/Api/adminFormat";
import Badge from "../Components/Ui/Badge";
import ConfirmDialog from "../Components/Ui/ConfirmDialog";
import EmptyState from "../Components/Ui/EmptyState";
import Notice from "../Components/Ui/Notice";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import useToast from "../Components/Ui/useToast";
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
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setError("");
  if(form.schedules.some(s=>s.startTime>=s.endTime)){setError("Giờ kết thúc phải sau giờ bắt đầu.");return;}
  if(form.meetingUrl){try{if(!["http:","https:"].includes(new URL(form.meetingUrl).protocol))throw new Error();}catch{setError("Link học phải là URL http hoặc https hợp lệ.");return;}}
  setBusy(true);try{await api.send(item?"PUT":"POST",`classes${item?`/${item.id}`:""}`,{...form,endDate:form.endDate||null,meetingUrl:form.meetingUrl||null,schedules:form.schedules.map(s=>({dayOfWeek:s.dayOfWeek,startTime:s.startTime.length===5?s.startTime+":00":s.startTime,endTime:s.endTime.length===5?s.endTime+":00":s.endTime,roomId:s.roomId}))});saved();close();}catch(e){setError(e instanceof Error?e.message:"Không lưu được lớp.");}finally{setBusy(false);}
 }
 return <Modal open busy={busy} title={item?"Sửa lớp học":"Tạo lớp học"} onClose={()=>{if(!busy)close();}}><form className="admin-api-stack" onSubmit={submit}><Feedback error={error||courses.error||teachers.error||rooms.error}/>
  <fieldset className="admin-api-fieldset admin-api-stack" disabled={busy}><InputField label="Tên lớp" required maxLength={150} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
  <SelectField label="Khóa học" required value={form.courseId||""} onChange={e=>setForm({...form,courseId:Number(e.target.value)})} options={[{value:"",label:"Chọn khóa"},...(courses.data?.items??[]).map(c=>({value:String(c.id),label:String(c.name)}))]}/>
  <SelectField label="Giáo viên" required value={form.teacherId||""} onChange={e=>setForm({...form,teacherId:Number(e.target.value)})} options={[{value:"",label:"Chọn giáo viên"},...(teachers.data?.items??[]).map(t=>({value:String(t.id),label:String(t.fullName)}))]}/>
  <div className="admin-api-grid"><InputField label="Ngày bắt đầu" type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/><InputField label="Ngày kết thúc (để trống để tự tính)" type="date" min={form.startDate} value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div>
  <InputField label="Sĩ số tối đa" type="number" required min={1} max={1000} value={form.maxStudents} onChange={e=>setForm({...form,maxStudents:Number(e.target.value)})}/><InputField label="Link học online" type="url" value={form.meetingUrl} onChange={e=>setForm({...form,meetingUrl:e.target.value})}/>
  <h3>Lịch học mỗi tuần</h3>{course&&form.schedules.length!==Number(course.sessionsPerWeek)&&<Notice tone="warning">Khóa có {String(course.sessionsPerWeek)} buổi/tuần; lịch đang có {form.schedules.length} buổi.</Notice>}
  {form.schedules.map((s,i)=><div className="admin-api-schedule admin-api-grid" key={i}>
   <SelectField label={`Thứ — buổi ${i+1}`} value={s.dayOfWeek} onChange={e=>changeSchedule(i,"dayOfWeek",Number(e.target.value))} options={Array.from({length:7},(_,d)=>({value:String(d+1),label:d===6?"Chủ nhật":`Thứ ${d+2}`}))}/>
   <InputField label={`Bắt đầu — buổi ${i+1}`} type="time" required value={s.startTime} onChange={e=>changeSchedule(i,"startTime",e.target.value)}/><InputField label={`Kết thúc — buổi ${i+1}`} type="time" required value={s.endTime} onChange={e=>changeSchedule(i,"endTime",e.target.value)}/>
   <SelectField label={`Phòng — buổi ${i+1}`} required value={s.roomId||""} onChange={e=>changeSchedule(i,"roomId",Number(e.target.value))} options={[{value:"",label:"Chọn phòng"},...(rooms.data??[]).map(r=>({value:String(r.id),label:`${r.name} (${r.capacity} chỗ)`}))]}/>
   <Button type="button" disabled={form.schedules.length===1||busy} onClick={()=>setForm({...form,schedules:form.schedules.filter((_,n)=>n!==i)})}>Bỏ buổi này</Button></div>)}
  <Button type="button" onClick={()=>setForm({...form,schedules:[...form.schedules,newSchedule()]})}>+ Thêm buổi</Button><Button onClick={close} disabled={busy}>Hủy</Button><Button type="submit" variant="primary" disabled={busy||courses.loading||teachers.loading||rooms.loading||!!courses.error||!!teachers.error||!!rooms.error}>{busy?"Đang lưu…":"Lưu lớp"}</Button>
 </fieldset></form></Modal>;
}
export default function ClassesManagement(){
 const [params,setParams]=useSearchParams();const location=useLocation();const api=useAdminApi();const {notify}=useToast();
 const rawPage=Number(params.get("page"));const page=Number.isSafeInteger(rawPage)&&rawPage>0?rawPage:1;
 const query=new URLSearchParams(params);query.delete("action");query.delete("edit");query.set("page",String(page));query.set("pageSize","10");
 const list=useAdminQuery<PagedResponse<ClassResponse>>(`classes?${query}`);
 const courses=useAdminQuery<PagedResponse<AdminRecord>>("courses?pageSize=100",true);const teachers=useAdminQuery<PagedResponse<AdminRecord>>("teachers?pageSize=100",true);
 const [editor,setEditor]=useState<ClassResponse|null|undefined>(params.get("action")==="create"?null:undefined);const [actionError,setActionError]=useState("");const [deletion,setDeletion]=useState<ClassResponse|null>(null);
 const editId=params.get("edit");
 useEffect(()=>{if(!editId||!Number.isSafeInteger(Number(editId))||Number(editId)<1)return;const controller=new AbortController();api.get<ClassResponse>(`classes/${editId}`,controller.signal).then(data=>{if(!controller.signal.aborted)setEditor(data);}).catch(error=>{if(!controller.signal.aborted)setActionError(error instanceof Error?error.message:"Không tải được lớp để sửa.");});return()=>controller.abort();},[api,editId]);
 useEffect(()=>{if(list.loading||list.error||!list.data)return;const last=Math.max(1,Math.ceil(list.data.totalItems/10));if(page>last)setParams(previous=>{const next=new URLSearchParams(previous);next.set("page",String(last));return next;},{replace:true});},[list.loading,list.error,list.data,page,setParams]);
 function filter(key:string,value:string){setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);if(key!=="page")next.set("page","1");return next;});}
 function closeEditor(){setEditor(undefined);setParams(previous=>{const next=new URLSearchParams(previous);next.delete("edit");next.delete("action");return next;},{replace:true});}
 const filtered=Boolean(params.get("courseId")||params.get("teacherId")||params.get("status"));
 const day=(value:number)=>value===7?"CN":`T${value+1}`;
 return <div className="admin-api-stack">
  <div className="admin-api-toolbar"><span role="status">{list.loading?"Đang tải lớp học…":list.error?"Chưa tải được danh sách":`${list.data?.totalItems??0} lớp học`}</span><Button variant="primary" icon="plus" onClick={()=>setEditor(null)}>Tạo lớp</Button></div>
  <div className="admin-api-filters"><SelectField label="Khóa học" value={params.get("courseId")??""} disabled={courses.loading} onChange={event=>filter("courseId",event.target.value)} options={[{value:"",label:"Tất cả khóa"},...(courses.data?.items??[]).map(item=>({value:String(item.id),label:String(item.name)}))]}/><SelectField label="Giáo viên" value={params.get("teacherId")??""} disabled={teachers.loading} onChange={event=>filter("teacherId",event.target.value)} options={[{value:"",label:"Tất cả giáo viên"},...(teachers.data?.items??[]).map(item=>({value:String(item.id),label:String(item.fullName)}))]}/><SelectField label="Trạng thái" value={params.get("status")??""} options={statusOptions} onChange={event=>filter("status",event.target.value)}/>{filtered&&<Button variant="ghost" onClick={()=>setParams({})}>Xóa bộ lọc</Button>}<Button icon="refresh" loading={list.loading} onClick={list.reload}>Tải lại</Button></div>
  {(list.error||actionError||courses.error||teachers.error)&&<Notice tone="error" action={<Button onClick={()=>{list.reload();courses.reload();teachers.reload();}}>Thử lại</Button>}>{list.error||actionError||courses.error||teachers.error}</Notice>}
  {!list.error&&<Card><div className="admin-api-table" role="region" aria-label="Danh sách lớp học" tabIndex={0}><table className="admin-table" aria-busy={list.loading}><thead><tr><th>Lớp / Khóa</th><th>Giáo viên</th><th>Lịch học</th><th>Sĩ số</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{list.loading?<TableSkeleton columns={6}/>:list.data?.items.map(item=><tr key={item.id}><td><Link className="admin-management-name" to={`/admin/classes/${item.id}`} state={{returnTo:location.pathname+location.search}}>{item.name}</Link><span className="admin-management-subtitle">{item.courseName}</span></td><td><Link className="admin-management-name" to={`/admin/teachers/${item.teacherId}`}>{item.teacherName}</Link></td><td>{item.schedules[0]&&<span>{day(item.schedules[0].dayOfWeek)} {item.schedules[0].startTime.slice(0,5)}–{item.schedules[0].endTime.slice(0,5)}<span className="admin-management-subtitle">{item.schedules[0].roomName}</span></span>}{item.schedules.length>1&&<details><summary>Còn {item.schedules.length-1} buổi / tuần</summary>{item.schedules.slice(1).map((schedule,index)=><p key={index}>{day(schedule.dayOfWeek)} {schedule.startTime.slice(0,5)}–{schedule.endTime.slice(0,5)} · {schedule.roomName}</p>)}</details>}</td><td><Badge tone={item.enrolledCount>=item.maxStudents?"warning":"info"}>{item.enrolledCount}/{item.maxStudents}</Badge></td><td><Badge status={item.status}/></td><td><div className="admin-row-actions"><Button icon="edit" onClick={()=>setEditor(item)}>Sửa</Button><Button variant="danger" onClick={()=>setDeletion(item)}>Xóa</Button></div></td></tr>)}</tbody></table></div>
  {!list.loading&&!list.data?.items.length&&<EmptyState title={filtered?"Không có lớp phù hợp":"Chưa có lớp học"} description={filtered?"Thử thay đổi hoặc xóa bộ lọc.":"Tạo lớp để phân công giáo viên và ghi danh học viên."} action={filtered?<Button onClick={()=>setParams({})}>Xóa bộ lọc</Button>:<Button variant="primary" onClick={()=>setEditor(null)}>Tạo lớp</Button>}/>}</Card>}
  {(list.data?.totalItems??0)>10&&<Pager page={page} total={list.data?.totalItems??0} loading={list.loading} onChange={value=>filter("page",String(value))}/>}
  {editor!==undefined&&<ClassEditor key={editor?.id??"new"} item={editor} close={closeEditor} saved={()=>{list.reload();notify({title:"Đã lưu lớp học"});}}/>}
  <ConfirmDialog open={Boolean(deletion)} title="Xóa lớp học" confirmLabel="Xóa lớp" onClose={()=>setDeletion(null)} onConfirm={async()=>{if(!deletion)return;await api.send("DELETE",`classes/${deletion.id}`);list.reload();notify({title:`Đã xóa lớp ${deletion.name}`});if(list.data?.items.length===1&&page>1)filter("page",String(page-1));}}><p>Xóa lớp <strong>{deletion?.name}</strong>?</p><p>Lớp có học viên ghi danh sẽ được máy chủ kiểm tra trước khi xóa.</p></ConfirmDialog>
 </div>;
}
