import { useState, type FormEvent } from "react";
import Button from "../Components/Ui/Button";
import Card from "../../../components/ui/Card";
import { InputField } from "../Components/Ui/FormField";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl } from "../../../services/apiClient";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { CenterResponse } from "../../../types/adminApi";
import { Feedback } from "../Components/Api/AdminUi";
import "../Components/Api/AdminApi.css";
function CenterForm({ center }: { center: CenterResponse }) {
  const api = useAdminApi(); const [form,setForm] = useState(center); const [busy,setBusy] = useState(false);
  const [error,setError] = useState(""); const [message,setMessage] = useState("");
  async function save(e:FormEvent) { e.preventDefault(); setBusy(true);setError("");setMessage("");
    try { const value=await api.send<CenterResponse>("PUT","settings/center",{name:form.name,address:form.address,phone:form.phone});setForm(value);setMessage("Đã lưu thông tin trung tâm."); }
    catch(e){setError(e instanceof Error?e.message:"Không lưu được thông tin.");} finally{setBusy(false);}
  }
  return <form className="admin-api-stack" onSubmit={save}><Feedback error={error} message={message}/>
    {assetUrl(form.logoUrl) && <img className="admin-api-logo" src={assetUrl(form.logoUrl)} alt="Logo trung tâm"/>}
    <InputField label="Tên trung tâm" required maxLength={150} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
    <InputField label="Địa chỉ" maxLength={300} value={form.address??""} onChange={e=>setForm({...form,address:e.target.value})}/>
    <InputField label="Số điện thoại" type="tel" maxLength={20} value={form.phone??""} onChange={e=>setForm({...form,phone:e.target.value})}/>
    <p className="admin-api-muted">Logo hiện tại chỉ để xem. Chức năng tải logo lên sẽ được bổ sung sau.</p>
    <Button type="submit" variant="primary" disabled={busy}>{busy?"Đang lưu…":"Lưu thông tin"}</Button></form>;
}
export default function Settings() {
  const center=useAdminQuery<CenterResponse>("settings/center"); const api=useAdminApi(); const {replaceToken}=useAuth();
  const [form,setForm]=useState({currentPassword:"",newPassword:"",confirmPassword:""}); const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  async function changePassword(e:FormEvent){e.preventDefault();setError("");setMessage("");if(form.newPassword!==form.confirmPassword){setError("Nhập lại mật khẩu không khớp.");return;}if(form.newPassword===form.currentPassword){setError("Mật khẩu mới phải khác mật khẩu hiện tại.");return;}setBusy(true);
    try {const result=await api.send<{token:string;message:string}>("POST","settings/change-password",form);replaceToken(result.token);setMessage(result.message);setForm({currentPassword:"",newPassword:"",confirmPassword:""});}catch(e){setError(e instanceof Error?e.message:"Không đổi được mật khẩu.");}finally{setBusy(false);}}
  return <div className="admin-api-grid"><Card><h2>Thông tin trung tâm</h2>{center.loading&&<p>Đang tải…</p>}<Feedback error={center.error}/>{center.error&&<Button type="button" onClick={center.reload}>Thử lại</Button>}<fieldset className="admin-api-fieldset" disabled={!center.data||center.loading}><CenterForm key={center.data ? "loaded" : "empty"} center={center.data??{name:"",logoUrl:null,address:null,phone:null}}/></fieldset></Card>
    <Card><h2>Đổi mật khẩu</h2><form className="admin-api-stack" onSubmit={changePassword}><Feedback error={error} message={message}/>
      <InputField label="Mật khẩu hiện tại" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/>
      <InputField label="Mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/>
      <InputField label="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/>
      <Button type="submit" disabled={busy} variant="primary">{busy?"Đang đổi…":"Đổi mật khẩu"}</Button></form></Card></div>;
}
