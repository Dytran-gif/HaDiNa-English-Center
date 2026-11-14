import { useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl } from "../../../services/apiClient";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherProfile } from "../../../types/teacherApi";
import { Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDate } from "../Components/Common/format";

type NoticeState = { text: string; tone: "ok" | "error" };

export default function Profile() {
  const api = useTeacherApi();
  const { replaceToken, logout } = useAuth();
  const { data: p, loading, error, reload } = useTeacherQuery<TeacherProfile>("profile");
  const [notice, setNotice] = useState<NoticeState>({ text: "", tone: "ok" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  async function uploadAvatar(file: File) {
    try { await api.upload("profile/avatar", file); setNotice({ text: "Đã đổi ảnh đại diện", tone: "ok" }); reload(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function changePassword() {
    try {
      const r = await api.send<{ message: string; token: string }>("POST", "profile/change-password", pw);
      replaceToken(r.token);
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice({ text: r.message, tone: "ok" });
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function logoutEverywhere() {
    try { await api.send("POST", "profile/logout"); } catch { /* token đã hết hạn thì vẫn đăng xuất ở máy này */ }
    logout();
  }

  return (
    <div className="t-page">
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {p && (
          <div className="t-grid--2">
            <Card>
              <div className="t-row" style={{ alignItems: "flex-start" }}>
                <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", background: "var(--blue-light)", display: "grid", placeItems: "center", fontSize: 36, fontWeight: 800, color: "var(--blue-dark)" }}>
                  {p.avatarUrl ? <img src={assetUrl(p.avatarUrl) ?? p.avatarUrl} alt="Ảnh đại diện" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.fullName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0 }}>{p.fullName}</h2>
                  <p className="t-muted" style={{ margin: "4px 0 12px" }}>{p.specialty ?? "Giáo viên"}</p>
                  <label className="teacher-action-link" style={{ cursor: "pointer" }}>
                    Đổi ảnh (jpg/png/webp ≤ 5 MB)
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }} />
                  </label>
                </div>
              </div>
              <dl className="t-kv" style={{ marginTop: 16 }}>
                <dt>Email</dt><dd>{p.email}</dd>
                <dt>Số điện thoại</dt><dd>{p.phone ?? "—"}</dd>
                <dt>Bằng cấp</dt><dd>{p.degree ?? "—"}</dd>
                <dt>Ngày vào làm</dt><dd>{fmtDate(p.hireDate)}</dd>
                <dt>Số lớp đã phụ trách</dt><dd>{p.classCount}</dd>
              </dl>
              <p className="t-muted t-small">Thông tin cá nhân do Admin cập nhật.</p>
            </Card>

            <Card>
              <h3 className="t-card-title">Đổi mật khẩu</h3>
              <div className="t-form">
                <input className="t-input" type="password" autoComplete="current-password" placeholder="Mật khẩu hiện tại" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} />
                <input className="t-input" type="password" autoComplete="new-password" placeholder="Mật khẩu mới (≥ 8 ký tự)" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} />
                <input className="t-input" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={pw.confirmPassword} onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} />
                <div className="t-actions">
                  <Button variant="ghost" onClick={logoutEverywhere}>Đăng xuất (thu hồi phiên)</Button>
                  <Button disabled={!pw.currentPassword || pw.newPassword.length < 8 || pw.newPassword !== pw.confirmPassword} onClick={changePassword}>Đổi mật khẩu</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  );
}
