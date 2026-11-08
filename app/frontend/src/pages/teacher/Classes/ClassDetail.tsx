import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Tag from "../../../components/ui/Tag";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type {
  AssignmentListItem, ClassAttendanceSummary, ClassSessionsResponse, StudentReviewBody, SyllabusResponse, TeacherClass,
  TeacherClassDetail,
} from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { AssignmentForm } from "../Assignments/AssignmentForm";
import { ReviewFormModal } from "../Students/ReviewFormModal";
import { blankReview } from "../Students/reviewFields";
import {
  attendanceLabel, classStatusLabel, dayNames, dayNo, enrollmentLabel, fmtDate, fmtDateTime, fmtNumber, fmtTime, sessionStatusLabel,
} from "../Components/Common/format";

type Tab = "students" | "assignments" | "sessions" | "syllabus" | "attendance";

export default function ClassDetail() {
  const id = Number(useParams().id);
  const api = useTeacherApi();
  const { data: c, loading, error, reload } = useTeacherQuery<TeacherClassDetail>(`classes/${id}`);
  const [tab, setTab] = useState<Tab>("students");
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  const [editUrl, setEditUrl] = useState<string | null>(null);
  const [announce, setAnnounce] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignVersion, setAssignVersion] = useState(0);   // tăng để tab Bài tập tải lại sau khi giao bài
  const { data: myClasses } = useTeacherQuery<TeacherClass[]>(assignOpen ? "classes" : null);

  async function saveMeetingUrl() {
    try {
      await api.send("PUT", `classes/${id}/meeting-url`, { meetingUrl: editUrl?.trim() || null });
      setEditUrl(null); setNotice({ text: "Đã lưu link học online", tone: "ok" }); reload();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-page">
      <Link className="t-link t-small" to="/teacher/classes">← Danh sách lớp</Link>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {c && (
          <>
            <Card>
              <div className="t-row t-row--between">
                <div>
                  <h2 style={{ margin: 0 }}>{c.name}</h2>
                  <p className="t-muted" style={{ margin: "4px 0 0" }}>
                    {c.courseName} (band {fmtNumber(c.bandFrom)} → {fmtNumber(c.bandTo)}) · {fmtDate(c.startDate)} – {fmtDate(c.endDate)}
                  </p>
                </div>
                <div className="t-row">
                  <StatusTag status={c.status} labels={classStatusLabel} />
                  {c.defaultSessionId && <Button to={`/teacher/attendance?session=${c.defaultSessionId}`}>Điểm danh</Button>}
                  <Button variant="outline" disabled={c.enrolledCount === 0} onClick={() => setAssignOpen(true)}>+ Giao bài tập</Button>
                  <Button variant="outline" onClick={() => setAnnounce(true)}>Gửi thông báo cả lớp</Button>
                </div>
              </div>
              <div className="t-grid--stats" style={{ marginTop: 16 }}>
                <div className="t-stat"><span className="t-stat__value">{c.enrolledCount}/{c.maxStudents}</span><span className="t-stat__label">Sĩ số</span></div>
                <div className="t-stat"><span className="t-stat__value">{c.doneSessions}/{c.totalSessions}</span><span className="t-stat__label">Buổi đã dạy ({c.progressPercent}%)</span></div>
                <div className="t-stat"><span className="t-stat__value">{c.taughtLessons}/{c.syllabusLessons}</span><span className="t-stat__label">Bài giáo án đã dạy</span></div>
              </div>
              <dl className="t-kv" style={{ marginTop: 16 }}>
                <dt>Lịch học</dt>
                <dd>{c.schedules.map(s => `${dayNames[s.dayOfWeek]} ${fmtTime(s.startTime)}–${fmtTime(s.endTime)} (${s.roomName})`).join(" · ") || "—"}</dd>
                <dt>Link học online</dt>
                <dd>
                  {editUrl === null ? (
                    <span className="t-row">
                      {c.meetingUrl ? <a className="t-link" href={c.meetingUrl} target="_blank" rel="noreferrer">{c.meetingUrl}</a> : <span className="t-muted">Chưa có</span>}
                      <button type="button" className="teacher-action-link" onClick={() => setEditUrl(c.meetingUrl ?? "")}>Sửa</button>
                    </span>
                  ) : (
                    <span className="t-row">
                      <input className="t-input" style={{ minWidth: 320 }} placeholder="https://meet.google.com/..." value={editUrl} onChange={e => setEditUrl(e.target.value)} />
                      <button type="button" className="teacher-action-link" onClick={saveMeetingUrl}>Lưu</button>
                      <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => setEditUrl(null)}>Hủy</button>
                    </span>
                  )}
                </dd>
              </dl>
            </Card>

            <div className="t-tabs">
              {([["students", "Học viên"], ["assignments", "Bài tập"], ["sessions", "Buổi học"], ["syllabus", "Giáo án"], ["attendance", "Chuyên cần"]] as [Tab, string][]).map(([k, label]) => (
                <button key={k} type="button" className={`t-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{label}</button>
              ))}
            </div>

            {tab === "students" && <StudentsTab c={c} onNotice={setNotice} />}
            {tab === "assignments" && <AssignmentsTab key={assignVersion} classId={id} onAssign={() => setAssignOpen(true)} />}
            {tab === "sessions" && <SessionsTab classId={id} />}
            {tab === "syllabus" && <SyllabusTab classId={id} onNotice={setNotice} />}
            {tab === "attendance" && <AttendanceTab classId={id} />}

            {myClasses && (
              <AssignmentForm open={assignOpen} editId={null} classes={myClasses} defaultClassId={id}
                onClose={() => setAssignOpen(false)}
                onSaved={msg => { setAssignOpen(false); setNotice({ text: msg, tone: "ok" }); setTab("assignments"); setAssignVersion(v => v + 1); reload(); }} />
            )}

            <AnnounceModal open={announce} classId={id} className={c.name} onClose={() => setAnnounce(false)}
              onDone={text => { setAnnounce(false); setNotice({ text, tone: "ok" }); }} />
          </>
        )}
      </QueryState>
    </div>
  );
}

function StudentsTab({ c, onNotice }: { c: TeacherClassDetail; onNotice: (n: { text: string; tone: "ok" | "error" }) => void }) {
  const [review, setReview] = useState<{ studentId: number; name: string; body: StudentReviewBody } | null>(null);
  if (c.students.length === 0) return <Empty>Lớp chưa có học viên.</Empty>;
  return (
    <Card padded={false} className="t-table-wrap">
      <table className="teacher-table">
        <thead><tr><th>Mã</th><th>Họ tên</th><th>SĐT</th><th>Email</th><th>Band mục tiêu</th><th>Trạng thái</th><th>Chuyên cần</th><th /></tr></thead>
        <tbody>
          {c.students.map(s => (
            <tr key={s.studentId} className={s.absenceWarning ? "t-row-warn" : ""}>
              <td>{s.code}</td>
              <td><Link className="t-link" to={`/teacher/students/${s.studentId}`}>{s.fullName}</Link></td>
              <td>{s.phone ?? "—"}</td>
              <td>{s.email ?? "—"}</td>
              <td>{fmtNumber(s.targetBand)}</td>
              <td><StatusTag status={s.status === "Active" ? "Ongoing" : s.status} labels={{ Ongoing: "Đang học", ...enrollmentLabel }} /></td>
              <td>{s.attendanceRate != null ? `${fmtNumber(s.attendanceRate)}%` : "—"} {s.absenceWarning && <Tag tone="red">Vắng &gt; 20%</Tag>}</td>
              <td>
                <div className="teacher-row-actions">
                  <button type="button" className="teacher-action-link"
                    onClick={() => setReview({ studentId: s.studentId, name: s.fullName, body: blankReview(c.id) })}>Nhận xét</button>
                  <Link className="teacher-action-link" to={`/teacher/students/${s.studentId}`}>Hồ sơ</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {review && (
        <ReviewFormModal studentId={review.studentId} studentName={review.name} classes={[{ id: c.id, name: c.name }]}
          value={review.body} onClose={() => setReview(null)}
          onSaved={msg => { setReview(null); onNotice({ text: `${msg} cho ${review.name}`, tone: "ok" }); }} />
      )}
    </Card>
  );
}

// Bài tập đã giao cho lớp: số đã nộp / được giao, số bài chờ chấm
function AssignmentsTab({ classId, onAssign }: { classId: number; onAssign: () => void }) {
  const { data, loading, error, reload } = useTeacherQuery<AssignmentListItem[]>(`assignments?classId=${classId}`);
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (data.length === 0 ? (
        <Empty>Lớp chưa có bài tập. <button type="button" className="teacher-action-link" onClick={onAssign}>Giao bài đầu tiên</button></Empty>
      ) : (
        <Card padded={false} className="t-table-wrap">
          <table className="teacher-table">
            <thead><tr><th>Bài</th><th>Kỹ năng</th><th>Hạn nộp</th><th>Đã nộp</th><th>Chờ chấm</th></tr></thead>
            <tbody>
              {data.map(a => (
                <tr key={a.id}>
                  <td className="t-wrap"><span className="t-strong">{a.title}</span> {a.type === "Quiz" && <Tag>Tự chấm</Tag>}</td>
                  <td>{a.skill}</td>
                  <td>{fmtDateTime(a.dueAt)} {a.isOpen ? <Tag tone="green">Còn hạn</Tag> : <Tag tone="red">Hết hạn</Tag>}</td>
                  <td>{a.submittedCount}/{a.assignedCount}</td>
                  <td>{a.pendingGrading > 0 ? <Link className="t-link" to={`/teacher/grading?assignmentId=${a.id}`}>{a.pendingGrading} bài</Link> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </QueryState>
  );
}

function SessionsTab({ classId }: { classId: number }) {
  const { data, loading, error, reload } = useTeacherQuery<ClassSessionsResponse>(`classes/${classId}/sessions`);
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (data.sessions.length === 0 ? <Empty>Lớp chưa có buổi học (Admin chưa xếp lịch tuần).</Empty> : (
        <Card padded={false} className="t-table-wrap">
          <table className="teacher-table">
            <thead><tr><th>Buổi</th><th>Ngày</th><th>Giờ</th><th>Phòng</th><th>Bài giáo án</th><th>Tài liệu</th><th>Điểm danh</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {data.sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.sessionNo}{s.type === "Makeup" && <> <Tag tone="yellow">Bù</Tag></>}</td>
                  <td>{dayNames[dayNo(s.date)]} {fmtDate(s.date)}</td>
                  <td>{fmtTime(s.startTime)}–{fmtTime(s.endTime)}</td>
                  <td>{s.roomName ?? "—"}</td>
                  <td className="t-wrap">{s.lessonTitle ?? <span className="t-muted">Chưa gắn</span>} {s.isTaught && <Tag tone="green">Đã dạy</Tag>}</td>
                  <td>{s.materialCount}</td>
                  <td>{s.attendanceTaken ? <Tag tone="green">Đã điểm danh</Tag> : s.status === "Cancelled" ? "—" : <Link className="t-link t-small" to={`/teacher/attendance?session=${s.id}`}>Điểm danh</Link>}</td>
                  <td><StatusTag status={s.status} labels={sessionStatusLabel} /></td>
                  <td><Link className="t-link t-small" to={`/teacher/sessions/${s.id}`}>Chi tiết</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </QueryState>
  );
}

function SyllabusTab({ classId, onNotice }: { classId: number; onNotice: (n: { text: string; tone: "ok" | "error" }) => void }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<SyllabusResponse>(`classes/${classId}/syllabus`);
  const [form, setForm] = useState<{ id?: number; orderNo: string; title: string; description: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const body = { orderNo: form.orderNo ? Number(form.orderNo) : null, title: form.title, description: form.description || null };
      if (form.id) await api.send("PUT", `classes/${classId}/syllabus/${form.id}`, body);
      else await api.send("POST", `classes/${classId}/syllabus`, body);
      setForm(null); onNotice({ text: "Đã lưu bài giáo án", tone: "ok" }); reload();
    } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setSaving(false); }
  }
  async function remove(lessonId: number) {
    if (!confirm("Xóa bài này khỏi giáo án của khóa?")) return;
    try { await api.send("DELETE", `classes/${classId}/syllabus/${lessonId}`); onNotice({ text: "Đã xóa bài", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (
        <Card>
          <div className="t-row t-row--between" style={{ marginBottom: 12 }}>
            <div>
              <div className="t-strong">Hoàn thành {data.taughtLessons}/{data.totalLessons} bài ({data.completionPercent}%)</div>
              <div className="t-muted t-small">Giáo án dùng chung cho mọi lớp cùng khóa. Gắn bài vào buổi ở trang chi tiết buổi học.</div>
            </div>
            <Button onClick={() => setForm({ orderNo: "", title: "", description: "" })}>+ Thêm bài</Button>
          </div>
          <div className="t-progress" style={{ marginBottom: 12 }}><span style={{ width: `${data.completionPercent}%` }} /></div>
          {data.lessons.length === 0 ? <Empty>Khóa học chưa có giáo án.</Empty> : (
            <ul className="t-list">
              {data.lessons.map(l => (
                <li key={l.id}>
                  <div>
                    <div className="t-strong">Bài {l.orderNo}. {l.title} {l.isTaught && <Tag tone="green">Đã dạy</Tag>}</div>
                    {l.description && <div className="t-muted">{l.description}</div>}
                    {l.sessions.length > 0 && (
                      <div className="t-row t-small" style={{ marginTop: 4 }}>
                        {l.sessions.map(s => <Link key={s.sessionId} className="t-chip" to={`/teacher/sessions/${s.sessionId}`}>Buổi {s.sessionNo} · {fmtDate(s.date)}</Link>)}
                      </div>
                    )}
                  </div>
                  <div className="teacher-row-actions">
                    <button type="button" className="teacher-action-link" onClick={() => setForm({ id: l.id, orderNo: String(l.orderNo), title: l.title, description: l.description ?? "" })}>Sửa</button>
                    <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(l.id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Modal open={form !== null} title={form?.id ? "Sửa bài giáo án" : "Thêm bài giáo án"} onClose={() => setForm(null)}
            footer={<><Button variant="ghost" onClick={() => setForm(null)}>Hủy</Button><Button disabled={saving || !form?.title.trim()} onClick={save}>{saving ? "Đang lưu..." : "Lưu"}</Button></>}>
            {form && (
              <div className="t-form">
                <label><span className="t-label">Thứ tự (bỏ trống = cuối danh sách)</span>
                  <input className="t-input" type="number" min={1} value={form.orderNo} onChange={e => setForm({ ...form, orderNo: e.target.value })} /></label>
                <label><span className="t-label">Tên bài *</span>
                  <input className="t-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
                <label><span className="t-label">Mô tả</span>
                  <textarea className="t-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
              </div>
            )}
          </Modal>
        </Card>
      )}
    </QueryState>
  );
}

function AttendanceTab({ classId }: { classId: number }) {
  const { data, loading, error, reload } = useTeacherQuery<ClassAttendanceSummary>(`classes/${classId}/attendance`);
  const short: Record<string, string> = { Present: "✓", Late: "M", Absent: "V", Excused: "P" };
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (data.sessions.length === 0 ? <Empty>Chưa có buổi nào được điểm danh.</Empty> : (
        <Card padded={false} className="t-table-wrap">
          <p className="t-muted t-small" style={{ padding: "12px 16px 0", margin: 0 }}>
            ✓ có mặt · M muộn · V vắng · P vắng có phép. Tô đỏ: vắng quá {data.warningThresholdPercent}%.
          </p>
          <table className="teacher-table">
            <thead>
              <tr>
                <th className="t-sticky">Học viên</th>
                {data.sessions.map(s => <th key={s.id} className="t-center" title={fmtDate(s.date)}>B{s.sessionNo}</th>)}
                <th>Chuyên cần</th><th>Vắng liên tiếp</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map(st => (
                <tr key={st.studentId} className={st.warning ? "t-row-warn" : ""}>
                  <td className="t-sticky">{st.fullName} <span className="t-muted t-small">{st.code}</span></td>
                  {st.marks.map(m => <td key={m.sessionId} className="t-center" title={m.status ? attendanceLabel[m.status] : "Chưa điểm danh"}>{m.status ? short[m.status] : "·"}</td>)}
                  <td>{st.attendanceRate != null ? `${fmtNumber(st.attendanceRate)}%` : "—"}</td>
                  <td>{st.consecutiveAbsences || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </QueryState>
  );
}

export function AnnounceModal({ open, classId, className, studentIds, onClose, onDone }: {
  open: boolean; classId?: number; className?: string; studentIds?: number[]; onClose: () => void; onDone: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function send() {
    setSaving(true); setError("");
    try {
      const r = await api.send<{ message: string }>("POST", "announcements", { classId: classId ?? null, studentIds: studentIds ?? [], title, content });
      setTitle(""); setContent(""); onDone(r.message);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }
  return (
    <Modal open={open} title={`Gửi thông báo${className ? ` · ${className}` : ""}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={saving || !title.trim() || !content.trim()} onClick={send}>{saving ? "Đang gửi..." : "Gửi"}</Button></>}>
      <div className="t-form">
        <Notice message={error} tone="error" />
        <label><span className="t-label">Tiêu đề *</span><input className="t-input" value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label><span className="t-label">Nội dung *</span><textarea className="t-input" rows={5} value={content} onChange={e => setContent(e.target.value)} /></label>
      </div>
    </Modal>
  );
}
