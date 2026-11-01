import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../Components/Ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../Components/Ui/FormField";
import { assetUrl } from "../../../services/apiClient";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, PagedResponse, PaymentResponse, ReceiptResponse, StudentResponse } from "../../../types/adminApi";
import { Feedback, Pager } from "../Components/Api/AdminUi";
import { display, money } from "../Components/Api/adminFormat";
import SearchField from "../Components/Api/SearchField";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";
function PaymentForm({studentId,saved}:{studentId:number;saved:()=>void}){
 const student=useAdminQuery<StudentResponse>(`students/${studentId}`);const api=useAdminApi();
 const [enrollmentId,setEnrollmentId]=useState("");const [method,setMethod]=useState("Cash");const [paidDate,setPaidDate]=useState("");const [note,setNote]=useState("");const [confirmed,setConfirmed]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const eligible=(student.data?.enrollments??[]).filter(e=>e.status==="Active"&&!e.paymentId);const selected=eligible.find(e=>e.id===Number(enrollmentId));
 const today=new Date();const localToday=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
 async function submit(e:FormEvent){e.preventDefault();if(!selected||!confirmed)return;setBusy(true);setError("");try{await api.send("POST","payments",{enrollmentId:selected.id,method,paidDate:paidDate||null,note:note||null});saved();}catch(e){setError(e instanceof Error?e.message:"Không lập được phiếu.");}finally{setBusy(false);}}
 return <form className="admin-api-stack" onSubmit={submit}><Feedback error={student.error||error}/>{student.loading&&<p>Đang tải ghi danh…</p>}
 <SelectField label="Lớp chưa thu học phí" required value={enrollmentId} onChange={e=>setEnrollmentId(e.target.value)} options={[{value:"",label:"Chọn lớp"},...eligible.map(e=>({value:String(e.id),label:`${e.className} · ${e.courseName}`}))]}/>
 {student.data&&eligible.length===0&&<p>Học viên không có ghi danh đang học chưa thu phí.</p>}{selected&&<dl className="admin-api-detail"><dt>Học phí gốc</dt><dd>{money(selected.tuitionFee)}</dd><dt>Giảm giá</dt><dd>{selected.discountPercent}%</dd><dt>Số tiền phải đóng</dt><dd><strong>{money(selected.finalTuitionFee)}</strong></dd></dl>}
 <SelectField label="Hình thức" value={method} onChange={e=>setMethod(e.target.value)} options={[{value:"Cash",label:"Tiền mặt"},{value:"Transfer",label:"Chuyển khoản"}]}/><InputField label="Ngày thu (để trống lấy hôm nay)" type="date" max={localToday} value={paidDate} onChange={e=>setPaidDate(e.target.value)}/><TextareaField label="Ghi chú" maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/>
 <label><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Tôi xác nhận đã nhận đủ số tiền trên.</label><Button type="submit" variant="primary" disabled={busy||!selected||!confirmed}>{busy?"Đang lập…":"Lập phiếu thu"}</Button></form>;
}
function CreatePayment({close,saved}:{close:()=>void;saved:()=>void}){
 const [search,setSearch]=useState("");const [studentId,setStudentId]=useState("");const students=useAdminQuery<PagedResponse<AdminRecord>>(`students?pageSize=100&search=${encodeURIComponent(search)}`);
 return <Modal open title="Tạo phiếu thu" onClose={close}><InputField label="Tìm học viên theo tên, mã hoặc SĐT" type="search" value={search} onChange={e=>{setSearch(e.target.value);setStudentId("");}}/><Feedback error={students.error}/>{students.loading&&<p>Đang tìm học viên…</p>}{(students.data?.totalItems??0)>100&&<p>Nhập tên hoặc mã cụ thể hơn để chọn học viên trong danh sách.</p>}<SelectField label="Học viên" value={studentId} onChange={e=>setStudentId(e.target.value)} options={[{value:"",label:"Chọn học viên"},...(students.data?.items??[]).map(s=>({value:String(s.id),label:`${s.code} · ${s.fullName}`}))]}/>{studentId&&<PaymentForm key={studentId} studentId={Number(studentId)} saved={()=>{saved();close();}}/>}</Modal>;
}
function Receipt({id,close}:{id:number;close:()=>void}){
 const {data,error,loading}=useAdminQuery<ReceiptResponse>(`payments/${id}`);
 return <Modal open title="Biên lai học phí" onClose={close} footer={<Button type="button" disabled={!data} onClick={()=>window.print()}>In biên lai</Button>}><Feedback error={error}/>{loading&&<p>Đang tải biên lai…</p>}{data&&<article className="admin-api-receipt">{assetUrl(data.center.logoUrl)&&<img className="admin-api-logo" src={assetUrl(data.center.logoUrl)} alt="Logo trung tâm"/>}<h2>{data.center.name}</h2><p>{data.center.address} · {data.center.phone}</p><h3>BIÊN LAI THU HỌC PHÍ #{data.payment.id}</h3><dl className="admin-api-detail"><dt>Học viên</dt><dd>{data.payment.studentCode} · {data.payment.studentName}</dd><dt>Lớp / Khóa</dt><dd>{data.payment.className} / {data.payment.courseName}</dd><dt>Học phí gốc</dt><dd>{money(data.payment.tuitionFee)}</dd><dt>Giảm giá</dt><dd>{data.payment.discountPercent}% · {money(data.payment.discountAmount)}</dd><dt>Đã thu</dt><dd><strong>{money(data.payment.amount)}</strong></dd><dt>Ngày / Hình thức</dt><dd>{display(data.payment.paidDate)} · {display(data.payment.method)}</dd><dt>Người lập</dt><dd>{data.createdByName}</dd><dt>Ghi chú</dt><dd>{data.note||"—"}</dd></dl></article>}</Modal>;
}
export default function PaymentsManagement(){
 const [params,setParams]=useSearchParams();const page=Math.max(1,Number(params.get("page"))||1);const [open,setOpen]=useState(params.get("action")==="create");const [receipt,setReceipt]=useState<number|null>(null);
 const {data,error,loading,reload}=useAdminQuery<PagedResponse<PaymentResponse>>(`payments?page=${page}&pageSize=10&search=${encodeURIComponent(params.get("search")??"")}`);
 return <div className="admin-api-stack"><div className="admin-api-toolbar"><span>{data?.totalItems??0} phiếu thu</span><Button variant="primary" onClick={()=>setOpen(true)}>+ Tạo phiếu thu</Button></div><form className="admin-api-filters" onSubmit={e=>e.preventDefault()}><SearchField label="Tên hoặc mã học viên" value={params.get("search")??""} onSearch={value=>setParams({search:value,page:"1"})}/><Button type="button" onClick={reload}>Tải lại</Button></form><Feedback error={error}/>
 <Card><div className="admin-api-table"><table className="admin-table"><thead><tr><th>Học viên</th><th>Lớp / Khóa</th><th>Học phí gốc</th><th>Giảm (%)</th><th>Đã thu</th><th>Ngày thu</th><th>Hình thức</th><th>Biên lai</th></tr></thead><tbody>{loading?<tr><td colSpan={8}>Đang tải…</td></tr>:!data?.items.length?<tr><td colSpan={8}>{error?"Chưa tải được danh sách.":"Chưa có phiếu thu phù hợp."}</td></tr>:data.items.map(p=><tr key={p.id}><td>{p.studentName}<br/>{p.studentCode}</td><td>{p.className}<br/>{p.courseName}</td><td>{money(p.tuitionFee)}</td><td>{p.discountPercent||"—"}</td><td>{money(p.amount)}</td><td>{display(p.paidDate)}</td><td>{display(p.method)}</td><td><Button type="button" onClick={()=>setReceipt(p.id)}>Xem / In</Button></td></tr>)}</tbody></table></div></Card><Pager page={page} total={data?.totalItems??0} onChange={p=>setParams(v=>{const n=new URLSearchParams(v);n.set("page",String(p));return n;})}/>{open&&<CreatePayment close={()=>setOpen(false)} saved={reload}/>} {receipt!==null&&<Receipt id={receipt} close={()=>setReceipt(null)}/>}</div>;
}
