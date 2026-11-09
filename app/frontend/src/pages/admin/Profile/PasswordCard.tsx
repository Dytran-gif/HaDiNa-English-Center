import { useState, type FormEvent } from "react";
import Button from "../Components/Ui/Button";
import { InputField } from "../Components/Ui/FormField";
import SectionCard from "../Components/Ui/SectionCard";
import { useAuth } from "../../../context/AuthContext";
import { useAdminApi } from "../../../services/admin/useAdminApi";
import { Feedback } from "../Components/Api/AdminUi";
export default function PasswordCard() {
  const api = useAdminApi();
  const { token, replaceToken, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const mismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;
  const samePassword = form.newPassword.length > 0 && form.newPassword === form.currentPassword;
  const ready = Boolean(token && form.currentPassword && form.newPassword.length >= 8 && form.confirmPassword === form.newPassword && !samePassword);

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!ready || busy) return;
    setBusy(true);
    try {
      const result = await api.send<{ token: string; message: string }>("POST", "settings/change-password", form);
      replaceToken(result.token);
      setMessage(result.message);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không đổi được mật khẩu.");
    } finally { setBusy(false); }
  }

return (    <SectionCard title="Đổi mật khẩu">
      <form className="admin-panel-form" onSubmit={changePassword}>
        <Feedback error={error} message={message}/>
        <InputField label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại" type="password" autoComplete="current-password" required value={form.currentPassword} disabled={!token || busy} onChange={event => setForm({ ...form, currentPassword: event.target.value })}/>
        <InputField label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} help="Tối thiểu 8 ký tự, khác mật khẩu cũ" error={samePassword ? "Mật khẩu mới phải khác mật khẩu hiện tại." : undefined} value={form.newPassword} disabled={!token || busy} onChange={event => setForm({ ...form, newPassword: event.target.value })}/>
        <InputField label="Nhập lại mật khẩu mới" placeholder="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" required minLength={8} error={mismatch ? "Nhập lại mật khẩu không khớp." : undefined} value={form.confirmPassword} disabled={!token || busy} onChange={event => setForm({ ...form, confirmPassword: event.target.value })}/>
        <div className="admin-panel-submit"><Button type="button" variant="ghost" disabled={busy} onClick={logout}>{"Đăng xuất"}</Button><Button type="submit" loading={busy} disabled={!ready} variant="primary">Đổi mật khẩu</Button></div>
      </form>
    </SectionCard>);
}
