import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type {
  AnnouncementItem, NotificationItem, OneOnOneItem, Paged, StudentRequestItem, TeacherClass,
} from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { fmtDate, fmtDateTime, fmtTime, requestStatusLabel, requestTypeLabel } from "../Components/Common/format";
import { AnnounceModal } from "../Classes/ClassDetail";

type Tab = "requests" | "oneonone" | "announcements" | "notifications";
type NoticeFn = (n: { text: string; tone: "ok" | "error" }) => void;
const tabs: [Tab, string][] = [["requests", "Yêu cầu học viên"], ["oneonone", "Buổi 1 kèm 1"], ["announcements", "Thông báo đã gửi"], ["notifications", "Thông báo của tôi"]];

export default function Requests() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "requests";
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  return (
    <div className="t-page">
      <div className="t-tabs">
        {tabs.map(([k, l]) => <button key={k} type="button" className={`t-tab ${tab === k ? "active" : ""}`} onClick={() => setParams({ tab: k })}>{l}</button>)}
      </div>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      {tab === "requests" && <RequestsTab onNotice={setNotice} />}
      {tab === "oneonone" && <OneOnOneTab onNotice={setNotice} />}
      {tab === "announcements" && <AnnouncementsTab onNotice={setNotice} />}
      {tab === "notifications" && <NotificationsTab onNotice={setNotice} />}
    </div>
  );
}

function RequestsTab({ onNotice }: { onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const [status, setStatus] = useState("Pending");
  const [type, setType] = useState("");
  const { data, loading, error, reload } = useTeacherQuery<StudentRequestItem[]>(`requests${query({ status, type })}`);
  const [action, setAction] = useState<{ r: StudentRequestItem; kind: "approve" | "reject" } | null>(null);
  const [text, setText] = useState("");

  async function submit() {
    if (!action) return;
    try {
      const r = action.kind === "approve"
        ? await api.send<{ message?: string }>("POST", `requests/${action.r.id}/approve`, { note: text || null })
        : await api.send<{ message?: string }>("POST", `requests/${action.r.id}/reject`, { reason: text });
      onNotice({ text: r.message ?? (action.kind === "approve" ? "Đã duyệt" : "Đã từ chối"), tone: "ok" });
      setAction(null); setText(""); reload();
    } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <>
      <div className="t-row">
        <select className="t-input" value={status} onChange={e => setStatus(e.target.value)} aria-label="Trạng thái">
          <option value="">Mọi trạng thái</option>
          {["Pending", "Approved", "Rejected", "Cancelled"].map(s => <option key={s} value={s}>{requestStatusLabel[s]}</option>)}
        </select>
        <select className="t-input" value={type} onChange={e => setType(e.target.value)} aria-label="Loại">
          <option value="">Mọi loại</option>
          {["Leave", "Reschedule", "OneOnOneBooking", "OneOnOneCancel"].map(t => <option key={t} value={t}>{requestTypeLabel[t]}</option>)}
        </select>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Không có yêu cầu nào.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Loại</th><th>Học viên</th><th>Lớp / buổi</th><th>Thời gian</th><th>Lý do</th><th>Gửi lúc</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.id}>
                    <td>{requestTypeLabel[r.type]}</td>
                    <td><Link className="t-link" to={`/teacher/students/${r.student.id}`}>{r.student.fullName}</Link><div className="t-muted t-small">{r.student.phone}</div></td>
                    <td>{r.class?.name ?? "—"}{r.session ? <div className="t-muted t-small">Buổi {r.session.sessionNo} · {fmtDate(r.session.date)} {fmtTime(r.session.startTime)}</div> : null}</td>
                    <td>{r.date ? `${fmtDate(r.date)} ${fmtTime(r.startTime)}–${fmtTime(r.endTime)}` : "—"}</td>
                    <td className="t-wrap">{r.reason ?? "—"}{r.responseNote && <div className="t-muted t-small">Phản hồi: {r.responseNote}</div>}</td>
                    <td>{fmtDateTime(r.createdAt)}</td>
                    <td><StatusTag status={r.status} labels={requestStatusLabel} /></td>
                    <td>
                      {r.status === "Pending" && (
                        <div className="teacher-row-actions">
                          <button type="button" className="teacher-action-link" onClick={() => { setText(""); setAction({ r, kind: "approve" }); }}>Duyệt</button>
                          <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => { setText(""); setAction({ r, kind: "reject" }); }}>Từ chối</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </QueryState>
      <Modal open={action !== null} title={action?.kind === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"} onClose={() => setAction(null)}
        footer={<><Button variant="ghost" onClick={() => setAction(null)}>Hủy</Button>
          <Button disabled={action?.kind === "reject" && !text.trim()} onClick={submit}>{action?.kind === "approve" ? "Duyệt" : "Từ chối"}</Button></>}>
        {action && (
          <div className="t-form">
            <p style={{ margin: 0 }}>{requestTypeLabel[action.r.type]} · {action.r.student.fullName}</p>
            {action.kind === "approve" && action.r.type === "Leave" && <p className="t-muted t-small" style={{ margin: 0 }}>Duyệt xin nghỉ: điểm danh buổi đó tự đánh "Vắng có phép".</p>}
            {action.kind === "approve" && action.r.type === "OneOnOneBooking" && <p className="t-muted t-small" style={{ margin: 0 }}>Duyệt đặt lịch: hệ thống tạo buổi 1 kèm 1 trên lịch dạy.</p>}
            <label><span className="t-label">{action.kind === "approve" ? "Ghi chú (không bắt buộc)" : "Lý do từ chối *"}</span>
              <textarea className="t-input" style={{ width: "100%" }} value={text} onChange={e => setText(e.target.value)} /></label>
          </div>
        )}
      </Modal>
    </>
  );
}

function OneOnOneTab({ onNotice }: { onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<OneOnOneItem[]>("requests/one-on-one");
  const [edit, setEdit] = useState<{ id: number; url: string } | null>(null);
  async function save() {
    if (!edit) return;
    try { await api.send("PUT", `requests/one-on-one/${edit.id}/meeting-url`, { meetingUrl: edit.url.trim() || null }); setEdit(null); onNotice({ text: "Đã lưu link", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (data.length === 0 ? <Empty>Chưa có buổi 1 kèm 1.</Empty> : (
        <Card padded={false} className="t-table-wrap">
          <table className="teacher-table">
            <thead><tr><th>Ngày</th><th>Giờ</th><th>Học viên</th><th>Chủ đề</th><th>Link online</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {data.map(o => (
                <tr key={o.id}>
                  <td>{fmtDate(o.date)}</td><td>{fmtTime(o.startTime)}–{fmtTime(o.endTime)}</td>
                  <td><Link className="t-link" to={`/teacher/students/${o.student.id}`}>{o.student.fullName}</Link></td>
                  <td className="t-wrap">{o.topic ?? "—"}</td>
                  <td>
                    {edit?.id === o.id ? (
                      <span className="t-row">
                        <input className="t-input t-input--sm" value={edit.url} onChange={e => setEdit({ ...edit, url: e.target.value })} placeholder="https://..." />
                        <button type="button" className="teacher-action-link" onClick={save}>Lưu</button>
                      </span>
                    ) : (
                      <span className="t-row">
                        {o.meetingUrl ? <a className="t-link" href={o.meetingUrl} target="_blank" rel="noreferrer">Mở</a> : <span className="t-muted">Chưa có</span>}
                        <button type="button" className="teacher-action-link" onClick={() => setEdit({ id: o.id, url: o.meetingUrl ?? "" })}>Sửa</button>
                      </span>
                    )}
                  </td>
                  <td><StatusTag status={o.status === "Scheduled" ? "Upcoming" : o.status} labels={{ Upcoming: "Đã xếp lịch", Cancelled: "Đã hủy", Done: "Đã xong" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </QueryState>
  );
}

function AnnouncementsTab({ onNotice }: { onNotice: NoticeFn }) {
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const [classId, setClassId] = useState("");
  const { data, loading, error, reload } = useTeacherQuery<Paged<AnnouncementItem>>(`announcements${query({ classId })}`);
  const [open, setOpen] = useState(false);
  const target = classes?.find(c => String(c.id) === classId) ?? classes?.[0];
  return (
    <>
      <div className="t-row t-row--between">
        <select className="t-input" value={classId} onChange={e => setClassId(e.target.value)} aria-label="Lớp">
          <option value="">Tất cả lớp</option>
          {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Button disabled={!target} onClick={() => setOpen(true)}>+ Gửi thông báo cho {target?.name ?? "lớp"}</Button>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.items.length === 0 ? <Empty>Chưa gửi thông báo nào.</Empty> : (
          <Card>
            <ul className="t-list">
              {data.items.map(a => (
                <li key={a.id}>
                  <div>
                    <div className="t-strong">{a.title}</div>
                    <p className="t-pre t-muted" style={{ margin: "4px 0" }}>{a.content}</p>
                    <div className="t-muted t-small">{a.className ?? "Học viên chọn riêng"} · {fmtDateTime(a.createdAt)}</div>
                  </div>
                  <span className="t-muted t-small">Đã đọc {a.readCount}/{a.recipientCount}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </QueryState>
      {target && <AnnounceModal open={open} classId={target.id} className={target.name} onClose={() => setOpen(false)}
        onDone={msg => { setOpen(false); onNotice({ text: msg, tone: "ok" }); reload(); }} />}
    </>
  );
}

function NotificationsTab({ onNotice }: { onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, loading, error, reload } = useTeacherQuery<Paged<NotificationItem> & { unreadCount: number }>(`notifications${query({ unreadOnly, pageSize: 50 })}`);
  async function read(id: number) { try { await api.send("POST", `notifications/${id}/read`); reload(); } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); } }
  async function readAll() { try { await api.send("POST", "notifications/read-all"); reload(); } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); } }
  return (
    <>
      <div className="t-row t-row--between">
        <label className="t-check"><input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} /> Chỉ chưa đọc</label>
        <Button variant="outline" disabled={!data?.unreadCount} onClick={readAll}>Đánh dấu tất cả đã đọc</Button>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.items.length === 0 ? <Empty>Không có thông báo.</Empty> : (
          <Card>
            <ul className="t-list">
              {data.items.map(n => (
                <li key={n.id}>
                  <div>
                    <div className={n.isRead ? "" : "t-strong"}>{n.title}</div>
                    {n.content && <div className="t-muted">{n.content}</div>}
                    <div className="t-muted t-small">{fmtDateTime(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <button type="button" className="teacher-action-link" onClick={() => read(n.id)}>Đã đọc</button>}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </QueryState>
    </>
  );
}
