import { useEffect, useRef, useState } from "react";
import { useAdminApi } from "../../../../services/admin/useAdminApi";
import { notifyTeachersChanged } from "../../../../services/usePublicTeachers";
import AdminAvatar from "../Ui/AdminAvatar";
import { assetUrl } from "../../../../services/apiClient";
import Button from "../Ui/Button";
import Dialog from "../Ui/Dialog";
import Notice from "../Ui/Notice";
import useToast from "../Ui/useToast";

export default function TeacherPhoto({ id, name, initialUrl, onChanged }: { id: number; name: string; initialUrl?: string | null; onChanged?: () => void }) {
  const api = useAdminApi(); const { notify } = useToast();
  const [url, setUrl] = useState(initialUrl); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialUrl === undefined);
  const [options, setOptions] = useState(false);
  const [view, setView] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const src = assetUrl(url);
  useEffect(() => {
    if (initialUrl !== undefined) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    api.get<{ avatarUrl: string | null }>(`teachers/${id}`, controller.signal)
      .then(value => { if (!controller.signal.aborted) setUrl(value.avatarUrl); })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Không tải được ảnh hiện tại."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, id, initialUrl]);
  async function upload(file?: File) {
    if (!file || busy) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) { setError("Chọn ảnh JPG, PNG hoặc WebP không quá 5 MB."); return; }
    setBusy(true);
    try {
      const preview = URL.createObjectURL(file);
      try { await new Promise<void>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(); image.onerror = () => reject(new Error("Không đọc được ảnh.")); image.src = preview; }); }
      finally { URL.revokeObjectURL(preview); }
      const body = new FormData(); body.append("file", file);
      const result = await api.upload<{ avatarUrl: string }>(`teachers/${id}/avatar`, body);
      setUrl(result.avatarUrl); notifyTeachersChanged(); onChanged?.(); notify({ title: "Đã cập nhật ảnh giáo viên và website." });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được ảnh."); }
    finally { setBusy(false); }
  }
  return <div className="admin-teacher-photo">
    <button type="button" className="admin-avatar-trigger" disabled={busy || loading} aria-label={`Tùy chọn ảnh ${name}`} aria-haspopup="dialog" onClick={() => setOptions(true)}><AdminAvatar className="admin-teacher-avatar" name={name} url={url}/></button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy || loading} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void upload(file); }}/>
    <Dialog className="admin-avatar-options" open={options} title="Ảnh giáo viên" onClose={() => setOptions(false)}>
      <div className="admin-avatar-options-list">
        <Button icon="eye" disabled={!src} onClick={() => { setOptions(false); setView(true); }}>Xem ảnh</Button>
        <Button icon="edit" onClick={() => { setOptions(false); input.current?.click(); }}>Đổi ảnh</Button>
      </div>
      <p className="admin-avatar-help">{!src ? "Giáo viên chưa có ảnh. " : ""}JPG, PNG, WebP tối đa 5 MB.</p>
    </Dialog>
    <Dialog open={view} title={`Ảnh ${name}`} onClose={() => setView(false)}>{src && <img className="admin-avatar-full" src={src} alt={`Ảnh giáo viên ${name}`}/>}</Dialog>
    {busy && <p role="status">Đang tải ảnh…</p>}{error && <Notice tone="error">{error}</Notice>}
  </div>;
}
