import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, ClassResponse, PagedResponse } from "../../../types/adminApi";
import Button from "../Components/Ui/Button";
import Badge from "../Components/Ui/Badge";
import ConfirmDialog from "../Components/Ui/ConfirmDialog";
import EmptyState from "../Components/Ui/EmptyState";
import Notice from "../Components/Ui/Notice";
import SectionCard from "../Components/Ui/SectionCard";
import { SelectField } from "../Components/Ui/FormField";
import SearchField from "../Components/Api/SearchField";
import { display, money } from "../Components/Api/adminFormat";
import useToast from "../Components/Ui/useToast";
import "../Components/Api/AdminApi.css";
export default function ClassProfile() {
  const { id = "" } = useParams(); const location = useLocation(); const api = useAdminApi(); const { notify } = useToast();
  const detail = useAdminQuery<ClassResponse>(`classes/${id}`);
  const [search,setSearch] = useState(""); const [studentId,setStudentId] = useState(""); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  const students = useAdminQuery<PagedResponse<AdminRecord>>(`students?pageSize=100&search=${encodeURIComponent(search)}`);
  const [withdrawal,setWithdrawal] = useState<AdminRecord|null>(null);
  const data = detail.data; const roster = data?.students ?? [];
  const eligible = (students.data?.items ?? []).filter(student => student.status !== "Dropped" && !roster.some(row => Number(row.studentId) === student.id));
  const full = Boolean(data && data.enrolledCount >= data.maxStudents); const finished = data?.status === "Finished";
  const returnTo = typeof location.state?.returnTo === "string" && location.state.returnTo.startsWith("/admin/classes") ? location.state.returnTo : "/admin/classes";
  async function enroll() {
    if(!studentId||busy||full||finished||students.loading||students.error)return;
    setBusy(true);setError("");
    try{await api.send("POST",`classes/${id}/students`,{studentId:Number(studentId)});setStudentId("");detail.reload();notify({title:"Đã thêm học viên vào lớp"});}
    catch(reason){setError(reason instanceof Error?reason.message:"Không thêm được học viên.");}
    finally{setBusy(false);}
  }
  return <div className="admin-api-stack">
    <div className="admin-management-toolbar"><Button to={returnTo} variant="ghost">← Danh sách lớp học</Button>{data&&<Button icon="edit" to={`/admin/classes?edit=${id}`}>Sửa lớp</Button>}</div>
    {detail.error?<Notice tone="error" action={<Button onClick={detail.reload}>Thử lại</Button>}>{detail.error}</Notice>:detail.loading?<p role="status">Đang tải thông tin lớp…</p>:data&&<>
      <SectionCard title={data.name} action={<Badge status={data.status}/>}>
        <dl className="admin-management-fields"><div><dt>Khóa học</dt><dd>{data.courseName}</dd></div><div><dt>Giáo viên</dt><dd><Link className="admin-management-name" to={`/admin/teachers/${data.teacherId}`}>{data.teacherName}</Link></dd></div><div><dt>Thời gian</dt><dd>{display(data.startDate)} – {display(data.endDate)}</dd></div><div><dt>Sĩ số đang học</dt><dd><Badge tone={full?"warning":"info"}>{data.enrolledCount}/{data.maxStudents} học viên</Badge></dd></div></dl>
        {data.meetingUrl&&/^https?:\/\//i.test(data.meetingUrl)&&<a className="admin-management-name" href={data.meetingUrl} target="_blank" rel="noreferrer">Mở phòng học trực tuyến ↗</a>}
        <div><h3>Lịch học mỗi tuần</h3>{data.schedules.map((schedule,index)=><p key={index}>{schedule.dayOfWeek===7?"Chủ nhật":`Thứ ${schedule.dayOfWeek+1}`} · {schedule.startTime.slice(0,5)}–{schedule.endTime.slice(0,5)} · {schedule.roomName??"Chưa có phòng"}</p>)}</div>
      </SectionCard>
      <SectionCard title={`Học viên của lớp (${roster.length})`}>
        {error&&<Notice tone="error">{error}</Notice>}
        {full||finished?<Notice tone="info">{finished?"Lớp đã kết thúc.":"Lớp đã đủ sĩ số."} Hiện không thể thêm học viên.</Notice>:<>
          <SearchField label="Tìm học viên để thêm vào lớp" placeholder="Nhập tên, mã hoặc số điện thoại…" value={search} onSearch={value=>{setSearch(value);setStudentId("");}}/>
          {students.error&&<Notice tone="error" action={<Button onClick={students.reload}>Thử lại</Button>}>{students.error}</Notice>}
          <div className="admin-api-filters"><SelectField label="Học viên chưa ghi danh lớp này" disabled={busy||students.loading||Boolean(students.error)} value={studentId} onChange={event=>setStudentId(event.target.value)} options={[{value:"",label:students.loading?"Đang tải học viên…":"Chọn học viên"},...eligible.map(student=>({value:String(student.id),label:`${student.code} · ${student.fullName}`}))]}/><Button variant="primary" icon="plus" loading={busy} disabled={!studentId||students.loading||Boolean(students.error)||!eligible.some(student=>student.id===Number(studentId))} onClick={enroll}>Thêm vào lớp</Button></div>
          {!students.loading&&!students.error&&!eligible.length&&<p className="admin-api-muted">Không có học viên phù hợp; thử từ khóa khác.</p>}{(students.data?.totalItems??0)>100&&<p className="admin-api-muted">Đang tìm trong100 kết quả đầu tiên. Nhập tên hoặc mã cụ thể hơn.</p>}
        </>}
        {!roster.length?<EmptyState title="Lớp chưa có học viên" description="Thêm học viên bằng bộ chọn phía trên." icon="students"/>:<div className="admin-api-table"><table className="admin-table"><thead><tr><th>Học viên</th><th>Trạng thái</th><th>Học phí ghi danh</th><th>Thao tác</th></tr></thead><tbody>{roster.map(student=><tr key={String(student.enrollmentId)}><td><Link className="admin-management-name" to={`/admin/students/${student.studentId}`}>{display(student.fullName)}</Link><span className="admin-management-subtitle">{display(student.code)}</span></td><td><Badge status={String(student.status)}/></td><td>{money(student.finalTuitionFee)}</td><td>{student.status==="Active"&&<Button variant="ghost" onClick={()=>setWithdrawal(student)}>Rút khỏi lớp</Button>}</td></tr>)}</tbody></table></div>}
      </SectionCard>
    </>}
    <ConfirmDialog open={Boolean(withdrawal)} title="Rút học viên khỏi lớp" confirmLabel="Rút khỏi lớp" onClose={()=>setWithdrawal(null)} onConfirm={async()=>{if(!withdrawal)return;await api.send("DELETE",`classes/${id}/students/${withdrawal.enrollmentId}`);detail.reload();notify({title:"Đã rút học viên khỏi lớp"});}}><p>Rút <strong>{withdrawal?display(withdrawal.fullName):""}</strong> khỏi lớp <strong>{data?.name}</strong>?</p><p>Phiếu thu đã có được giữ lại.</p></ConfirmDialog>
  </div>;
}
