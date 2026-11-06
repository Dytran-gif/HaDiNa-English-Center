import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../Components/Ui/Button";
import Modal from "../Components/Ui/Modal";
import Badge from "../Components/Ui/Badge";
import EmptyState from "../Components/Ui/EmptyState";
import Notice from "../Components/Ui/Notice";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import { InputField, SelectField, TextareaField } from "../Components/Ui/FormField";
import useToast from "../Components/Ui/useToast";
import { assetUrl } from "../../../services/apiClient";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, PagedResponse, PaymentResponse, ReceiptResponse, StudentResponse } from "../../../types/adminApi";
import { Pager } from "../Components/Api/AdminUi";
import { display, money } from "../Components/Api/adminFormat";
import SearchField from "../Components/Api/SearchField";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";

function PaymentForm({studentId,busy,onBusyChange,saved}:{studentId:number;busy:boolean;onBusyChange:(value:boolean)=>void;saved:()=>void}){
 const student=useAdminQuery<StudentResponse>(`students/${studentId}`);const api=useAdminApi();
 const [enrollmentId,setEnrollmentId]=useState("");const [method,setMethod]=useState("Cash");const [paidDate,setPaidDate]=useState("");const [note,setNote]=useState("");const [confirmed,setConfirmed]=useState(false);const [error,setError]=useState("");
 const eligible=(student.data?.enrollments??[]).filter(item=>item.status==="Active"&&!item.paymentId);const selected=eligible.find(item=>item.id===Number(enrollmentId));
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 async function submit(event:FormEvent){event.preventDefault();if(!selected||!confirmed||busy||student.loading||student.error)return;onBusyChange(true);setError("");try{await api.send("POST","payments",{enrollmentId:selected.id,method,paidDate:paidDate||null,note:note||null});saved();}catch(reason){setError(reason instanceof Error?reason.message:"Không lập được phiếu.");}finally{onBusyChange(false);}}
 return <form className="admin-api-stack" onSubmit={submit}>
  {error&&<Notice tone="error">{error}</Notice>}{student.error&&<Notice tone="error" action={<Button onClick={student.reload}>Thử lại ghi danh</Button>}>{student.error}</Notice>}{student.loading&&<p role="status">Đang tải các lớp chưa thu học phí…</p>}
  <fieldset className="admin-api-fieldset admin-api-stack" disabled={busy||student.loading||Boolean(student.error)}>
   <SelectField label="Lớp chưa thu học phí" required value={enrollmentId} onChange={event=>{setEnrollmentId(event.target.value);setConfirmed(false);}} options={[{value:"",label:"Chọn lớp ghi danh"},...eligible.map(item=>({value:String(item.id),label:`${item.className} · ${item.courseName}`}))]}/>
   {student.data&&!eligible.length&&<Notice tone="info">Học viên không có ghi danh đang học chưa thu học phí.</Notice>}
   {selected&&<div className="admin-api-schedule"><dl className="admin-management-fields"><div><dt>Học phí ghi danh</dt><dd>{money(selected.tuitionFee)}</dd></div><div><dt>Giảm giá</dt><dd>{selected.discountPercent}%</dd></div><div><dt>Số tiền phải thu</dt><dd><strong className="admin-course-price">{money(selected.finalTuitionFee)}</strong></dd></div></dl><p className="admin-api-muted">Số tiền lấy từ giá đã lưu lúc ghi danh; không sửa trực tiếp tại phiếu thu.</p></div>}
   <SelectField label="Hình thức thanh toán" value={method} onChange={event=>setMethod(event.target.value)} options={[{value:"Cash",label:"Tiền mặt"},{value:"Transfer",label:"Chuyển khoản"}]}/>
   <InputField label="Ngày thu" type="date" max={today} help="Để trống để lấy hôm nay theo giờ Việt Nam." value={paidDate} onChange={event=>setPaidDate(event.target.value)}/>
   <TextareaField label="Ghi chú" placeholder="Nội dung thanh toán hoặc thông tin cần đối soát…" maxLength={500} value={note} onChange={event=>setNote(event.target.value)}/>
   <label><input type="checkbox" required checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/> Tôi xác nhận đã nhận đủ {selected?money(selected.finalTuitionFee):"học phí"}.</label>
   <Button type="submit" variant="primary" loading={busy} disabled={!selected||!confirmed||student.loading||Boolean(student.error)}>Lập phiếu thu</Button>
  </fieldset>
 </form>;
}
function CreatePayment({close,saved}:{close:()=>void;saved:()=>void}){
 const [search,setSearch]=useState("");const [studentId,setStudentId]=useState("");const [busy,setBusy]=useState(false);
 const students=useAdminQuery<PagedResponse<AdminRecord>>(`students?pageSize=100&search=${encodeURIComponent(search)}`);
 return <Modal open busy={busy} title="Tạo phiếu thu" onClose={close} footer={<Button disabled={busy} onClick={close}>Đóng</Button>}>
  <div className="admin-api-stack"><SearchField label="Tìm học viên" placeholder="Nhập tên, mã hoặc số điện thoại…" disabled={busy} value={search} onSearch={value=>{setSearch(value);setStudentId("");}}/>
   {students.error&&<Notice tone="error" action={<Button onClick={students.reload}>Thử lại</Button>}>{students.error}</Notice>}
   {(students.data?.totalItems??0)>100&&<p className="admin-api-muted">Nhập tên hoặc mã cụ thể hơn để chọn trong100 kết quả đầu tiên.</p>}
   <SelectField label="Học viên lập phiếu" disabled={busy||students.loading||Boolean(students.error)} value={studentId} onChange={event=>setStudentId(event.target.value)} options={[{value:"",label:students.loading?"Đang tìm học viên…":"Chọn học viên"},...(students.data?.items??[]).map(item=>({value:String(item.id),label:`${item.code} · ${item.fullName}`}))]}/>
   {studentId&&<PaymentForm key={studentId} studentId={Number(studentId)} busy={busy} onBusyChange={setBusy} saved={()=>{saved();close();}}/>}
  </div>
 </Modal>;
}
function Receipt({id,close}:{id:number;close:()=>void}){
 const query=useAdminQuery<ReceiptResponse>(`payments/${id}`);const data=query.data;
 return <Modal open title="Biên lai học phí" className="admin-receipt-dialog" onClose={close} footer={<><Button onClick={close}>Đóng</Button><Button variant="primary" disabled={!data||query.loading||Boolean(query.error)} onClick={()=>window.print()}>In biên lai</Button></>}>
  {query.error&&<Notice tone="error" action={<Button onClick={query.reload}>Thử lại</Button>}>{query.error}</Notice>}{query.loading&&<p role="status">Đang tải biên lai…</p>}
  {data&&<article className="admin-api-receipt">{assetUrl(data.center.logoUrl)&&<img className="admin-api-logo" src={assetUrl(data.center.logoUrl)} alt="Logo trung tâm"/>}<h2>{data.center.name}</h2><p>{data.center.address} · {data.center.phone}</p><h3>BIÊN LAI THU HỌC PHÍ #{data.payment.id}</h3>
   <dl className="admin-management-fields"><div><dt>Học viên</dt><dd>{data.payment.studentCode} · {data.payment.studentName}</dd></div><div><dt>Lớp / Khóa</dt><dd>{data.payment.className} / {data.payment.courseName}</dd></div><div><dt>Học phí ghi danh</dt><dd>{money(data.payment.tuitionFee)}</dd></div><div><dt>Giảm giá</dt><dd>{data.payment.discountPercent}% · {money(data.payment.discountAmount)}</dd></div><div><dt>Đã thu</dt><dd><strong>{money(data.payment.amount)}</strong></dd></div><div><dt>Ngày / Hình thức</dt><dd>{display(data.payment.paidDate)} · {display(data.payment.method)}</dd></div><div><dt>Người lập</dt><dd>{data.createdByName}</dd></div><div><dt>Ghi chú</dt><dd>{data.note||"—"}</dd></div></dl>
  </article>}
 </Modal>;
}
export default function PaymentsManagement(){
 const [params,setParams]=useSearchParams();const {notify}=useToast();const rawPage=Number(params.get("page"));const page=Number.isSafeInteger(rawPage)&&rawPage>0?rawPage:1;
 const from=params.get("from")??"",to=params.get("to")??"",method=params.get("method")??"";const clientFilter=Boolean(from||to||method);const invalidRange=Boolean(from&&to&&from>to);
 const query=useAdminQuery<PagedResponse<PaymentResponse>>(`payments?page=${clientFilter?1:page}&pageSize=${clientFilter?100:10}&search=${encodeURIComponent(params.get("search")??"")}`,clientFilter);
 const matching=(query.data?.items??[]).filter(item=>(!from||item.paidDate>=from)&&(!to||item.paidDate<=to)&&(!method||item.method===method));
 const total=clientFilter?matching.length:query.data?.totalItems??0;const rows=clientFilter?matching.slice((page-1)*10,page*10):matching;
 const [open,setOpen]=useState(params.get("action")==="create");const [receipt,setReceipt]=useState<number|null>(null);
 useEffect(()=>{if(query.loading||query.error||!query.data)return;const last=Math.max(1,Math.ceil(total/10));if(page>last)setParams(previous=>{const next=new URLSearchParams(previous);next.set("page",String(last));return next;},{replace:true});},[query.loading,query.error,query.data,total,page,setParams]);
 function filter(key:string,value:string){setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);next.set("page","1");return next;});}
 function closeCreate(){setOpen(false);setParams(previous=>{const next=new URLSearchParams(previous);next.delete("action");return next;},{replace:true});}
 const filtered=Boolean(clientFilter||params.get("search"));
 return <div className="admin-api-stack">
  <div className="admin-api-toolbar"><span role="status">{query.loading?"Đang tải phiếu thu…":query.error?"Chưa tải được danh sách":invalidRange?"Khoảng ngày chưa hợp lệ":`${total} phiếu thu`}</span><Button variant="primary" icon="plus" onClick={()=>setOpen(true)}>Tạo phiếu thu</Button></div>
  <div className="admin-api-filters"><SearchField label="Tên hoặc mã học viên" placeholder="Tìm học viên đã thu học phí…" value={params.get("search")??""} onSearch={value=>filter("search",value)}/><InputField label="Từ ngày thu" type="date" max={to||undefined} value={from} error={invalidRange?"Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.":undefined} onChange={event=>filter("from",event.target.value)}/><InputField label="Đến ngày thu" type="date" min={from||undefined} value={to} onChange={event=>filter("to",event.target.value)}/><SelectField label="Hình thức" value={method} onChange={event=>filter("method",event.target.value)} options={[{value:"",label:"Tất cả"},{value:"Cash",label:"Tiền mặt"},{value:"Transfer",label:"Chuyển khoản"}]}/>{filtered&&<Button variant="ghost" onClick={()=>setParams({})}>Xóa bộ lọc</Button>}<Button icon="refresh" loading={query.loading} onClick={query.reload}>Tải lại</Button></div>
  {query.error?<Notice tone="error" action={<Button onClick={query.reload}>Thử lại</Button>}>{query.error}</Notice>:!invalidRange&&<Card><div className="admin-api-table" role="region" aria-label="Danh sách phiếu thu" tabIndex={0}><table className="admin-table" aria-busy={query.loading}><thead><tr><th>Học viên</th><th>Lớp / Khóa</th><th>Đã thu</th><th>Ngày / Hình thức</th><th>Biên lai</th></tr></thead><tbody>{query.loading?<TableSkeleton columns={5}/>:rows.map(item=><tr key={item.id}><td><strong>{item.studentName}</strong><span className="admin-management-subtitle">{item.studentCode}</span></td><td>{item.className}<span className="admin-management-subtitle">{item.courseName}</span></td><td><strong>{money(item.amount)}</strong>{item.discountPercent>0&&<span className="admin-management-subtitle">Đã giảm {item.discountPercent}%</span>}</td><td>{display(item.paidDate)}<span className="admin-management-subtitle"><Badge tone="neutral">{display(item.method)}</Badge></span></td><td><Button icon="eye" onClick={()=>setReceipt(item.id)}>Xem / In</Button></td></tr>)}</tbody></table></div>
   {!query.loading&&!rows.length&&<EmptyState title={filtered?"Không có phiếu thu phù hợp":"Chưa có phiếu thu"} description={filtered?"Thử thay đổi khoảng ngày, hình thức hoặc từ khóa tìm kiếm.":"Lập phiếu sau khi đã nhận đủ học phí của học viên."} action={filtered?<Button onClick={()=>setParams({})}>Xóa bộ lọc</Button>:<Button variant="primary" onClick={()=>setOpen(true)}>Tạo phiếu thu</Button>}/>}
  </Card>}
  {!invalidRange&&total>10&&<Pager page={page} total={total} loading={query.loading} onChange={value=>setParams(previous=>{const next=new URLSearchParams(previous);next.set("page",String(value));return next;})}/>}
  {open&&<CreatePayment close={closeCreate} saved={()=>{query.reload();notify({title:"Đã lập phiếu thu",description:"Bạn có thể mở biên lai từ danh sách để xem và in."});}}/>}{receipt!==null&&<Receipt id={receipt} close={()=>setReceipt(null)}/>}
 </div>;
}
