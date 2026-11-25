import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import { ApiError } from "../../../services/apiClient";
import SectionCard from "../Components/Ui/SectionCard";
import Badge from "../Components/Ui/Badge";
import Button from "../Components/Ui/Button";
import Notice from "../Components/Ui/Notice";
import { InputField } from "../Components/Ui/FormField";
import useToast from "../Components/Ui/useToast";
import PasswordCard from "./PasswordCard";
import AdminAvatarControl from "../Components/Ui/AdminAvatarControl";
import type { AdminProfile } from "./profileTypes";
import "./Profile.css";

function PersonalInfo({ initial }: { initial: AdminProfile }) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState({ fullName: initial.fullName ?? "", phone: initial.phone ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const { updateProfile } = useAuth();
  const api = useAdminApi();
  const { notify } = useToast();
  const dirty = form.fullName.trim() !== (saved.fullName ?? "") || form.phone.trim() !== (saved.phone ?? "");
  const name = saved.fullName || "Quản trị viên";
  const fieldError = (key: string) => fields[key]?.join(" ") ?? fields[key.charAt(0).toUpperCase() + key.slice(1)]?.join(" ");
  useEffect(() => { updateProfile(initial.userId, initial); }, [initial, updateProfile]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !dirty) return;
    setError(""); setFields({});
    if (!form.fullName.trim()) { setError("Vui lòng nhập họ và tên."); return; }
    setBusy(true);
    try {
      const result = await api.send<AdminProfile>("PUT", "profile", { fullName: form.fullName.trim(), phone: form.phone.trim() || null });
      setSaved(result); setForm({ fullName: result.fullName ?? "", phone: result.phone ?? "" });
      updateProfile(result.userId, result);
      notify({ title: "Đã lưu thông tin cá nhân.", tone: "success" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không lưu được hồ sơ.");
      if (reason instanceof ApiError) setFields(reason.fieldErrors);
    } finally { setBusy(false); }
  }

  return <>
    <div className="admin-personal-identity"><AdminAvatarControl className="admin-personal-avatar"/><div><h2>{name}</h2><Badge tone="info">Quản trị viên</Badge></div></div>
    <form className="admin-panel-form" onSubmit={save} aria-busy={busy}>
      {error && <Notice tone="error">{error}</Notice>}
      <InputField label="Họ và tên" autoComplete="name" placeholder="Nhập họ và tên của bạn" required maxLength={150} disabled={busy} value={form.fullName} error={fieldError("fullName")} onChange={event => setForm({ ...form, fullName: event.target.value })}/>
      <InputField label="Email đăng nhập" type="email" value={saved.email} readOnly help="Email đăng nhập không thay đổi trong form hồ sơ."/>
      <InputField label="Số điện thoại" type="tel" autoComplete="tel" placeholder="Nhập số điện thoại" maxLength={20} disabled={busy} value={form.phone} error={fieldError("phone")} onChange={event => setForm({ ...form, phone: event.target.value })}/>
      <p className="admin-personal-hint">Vai trò: Quản trị viên (Admin). Thông tin được lưu theo tài khoản đang đăng nhập.</p>
      <div className="admin-panel-submit"><Button disabled={busy || !dirty} onClick={() => { setForm({ fullName: saved.fullName ?? "", phone: saved.phone ?? "" }); setError(""); setFields({}); }}>Hủy thay đổi</Button><Button type="submit" variant="primary" icon="check" disabled={!dirty} loading={busy}>Lưu thông tin</Button></div>
    </form>
  </>;
}

export default function Profile() {
  const profile = useAdminQuery<AdminProfile>("profile");
  return <div className="admin-settings-panels admin-personal-profile">
    <SectionCard title="Thông tin cá nhân">
      {profile.loading ? <p role="status">Đang tải hồ sơ…</p> : profile.error ? <Notice tone="error" action={<Button onClick={profile.reload}>Thử lại</Button>}>{profile.error}</Notice> : profile.data && <PersonalInfo key={profile.data.userId} initial={profile.data}/>}
    </SectionCard>
    <PasswordCard/>
  </div>;
}
