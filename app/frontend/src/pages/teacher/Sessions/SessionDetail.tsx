import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { assetUrl } from "../../../services/apiClient";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { SessionDetail as Detail, SyllabusResponse } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { dayNames, dayNo, fmtDate, fmtDateTime, fmtTime, sessionStatusLabel } from "../Components/Common/format";

const materialKinds = [
  { value: "Pdf", label: "PDF" }, { value: "Audio", label: "Audio" }, { value: "Video", label: "Video" },
  { value: "Link", label: "Link" }, { value: "Other", label: "Khác" },
];
const uploadKindMap: Record<string, string> = { Pdf: "Pdf", Audio: "Audio", Video: "Video" };

export default function SessionDetail() {
  const id = Number(useParams().id);
  const api = useTeacherApi();
  const { data: s, loading, error, reload } = useTeacherQuery<Detail>(`sessions/${id}`);
  const { data: syllabus } = useTeacherQuery<SyllabusResponse>(s ? `classes/${s.classId}/syllabus` : null);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  const [lessonId, setLessonId] = useState("");
  const [taught, setTaught] = useState(false);
  const [log, setLog] = useState({ contentTaught: "", homework: "" });
  const [meetingUrl, setMeetingUrl] = useState("");
  const [material, setMaterial] = useState({ title: "", kind: "Pdf", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!s) return;
    setLessonId(s.lesson ? String(s.lesson.id) : "");
    setTaught(s.isTaught);
    setLog({ contentTaught: s.contentTaught ?? "", homework: s.homework ?? "" });
    setMeetingUrl(s.meetingUrl ?? "");
  }, [s]);

  async function run(action: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try { await action(); setNotice({ text: ok, tone: "ok" }); reload(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }

  const saveLesson = () => run(() => api.send("PUT", `sessions/${id}/lesson`, { syllabusLessonId: lessonId ? Number(lessonId) : null, isTaught: taught }), "Đã lưu giáo án buổi học");
  const saveLog = () => run(() => api.send("PUT", `sessions/${id}/log`, log), "Đã lưu nhật ký buổi học");
  const saveUrl = () => run(() => api.send("PUT", `sessions/${id}/meeting-url`, { meetingUrl: meetingUrl.trim() || null }), "Đã lưu link online của buổi");
  const removeMaterial = (mid: number) => { if (confirm("Xóa tài liệu này?")) void run(() => api.send("DELETE", `sessions/${id}/materials/${mid}`), "Đã xóa tài liệu"); };
  const addMaterial = () => run(async () => {
    let url = material.url.trim();
    let kind = material.kind;
    if (file) {
      const up = await api.upload<{ url: string; kind: string }>("files?folder=materials", file);
      url = up.url;
      kind = uploadKindMap[up.kind] ?? (material.kind === "Link" ? "Other" : material.kind);
    }
    await api.send("POST", `sessions/${id}/materials`, { title: material.title.trim() || file?.name || "Tài liệu", kind, url });
    setMaterial({ title: "", kind: "Pdf", url: "" }); setFile(null);
  }, "Đã thêm tài liệu");

  return (
    <div className="t-page">
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {s && (
          <>
            <Link className="t-link t-small" to={`/teacher/classes/${s.classId}`}>← {s.className}</Link>
            <Card>
              <div className="t-row t-row--between">
                <div>
                  <h2 style={{ margin: 0 }}>Buổi {s.sessionNo} · {s.className} {s.type === "Makeup" && <Tag tone="yellow">Dạy bù</Tag>}</h2>
                  <p className="t-muted" style={{ margin: "4px 0 0" }}>
                    {dayNames[dayNo(s.date)]} {fmtDate(s.date)} · {fmtTime(s.startTime)}–{fmtTime(s.endTime)}{s.roomName ? ` · Phòng ${s.roomName}` : ""} · {s.courseName}
                  </p>
                </div>
                <div className="t-row">
                  <StatusTag status={s.status} labels={sessionStatusLabel} />
                  {s.status !== "Cancelled" && <Button to={`/teacher/attendance?session=${s.id}`}>Điểm danh</Button>}
                </div>
              </div>
              <div className="t-row" style={{ marginTop: 12 }}>
                {s.attendance.taken
                  ? <span className="t-muted">Điểm danh: {s.attendance.present} có mặt · {s.attendance.late} muộn · {s.attendance.absent} vắng · {s.attendance.excused} có phép</span>
                  : <span className="t-muted">Chưa điểm danh.</span>}
                <span className="t-muted">· {s.attendance.locked ? "Đã khóa" : `Khóa lúc ${fmtDateTime(s.attendance.lockAt)}`}</span>
                {s.effectiveMeetingUrl && <a className="t-link" href={s.effectiveMeetingUrl} target="_blank" rel="noreferrer">Vào lớp online</a>}
              </div>
            </Card>

            <div className="t-grid--2">
              <Card>
                <h3 className="t-card-title">Giáo án</h3>
                <div className="t-form">
                  <label><span className="t-label">Bài trong syllabus</span>
                    <select className="t-input" value={lessonId} onChange={e => setLessonId(e.target.value)}>
                      <option value="">— Chưa gắn —</option>
                      {syllabus?.lessons.map(l => <option key={l.id} value={l.id}>Bài {l.orderNo}. {l.title}{l.isTaught ? " (đã dạy)" : ""}</option>)}
                    </select>
                  </label>
                  <label className="t-check"><input type="checkbox" checked={taught} onChange={e => setTaught(e.target.checked)} /> Đã dạy xong bài này</label>
                  <div className="t-actions"><Button disabled={busy} onClick={saveLesson}>Lưu giáo án</Button></div>
                </div>
              </Card>

              <Card>
                <h3 className="t-card-title">Link học online riêng của buổi</h3>
                <div className="t-form">
                  <input className="t-input" placeholder={s.classMeetingUrl ? `Để trống = dùng link lớp (${s.classMeetingUrl})` : "https://meet.google.com/..."} value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} />
                  <div className="t-actions"><Button disabled={busy} onClick={saveUrl}>Lưu link</Button></div>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="t-card-title">Nhật ký buổi học</h3>
              <div className="t-form">
                <label><span className="t-label">Nội dung đã dạy</span><textarea className="t-input" rows={4} value={log.contentTaught} onChange={e => setLog({ ...log, contentTaught: e.target.value })} /></label>
                <label><span className="t-label">Bài tập về nhà</span><textarea className="t-input" rows={3} value={log.homework} onChange={e => setLog({ ...log, homework: e.target.value })} /></label>
                <div className="t-actions"><Button disabled={busy} onClick={saveLog}>Lưu nhật ký</Button></div>
              </div>
            </Card>

            <Card>
              <h3 className="t-card-title">Tài liệu buổi học ({s.materials.length})</h3>
              {s.materials.length === 0 ? <Empty>Chưa có tài liệu.</Empty> : (
                <ul className="t-list">
                  {s.materials.map(m => (
                    <li key={m.id}>
                      <div>
                        <a className="t-link" href={assetUrl(m.url) ?? m.url} target="_blank" rel="noreferrer">{m.title}</a>
                        <span className="t-muted"> · {m.kind} · {fmtDateTime(m.createdAt)}</span>
                      </div>
                      <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => removeMaterial(m.id)}>Xóa</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="t-form-grid" style={{ marginTop: 16, alignItems: "end" }}>
                <label><span className="t-label">Tên tài liệu</span><input className="t-input" style={{ width: "100%" }} value={material.title} onChange={e => setMaterial({ ...material, title: e.target.value })} /></label>
                <label><span className="t-label">Loại</span>
                  <select className="t-input" style={{ width: "100%" }} value={material.kind} onChange={e => setMaterial({ ...material, kind: e.target.value })}>
                    {materialKinds.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </label>
                <label><span className="t-label">Tải file lên (≤ 30 MB)</span><input className="t-input" style={{ width: "100%" }} type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
                <label><span className="t-label">… hoặc dán link</span><input className="t-input" style={{ width: "100%" }} disabled={!!file} placeholder="https://..." value={material.url} onChange={e => setMaterial({ ...material, url: e.target.value })} /></label>
              </div>
              <div className="t-actions" style={{ marginTop: 12 }}>
                <Button disabled={busy || (!file && !material.url.trim())} onClick={addMaterial}>{busy ? "Đang lưu..." : "+ Thêm tài liệu"}</Button>
              </div>
            </Card>

          </>
        )}
      </QueryState>
    </div>
  );
}
