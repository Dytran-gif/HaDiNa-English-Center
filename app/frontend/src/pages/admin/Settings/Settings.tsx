import { useState, type FormEvent } from "react";
import Button from "../Components/Ui/Button";
import { InputField } from "../Components/Ui/FormField";
import Notice from "../Components/Ui/Notice";
import SectionCard from "../Components/Ui/SectionCard";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl } from "../../../services/apiClient";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { CenterResponse } from "../../../types/adminApi";
import PasswordCard from "../Profile/PasswordCard";
import { Feedback } from "../Components/Api/AdminUi";

function CenterForm({ center, enabled }: { center: CenterResponse; enabled: boolean }) {
  const api = useAdminApi();
  const [form, setForm] = useState(center);
  const [saved, setSaved] = useState(center);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dirty = form.name !== saved.name || (form.address ?? "") !== (saved.address ?? "") || (form.phone ?? "") !== (saved.phone ?? "");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!enabled || !dirty || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const value = await api.send<CenterResponse>("PUT", "settings/center", { name: form.name, address: form.address, phone: form.phone });
      setForm(value); setSaved(value); setMessage("Đã lưu thông tin trung tâm.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không lưu được thông tin.");
    } finally { setBusy(false); }
  }

  return <form className="admin-panel-form" onSubmit={save}>
    <Feedback error={error} message={message}/>
    {assetUrl(form.logoUrl) && <img className="admin-api-logo" src={assetUrl(form.logoUrl)} alt="Logo trung tâm"/>}
    <InputField label="Tên trung tâm" placeholder="Nhập tên trung tâm" required maxLength={150} value={form.name} disabled={!enabled || busy} onChange={event => setForm({ ...form, name: event.target.value })}/>
    <InputField label="Địa chỉ" placeholder="Nhập địa chỉ trung tâm" maxLength={300} value={form.address ?? ""} disabled={!enabled || busy} onChange={event => setForm({ ...form, address: event.target.value })}/>
    <InputField label="Số điện thoại" placeholder="Nhập số điện thoại liên hệ" type="tel" maxLength={20} value={form.phone ?? ""} disabled={!enabled || busy} onChange={event => setForm({ ...form, phone: event.target.value })}/>
    <p className="admin-api-muted">Logo hiện tại chỉ để xem. Chức năng tải logo lên sẽ được bổ sung sau.</p>
    <div className="admin-panel-submit"><Button type="submit" variant="primary" loading={busy} disabled={!enabled || !dirty}>Lưu thông tin</Button></div>
  </form>;
}

export default function Settings() {
  const center = useAdminQuery<CenterResponse>("settings/center");
  const { token } = useAuth();
  return <div className="admin-settings-panels">
    <SectionCard title="Thông tin trung tâm">
      {token && center.loading && <p className="admin-api-muted" role="status">Đang tải thông tin trung tâm…</p>}
      {token && center.error && <div className="admin-panel-feedback"><Notice tone="error" title="Không tải được thông tin trung tâm" action={<Button onClick={center.reload} icon="refresh" loading={center.loading}>Thử lại</Button>}>{center.error}</Notice></div>}
      <fieldset className="admin-panel-fieldset" disabled={!center.data || center.loading || !token}>
        <CenterForm key={center.data ? "loaded" : "empty"} enabled={Boolean(token && center.data && !center.loading)} center={center.data ?? { name: "", logoUrl: null, address: null, phone: null }}/>
      </fieldset>
    </SectionCard>
    <PasswordCard/>
  </div>;
}
