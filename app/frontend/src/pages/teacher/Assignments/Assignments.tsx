import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Tag from "../../../components/ui/Tag";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { AssignmentListItem, MissingResponse, TeacherClass } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDateTime } from "../Components/Common/format";
import { AssignmentForm } from "./AssignmentForm";

export default function Assignments() {
  const api = useTeacherApi();
  const [filter, setFilter] = useState({ classId: "", skill: "", state: "" });
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const { data, loading, error, reload } = useTeacherQuery<AssignmentListItem[]>(`assignments${query(filter)}`);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  const [form, setForm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [missing, setMissing] = useState<{ a: AssignmentListItem; data?: MissingResponse } | null>(null);

  async function remove(a: AssignmentListItem) {
    if (!confirm(`Xóa bài "${a.title}"?`)) return;
    try { await api.send("DELETE", `assignments/${a.id}`); setNotice({ text: "Đã xóa bài tập", tone: "ok" }); reload(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function openMissing(a: AssignmentListItem) {
    setMissing({ a });
    try { setMissing({ a, data: await api.get<MissingResponse>(`assignments/${a.id}/missing`) }); }
    catch (e) { setMissing(null); setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function remind(id: number) {
    try { const r = await api.send<{ message: string }>("POST", `assignments/${id}/remind`); setMissing(null); setNotice({ text: r.message, tone: "ok" }); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-page">
      <Card>
        <div className="t-row t-row--between">
          <div className="t-row">
            <select className="t-input" value={filter.classId} onChange={e => setFilter({ ...filter, classId: e.target.value })} aria-label="Lớp">
              <option value="">Tất cả lớp</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="t-input" value={filter.skill} onChange={e => setFilter({ ...filter, skill: e.target.value })} aria-label="Kỹ năng">
              <option value="">Mọi kỹ năng</option>
              {["Writing", "Speaking", "Reading", "Listening"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="t-input" value={filter.state} onChange={e => setFilter({ ...filter, state: e.target.value })} aria-label="Hạn nộp">
              <option value="">Mọi hạn nộp</option><option value="open">Còn hạn</option><option value="closed">Hết hạn</option>
            </select>
          </div>
          <Button disabled={!classes?.length} onClick={() => setForm({ open: true, id: null })}>+ Giao bài tập</Button>
        </div>
      </Card>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa có bài tập nào.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Bài</th><th>Lớp</th><th>Kỹ năng</th><th>Hạn nộp</th><th>Đã nộp</th><th>Chờ chấm</th><th /></tr></thead>
              <tbody>
                {data.map(a => (
                  <tr key={a.id}>
                    <td className="t-wrap"><span className="t-strong">{a.title}</span> {a.type === "Quiz" && <Tag>Tự chấm</Tag>}</td>
                    <td>{a.className}</td>
                    <td>{a.skill}</td>
                    <td>{fmtDateTime(a.dueAt)} {a.isOpen ? <Tag tone="green">Còn hạn</Tag> : <Tag tone="red">Hết hạn</Tag>}</td>
                    <td>{a.submittedCount}/{a.assignedCount}</td>
                    <td>{a.pendingGrading > 0 ? <Link className="t-link" to={`/teacher/grading?assignmentId=${a.id}`}>{a.pendingGrading} bài</Link> : "—"}</td>
                    <td>
                      <div className="teacher-row-actions">
                        <button type="button" className="teacher-action-link" onClick={() => openMissing(a)}>Chưa nộp</button>
                        <button type="button" className="teacher-action-link" onClick={() => setForm({ open: true, id: a.id })}>Sửa</button>
                        <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(a)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </QueryState>

      {classes && (
        <AssignmentForm open={form.open} editId={form.id} classes={classes}
          defaultClassId={filter.classId ? Number(filter.classId) : undefined}
          onClose={() => setForm({ open: false, id: null })}
          onSaved={msg => { setForm({ open: false, id: null }); setNotice({ text: msg, tone: "ok" }); reload(); }} />
      )}

      <Modal open={missing !== null} title={`Chưa nộp · ${missing?.a.title ?? ""}`} onClose={() => setMissing(null)}
        footer={missing?.data && missing.data.count > 0 ? <Button onClick={() => remind(missing.a.id)}>Nhắc {missing.data.count} học viên</Button> : undefined}>
        {!missing?.data ? <p className="t-muted">Đang tải...</p> : missing.data.count === 0 ? <p>Tất cả học viên đã nộp bài.</p> : (
          <ul className="t-list">
            {missing.data.students.map(s => <li key={s.id}><span>{s.fullName} <span className="t-muted">{s.code}</span></span><span className="t-muted">{s.phone ?? ""}</span></li>)}
          </ul>
        )}
      </Modal>
    </div>
  );
}
