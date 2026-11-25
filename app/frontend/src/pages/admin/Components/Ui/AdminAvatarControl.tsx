import { useRef, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useAdminApi } from "../../../../services/admin/useAdminApi";
import { assetUrl } from "../../../../services/apiClient";
import type { AdminProfile } from "../../Profile/profileTypes";
import AdminAvatar from "./AdminAvatar";
import Button from "./Button";
import Dialog from "./Dialog";
import Notice from "./Notice";
import useToast from "./useToast";

export default function AdminAvatarControl({ className }: { className: string }) {
  const { user, updateProfile } = useAuth();
  const api = useAdminApi();
  const { notify } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState(false);
  const [view, setView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const name = user?.full_name || user?.email || "Quản trị viên";
  const src = assetUrl(user?.avatar_url);

  async function upload(file?: File) {
    if (!file || busy) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
      setError("Chọn ảnh JPG, PNG hoặc WebP không quá 5 MB."); setOptions(true); return;
    }
    setBusy(true);
    try {
      const url = URL.createObjectURL(file);
      try { await new Promise<void>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(); image.onerror = () => reject(new Error("Không đọc được ảnh.")); image.src = url; }); }
      finally { URL.revokeObjectURL(url); }
      const body = new FormData(); body.append("file", file);
      const result = await api.upload<AdminProfile>("profile/avatar", body);
      updateProfile(result.userId, result);
      notify({ title: "Đã cập nhật ảnh đại diện.", tone: "success" });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được ảnh."); setOptions(true); }
    finally { setBusy(false); }
  }

  return <>
    <button className="admin-avatar-trigger" type="button" aria-label="Tùy chọn ảnh đại diện" aria-haspopup="dialog" disabled={busy} aria-busy={busy} onClick={() => { setError(""); setOptions(true); }}><AdminAvatar className={className} url={user?.avatar_url} name={name}/></button>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void upload(file); }}/>
    {busy && <span className="admin-sr-only" role="status">Đang tải ảnh đại diện…</span>}
    <Dialog className="admin-avatar-options" open={options} title="Ảnh đại diện" onClose={() => setOptions(false)}>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="admin-avatar-options-list">
        <Button icon="eye" disabled={!src || busy} onClick={() => { setOptions(false); setView(true); }}>Xem ảnh</Button>
        <Button icon="edit" disabled={busy} onClick={() => { setOptions(false); fileInput.current?.click(); }}>Đổi ảnh</Button>
      </div>
      <p className="admin-avatar-help">{!src ? "Bạn chưa có ảnh đại diện. " : ""}JPG, PNG, WebP tối đa 5 MB.</p>
    </Dialog>
    <Dialog open={view} title="Xem ảnh đại diện" onClose={() => setView(false)}>{src && <img className="admin-avatar-full" src={src} alt={`Ảnh đại diện ${name}`}/>}</Dialog>
  </>;
}
