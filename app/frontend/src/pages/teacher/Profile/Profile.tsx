import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl } from "../../../services/apiClient";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherClass, TeacherProfile, TeacherRatings, Timesheet } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { classStatusLabel, eventKindLabel, fmtDate, fmtDateTime, fmtNumber, fmtTime, todayStr } from "../Components/Common/format";

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
      <TimesheetCard />
      <div className="t-grid--2">
        <RatingsCard />
        <ClassHistory />
      </div>
    </div>
  );
}

function TimesheetCard() {
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const { data, loading, error, reload } = useTeacherQuery<Timesheet>(`profile/timesheet?month=${month}`);
  return (
    <Card>
      <h3 className="t-card-title">Bảng công <input className="t-input t-input--sm" type="month" value={month} onChange={e => setMonth(e.target.value)} aria-label="Tháng" /></h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="t-grid--stats">
              <div className="t-stat"><span className="t-stat__value">{data.totalSessions}</span><span className="t-stat__label">Tổng buổi</span></div>
              <div className="t-stat"><span className="t-stat__value">{fmtNumber(data.totalHours)}</span><span className="t-stat__label">Tổng giờ</span></div>
              <div className="t-stat"><span className="t-stat__value">{data.makeupSessions}</span><span className="t-stat__label">Buổi dạy bù</span></div>
              <div className="t-stat"><span className="t-stat__value">{data.oneOnOneSessions}</span><span className="t-stat__label">Buổi 1 kèm 1</span></div>
              <div className={`t-stat ${data.sessionsNotMarked ? "t-stat--warn" : ""}`}><span className="t-stat__value">{data.sessionsNotMarked}</span><span className="t-stat__label">Buổi chưa điểm danh (chưa tính công)</span></div>
            </div>
            {data.details.length === 0 ? <Empty>Chưa có buổi được tính công trong tháng.</Empty> : (
              <div className="t-table-wrap" style={{ marginTop: 12, maxHeight: 320, overflowY: "auto" }}>
                <table className="teacher-table">
                  <thead><tr><th>Ngày</th><th>Giờ</th><th>Loại</th><th>Nội dung</th><th>Số giờ</th></tr></thead>
                  <tbody>
                    {data.details.map(d => (
                      <tr key={`${d.kind}-${d.id}`}>
                        <td>{fmtDate(d.date)}</td><td>{fmtTime(d.startTime)}–{fmtTime(d.endTime)}</td><td>{eventKindLabel[d.kind] ?? d.kind}</td>
                        <td>{d.title}{d.sessionNo ? ` · B${d.sessionNo}` : ""}</td><td>{fmtNumber(d.hours, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </QueryState>
    </Card>
  );
}

function RatingsCard() {
  const { data, loading, error, reload } = useTeacherQuery<TeacherRatings>("profile/ratings");
  const max = Math.max(1, ...(data?.distribution.map(d => d.count) ?? [1]));
  return (
    <Card>
      <h3 className="t-card-title">Đánh giá từ học viên</h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.totalRatings === 0 ? <Empty>Chưa có đánh giá.</Empty> : (
          <>
            <div className="t-row"><span className="t-overall">{fmtNumber(data.averageScore, 2)}</span><span className="t-muted">/ 5 · {data.totalRatings} lượt</span></div>
            {[...data.distribution].reverse().map(d => (
              <div key={d.score} className="t-row t-small" style={{ gap: 8 }}>
                <span style={{ width: 28 }}>{d.score}★</span>
                <div className="t-progress" style={{ flex: 1 }}><span style={{ width: `${(d.count / max) * 100}%` }} /></div>
                <span style={{ width: 24 }}>{d.count}</span>
              </div>
            ))}
            <ul className="t-list" style={{ marginTop: 8 }}>
              {data.comments.map(c => (
                <li key={c.id}><div><div>{"★".repeat(c.score)} <span className="t-muted t-small">{c.studentName}{c.className ? ` · ${c.className}` : ""}</span></div>{c.comment && <div>{c.comment}</div>}</div><span className="t-muted t-small">{fmtDateTime(c.createdAt)}</span></li>
              ))}
            </ul>
          </>
        ))}
      </QueryState>
    </Card>
  );
}

function ClassHistory() {
  const { data, loading, error, reload } = useTeacherQuery<(Pick<TeacherClass, "id" | "name" | "courseName" | "startDate" | "endDate" | "status"> & { studentCount: number })[]>("profile/classes");
  return (
    <Card>
      <h3 className="t-card-title">Lịch sử lớp</h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa có lớp.</Empty> : (
          <ul className="t-list">
            {data.map(c => (
              <li key={c.id}>
                <div><Link className="t-link" to={`/teacher/classes/${c.id}`}>{c.name}</Link><div className="t-muted t-small">{c.courseName} · {fmtDate(c.startDate)} – {fmtDate(c.endDate)} · {c.studentCount} HV</div></div>
                <StatusTag status={c.status} labels={classStatusLabel} />
              </li>
            ))}
          </ul>
        ))}
      </QueryState>
    </Card>
  );
}
