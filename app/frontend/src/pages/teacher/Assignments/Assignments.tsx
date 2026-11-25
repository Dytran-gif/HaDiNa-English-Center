import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { AssignmentSubmissions, ClassOption, TeacherAssignment } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDateTime } from "../Components/Common/format";

const ACCEPT = ".pdf,.doc,.docx";
const MAX_MB = 15;
type NoticeState = { text: string; tone: "ok" | "error" };

export default function Assignments() {
  const api = useTeacherApi();
  const [params, setParams] = useSearchParams();
  // Bài tập theo LỚP (?class=id). Link cũ ?course=id vẫn lọc theo khóa.
  const classFilter = params.get("class") ?? "";
  const courseFilter = params.get("course") ?? "";
  const { data: classes } = useTeacherQuery<ClassOption[]>("assignments/classes");
  const { data, loading, error, reload } = useTeacherQuery<TeacherAssignment[]>(`assignments${query({ classId: classFilter, courseId: classFilter ? "" : courseFilter })}`);
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
        <select className="t-input" value={classFilter} aria-label="Lớp"
          onChange={e => setParams(e.target.value ? { class: e.target.value } : {})}>
          <option value="">Tất cả lớp của tôi</option>
          {classes?.map(c => <option key={c.id} value={c.id}>{c.code} · {c.courseName}{c.status === "Finished" ? " (đã kết thúc)" : ""}</option>)}
        </select>
        <Button onClick={() => setShowForm(v => !v)}>{showForm ? "Đóng" : "+ Giao bài tập"}</Button>
      </div>

      {showForm && (
        <CreateForm classes={(classes ?? []).filter(c => c.status !== "Finished")} defaultClass={classFilter}
          onDone={msg => { setShowForm(false); setNotice({ text: msg, tone: "ok" }); reload(); }} />
      )}

      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa giao bài tập nào.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Bài tập</th><th>Lớp nhận bài</th><th>File đề</th><th>Đã nộp</th><th>Ngày giao</th><th></th></tr></thead>
              <tbody>
                {data.map(a => (
                  <tr key={a.id}>
                    <td className="t-wrap"><strong>{a.title}</strong>{a.description && <div className="t-muted t-small t-pre">{a.description}</div>}</td>
                    <td>{a.classCode ? <span className="t-code">{a.classCode}</span> : <span className="t-muted t-small">Mọi lớp của tôi</span>}
                      <div className="t-muted t-small">{a.courseName ?? "—"}</div></td>
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
      <p className="t-muted t-small">File đề và file bài nộp được hệ thống tự dọn sau 7 ngày (bài tập vẫn giữ). Bài giao cho một lớp thì chỉ học viên lớp đó thấy; chọn "mọi lớp của tôi trong khóa" để giao chung.</p>

      <Modal open={viewing !== null} title={`Bài nộp: ${viewing?.title ?? ""}`} onClose={() => setViewing(null)}>
        {viewing && <SubmissionList assignmentId={viewing.id} onDownload={download} />}
      </Modal>
    </div>
  );
}

function CreateForm({ classes, defaultClass, onDone }: {
  classes: ClassOption[]; defaultClass: string; onDone: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [classId, setClassId] = useState(defaultClass || (classes[0] ? String(classes[0].id) : ""));
  const [allClasses, setAllClasses] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const chosen = classes.find(c => String(c.id) === classId);
  const sameCourse = chosen ? classes.filter(c => c.courseId === chosen.courseId) : [];
  const tooBig = !!file && file.size > MAX_MB * 1024 * 1024;
  const ready = !!classId && title.trim().length > 0 && (file !== null || description.trim().length > 0) && !tooBig;

  async function submit() {
    if (!ready) return;
    const form = new FormData();
    form.append("classId", classId);
    if (allClasses) form.append("allClasses", "true");
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
      {classes.length === 0 ? <Empty>Bạn chưa có lớp đang/sắp học nên chưa giao được bài.</Empty> : (
        <div className="t-form">
          <label className="t-label">Lớp nhận bài
            <select className="t-input" value={classId} onChange={e => setClassId(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.code} · {c.name} ({c.courseName})</option>)}
            </select>
          </label>
          {sameCourse.length > 1 && (
            <label className="t-row t-small" style={{ gap: 8 }}>
              <input type="checkbox" checked={allClasses} onChange={e => setAllClasses(e.target.checked)} />
              Giao cho mọi lớp của tôi trong khóa {chosen?.courseName} ({sameCourse.map(c => c.code).join(", ")})
            </label>
          )}
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
      {data && (data.items.length === 0 ? <Empty>Lớp nhận bài chưa có học viên.</Empty> : (
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
