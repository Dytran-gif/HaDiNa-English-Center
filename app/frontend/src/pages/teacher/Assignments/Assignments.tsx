import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { AssignmentSubmissions, CourseOption, TeacherAssignment } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDateTime } from "../Components/Common/format";

const ACCEPT = ".pdf,.doc,.docx";
const MAX_MB = 15;
type NoticeState = { text: string; tone: "ok" | "error" };

export default function Assignments() {
  const api = useTeacherApi();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "";
  const { data: courses } = useTeacherQuery<CourseOption[]>("assignments/courses");
  const { data, loading, error, reload } = useTeacherQuery<TeacherAssignment[]>(`assignments${query({ courseId: courseFilter })}`);
  const [notice, setNotice] = useState<NoticeState>({ text: "", tone: "ok" });
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<TeacherAssignment | null>(null);

  async function download(path: string, name: string) {
    try { await api.download(path, name); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function remove(a: TeacherAssignment) {
    if (!window.confirm(`Xóa bài tập "${a.title}"?`)) return;
    try { await api.send("DELETE", `assignments/${a.id}`); setNotice({ text: "Đã xóa bài tập", tone: "ok" }); reload(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-page">
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <div className="t-row t-row--between">
        <select className="t-input" value={courseFilter} aria-label="Khóa học"
          onChange={e => setParams(e.target.value ? { course: e.target.value } : {})}>
          <option value="">Tất cả khóa</option>
          {courses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Button onClick={() => setShowForm(v => !v)}>{showForm ? "Đóng" : "+ Giao bài tập"}</Button>
      </div>

      {showForm && (
        <CreateForm courses={courses ?? []} defaultCourse={courseFilter}
          onDone={msg => { setShowForm(false); setNotice({ text: msg, tone: "ok" }); reload(); }} />
      )}

      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa giao bài tập nào.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Bài tập</th><th>Khóa</th><th>File đề</th><th>Đã nộp</th><th>Ngày giao</th><th></th></tr></thead>
              <tbody>
                {data.map(a => (
                  <tr key={a.id}>
                    <td className="t-wrap"><strong>{a.title}</strong>{a.description && <div className="t-muted t-small t-pre">{a.description}</div>}</td>
                    <td>{a.courseName ?? "—"}</td>
                    <td>{a.hasFile
                      ? <button type="button" className="teacher-action-link" onClick={() => download(`assignments/${a.id}/download`, a.fileName)}>{a.fileName}</button>
                      : <span className="t-muted t-small">{a.fileName ? "File đã dọn" : "Không có"}</span>}</td>
                    <td>{a.submittedCount}/{a.studentCount}</td>
                    <td>{fmtDateTime(a.createdAt)}</td>
                    <td>
                      <div className="teacher-row-actions">
                        <button type="button" className="teacher-action-link" onClick={() => setViewing(a)}>Bài nộp</button>
                        {a.submittedCount === 0 && <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(a)}>Xóa</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </QueryState>
      <p className="t-muted t-small">File đề và file bài nộp được hệ thống tự dọn sau 7 ngày (bài tập vẫn giữ). Học viên mọi lớp của khóa đều thấy bài tập.</p>

      <Modal open={viewing !== null} title={`Bài nộp: ${viewing?.title ?? ""}`} onClose={() => setViewing(null)}>
        {viewing && <SubmissionList assignmentId={viewing.id} onDownload={download} />}
      </Modal>
    </div>
  );
}

function CreateForm({ courses, defaultCourse, onDone }: {
  courses: CourseOption[]; defaultCourse: string; onDone: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [courseId, setCourseId] = useState(defaultCourse || (courses[0] ? String(courses[0].id) : ""));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const tooBig = !!file && file.size > MAX_MB * 1024 * 1024;
  const ready = !!courseId && title.trim().length > 0 && (file !== null || description.trim().length > 0) && !tooBig;

  async function submit() {
    if (!ready) return;
    const form = new FormData();
    form.append("courseId", courseId);
    form.append("title", title.trim());
    if (description.trim()) form.append("description", description.trim());
    if (file) form.append("file", file, file.name);
    setBusy(true); setErr("");
    try {
      const r = await api.postForm<{ message: string }>("assignments", form);
      onDone(r.message);
    } catch (e) { setErr(errorMessage(e)); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <h3 className="t-card-title">Giao bài tập mới</h3>
      <Notice message={err} tone="error" onClose={() => setErr("")} />
      {courses.length === 0 ? <Empty>Bạn chưa phụ trách lớp nào nên chưa giao được bài.</Empty> : (
        <div className="t-form">
          <label className="t-label">Khóa học
            <select className="t-input" value={courseId} onChange={e => setCourseId(e.target.value)}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="t-label">Tiêu đề
            <input className="t-input" maxLength={250} value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Writing Task 2 - Education" />
          </label>
          <label className="t-label">Mô tả / yêu cầu
            <textarea className="t-input" rows={3} maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Hạn nộp, số từ, lưu ý..." />
          </label>
          <label className="t-label">File đề bài (PDF, DOC, DOCX ≤ {MAX_MB} MB)
            <input ref={fileRef} className="t-input" type="file" accept={ACCEPT} onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {tooBig && <span className="t-danger-text t-small">File vượt quá {MAX_MB} MB.</span>}
          <div className="t-actions">
            <Button disabled={!ready || busy} onClick={submit}>{busy ? "Đang giao..." : "Giao bài"}</Button>
          </div>
          <span className="t-muted t-small">Cần có file đề hoặc mô tả.</span>
        </div>
      )}
    </Card>
  );
}

function SubmissionList({ assignmentId, onDownload }: {
  assignmentId: number; onDownload: (path: string, name: string) => void;
}) {
  const { data, loading, error, reload } = useTeacherQuery<AssignmentSubmissions>(`assignments/${assignmentId}/submissions`);
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (data.items.length === 0 ? <Empty>Khóa này chưa có học viên trong lớp của bạn.</Empty> : (
        <>
          <p className="t-muted t-small">{data.items.filter(i => i.submission).length}/{data.items.length} học viên đã nộp</p>
          <ul className="t-list">
            {data.items.map(i => (
              <li key={i.studentId}>
                <div>
                  <strong>{i.fullName}</strong> <span className="t-muted t-small">({i.code} · {i.className})</span>
                  <div className="t-muted t-small">
                    {i.submission
                      ? <>Nộp lúc {fmtDateTime(i.submission.submittedAt)}{i.attemptCount > 1 ? ` · lần ${i.attemptCount}` : ""}</>
                      : "Chưa nộp"}
                  </div>
                </div>
                {i.submission && (i.submission.hasFile
                  ? <button type="button" className="teacher-action-link" onClick={() => onDownload(`submissions/${i.submission!.id}/download`, i.submission!.fileName)}>Tải bài</button>
                  : <span className="t-muted t-small">File đã dọn</span>)}
              </li>
            ))}
          </ul>
        </>
      ))}
    </QueryState>
  );
}
