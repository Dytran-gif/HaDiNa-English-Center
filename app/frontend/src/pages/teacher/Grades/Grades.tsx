import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Tag from "../../../components/ui/Tag";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { ExamDetail, ExamListItem, ExamType, GradeConfig, Gradebook, TeacherClass } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { examTypeLabel, fmtDate, fmtDateTime, fmtNumber, todayStr } from "../Components/Common/format";
import { AssignmentForm } from "../Assignments/AssignmentForm";

type Tab = "gradebook" | "exams" | "config";
type NoticeFn = (n: { text: string; tone: "ok" | "error" }) => void;

export default function Grades() {
  const [params, setParams] = useSearchParams();
  const { data: classes, loading, error, reload } = useTeacherQuery<TeacherClass[]>("classes");
  const classId = Number(params.get("class")) || classes?.find(c => c.status === "Ongoing")?.id || classes?.[0]?.id;
  const [tab, setTab] = useState<Tab>("gradebook");
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });

  return (
    <div className="t-page">
      <QueryState loading={loading} error={error} onRetry={reload}>
        {classes && classes.length === 0 && <Empty>Bạn chưa được phân công lớp nào.</Empty>}
        {classes && classId && (
          <>
            <div className="t-row t-row--between">
              <select className="t-input" value={classId} onChange={e => setParams({ class: e.target.value })} aria-label="Lớp">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="t-tabs" style={{ borderBottom: 0 }}>
                {([["gradebook", "Sổ điểm"], ["exams", "Bài kiểm tra"], ["config", "Trọng số"]] as [Tab, string][]).map(([k, l]) => (
                  <button key={k} type="button" className={`t-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
                ))}
              </div>
            </div>
            <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
            {tab === "gradebook" && <GradebookTab classId={classId} onNotice={setNotice} />}
            {tab === "exams" && <ExamsTab classId={classId} classes={classes} onNotice={setNotice} />}
            {tab === "config" && <ConfigTab classId={classId} onNotice={setNotice} />}
          </>
        )}
      </QueryState>
    </div>
  );
}

function GradebookTab({ classId, onNotice }: { classId: number; onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<Gradebook>(`classes/${classId}/gradebook`);
  async function exportExcel() {
    try { await api.download(`classes/${classId}/gradebook/export`, `SoDiem_${classId}.xlsx`); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {data && (
        <Card padded={false} className="t-table-wrap">
          <div className="t-row t-row--between" style={{ padding: "14px 16px" }}>
            <span className="t-muted t-small">
              Trọng số: bài tập {data.config.assignmentWeight}% · định kỳ {data.config.periodicWeight}% · giữa kỳ {data.config.midtermWeight}% · cuối kỳ {data.config.finalWeight}% · đạt từ {data.config.passScore}
              . Bài tập quy về thang 10; ô đỏ = quá hạn chưa nộp / chưa có điểm.
            </span>
            <Button variant="outline" onClick={exportExcel}>Xuất Excel</Button>
          </div>
          {data.rows.length === 0 ? <Empty>Lớp chưa có học viên.</Empty> : (
            <table className="teacher-table">
              <thead>
                <tr>
                  <th className="t-sticky">Học viên</th>
                  {data.columns.map(c => (
                    <th key={`${c.kind}-${c.id}`} className="t-center" title={`${c.title} · ${fmtDate(c.date)}`}>
                      {c.kind === "Exam" ? `${examTypeLabel[c.type ?? ""] ?? "KT"}: ` : ""}{c.title.length > 18 ? c.title.slice(0, 18) + "…" : c.title}
                      <div className="t-muted t-small">/{fmtNumber(c.maxScore)}</div>
                    </th>
                  ))}
                  <th>TB bài tập</th><th>Tổng kết</th><th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map(r => (
                  <tr key={r.studentId}>
                    <td className="t-sticky"><Link className="t-link" to={`/teacher/students/${r.studentId}`}>{r.fullName}</Link> <span className="t-muted t-small">{r.code}</span></td>
                    {r.cells.map(c => (
                      <td key={`${c.kind}-${c.columnId}`} className="t-center" style={c.missing ? { color: "var(--red)" } : undefined}
                        title={c.band != null ? `Band ${fmtNumber(c.band)}` : undefined}>
                        {c.score != null ? fmtNumber(c.score, 2) : c.missing ? "0*" : "·"}
                      </td>
                    ))}
                    <td>{fmtNumber(r.assignmentAverage, 2)}</td>
                    <td className="t-strong">{fmtNumber(r.finalScore, 2)}</td>
                    <td>{r.result ? <StatusTag status={r.result} labels={{ Pass: "Đạt", Fail: "Không đạt" }} /> : <span className="t-muted">Chưa đủ</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </QueryState>
  );
}

type ExamForm = { id?: number; title: string; type: ExamType; skill: string; examDate: string; durationMinutes: string; maxScore: string };

function ExamsTab({ classId, classes, onNotice }: { classId: number; classes: TeacherClass[]; onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<ExamListItem[]>(`exams?classId=${classId}`);
  const [form, setForm] = useState<ExamForm | null>(null);
  const [resultsFor, setResultsFor] = useState<number | null>(null);
  const [partFor, setPartFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const body = { classId, title: form.title, type: form.type, skill: form.skill || null, examDate: form.examDate,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null, maxScore: Number(form.maxScore) };
      const r = form.id ? await api.send<{ message: string }>("PUT", `exams/${form.id}`, body) : await api.send<{ message: string }>("POST", "exams", body);
      setForm(null); onNotice({ text: r.message, tone: "ok" }); reload();
    } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setSaving(false); }
  }
  async function remove(x: ExamListItem) {
    if (!confirm(`Xóa bài kiểm tra "${x.title}"?`)) return;
    try { await api.send("DELETE", `exams/${x.id}`); onNotice({ text: "Đã xóa bài kiểm tra", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <>
      <div className="t-actions">
        <Button onClick={() => setForm({ title: "", type: "Midterm", skill: "", examDate: todayStr(), durationMinutes: "90", maxScore: "10" })}>+ Tạo bài kiểm tra</Button>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Lớp chưa có bài kiểm tra.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Tên</th><th>Loại</th><th>Ngày thi</th><th>Thang</th><th>Đã có điểm</th><th>Điểm TB</th><th>Phần online</th><th /></tr></thead>
              <tbody>
                {data.map(x => (
                  <tr key={x.id}>
                    <td className="t-strong">{x.title} {x.skill && <span className="t-muted">· {x.skill}</span>}</td>
                    <td><Tag>{examTypeLabel[x.type]}</Tag></td>
                    <td>{fmtDate(x.examDate)}{x.durationMinutes ? ` · ${x.durationMinutes}'` : ""}</td>
                    <td>{fmtNumber(x.maxScore)}</td>
                    <td>{x.scoredCount}/{x.studentCount}</td>
                    <td>{fmtNumber(x.averageScore, 2)}</td>
                    <td>{x.onlinePartCount}</td>
                    <td>
                      <div className="teacher-row-actions">
                        <button type="button" className="teacher-action-link" onClick={() => setResultsFor(x.id)}>Nhập điểm</button>
                        <button type="button" className="teacher-action-link" onClick={() => setPartFor(x.id)}>+ Phần online</button>
                        <button type="button" className="teacher-action-link" onClick={() => setForm({ id: x.id, title: x.title, type: x.type, skill: x.skill ?? "", examDate: x.examDate, durationMinutes: x.durationMinutes ? String(x.durationMinutes) : "", maxScore: String(x.maxScore) })}>Sửa</button>
                        <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(x)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </QueryState>

      <Modal open={form !== null} title={form?.id ? "Sửa bài kiểm tra" : "Tạo bài kiểm tra"} onClose={() => setForm(null)}
        footer={<><Button variant="ghost" onClick={() => setForm(null)}>Hủy</Button><Button disabled={saving || !form?.title.trim()} onClick={save}>{saving ? "Đang lưu..." : "Lưu"}</Button></>}>
        {form && (
          <div className="t-form">
            <label><span className="t-label">Tên *</span><input className="t-input" style={{ width: "100%" }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <div className="t-form-grid">
              <label><span className="t-label">Loại</span>
                <select className="t-input" style={{ width: "100%" }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ExamType })}>
                  {(["Periodic", "Midterm", "Final"] as ExamType[]).map(t => <option key={t} value={t}>{examTypeLabel[t]}</option>)}
                </select>
              </label>
              <label><span className="t-label">Kỹ năng</span>
                <select className="t-input" style={{ width: "100%" }} value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })}>
                  <option value="">Tổng hợp</option>{["Writing", "Speaking", "Reading", "Listening"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label><span className="t-label">Ngày thi</span><input className="t-input" style={{ width: "100%" }} type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} /></label>
              <label><span className="t-label">Thời gian (phút)</span><input className="t-input" style={{ width: "100%" }} type="number" min={5} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} /></label>
              <label><span className="t-label">Điểm tối đa</span><input className="t-input" style={{ width: "100%" }} type="number" min={1} value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} /></label>
            </div>
          </div>
        )}
      </Modal>

      <ResultsModal examId={resultsFor} onClose={() => setResultsFor(null)} onSaved={msg => { setResultsFor(null); onNotice({ text: msg, tone: "ok" }); reload(); }} />
      <AssignmentForm open={partFor !== null} editId={null} classes={classes} defaultClassId={classId} defaultExamId={partFor ?? undefined}
        onClose={() => setPartFor(null)} onSaved={msg => { setPartFor(null); onNotice({ text: msg, tone: "ok" }); reload(); }} />
    </>
  );
}

function ResultsModal({ examId, onClose, onSaved }: { examId: number | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<ExamDetail>(examId ? `exams/${examId}` : null);
  const [rows, setRows] = useState<Record<number, { score: string; note: string }>>({});
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setRows(Object.fromEntries(data.results.map(r => [r.studentId, { score: r.score != null ? String(r.score) : "", note: r.note ?? "" }])));
  }, [data]);

  async function save() {
    if (!data) return;
    setSaving(true); setErr("");
    try {
      const r = await api.send<{ message: string }>("PUT", `exams/${data.id}/results`, {
        items: data.results.map(x => ({ studentId: x.studentId, score: rows[x.studentId]?.score === "" ? null : Number(rows[x.studentId]?.score), note: rows[x.studentId]?.note || null })),
      });
      onSaved(r.message);
    } catch (e) { setErr(errorMessage(e)); }
    finally { setSaving(false); }
  }
  async function sync() {
    if (!data) return;
    try { const r = await api.send<{ message: string }>("POST", `exams/${data.id}/sync`); setErr(""); reload(); onSaved(r.message); }
    catch (e) { setErr(errorMessage(e)); }
  }

  return (
    <Modal open={examId !== null} title={`Nhập điểm${data ? ` · ${data.title} (thang ${fmtNumber(data.maxScore)})` : ""}`} onClose={onClose}
      footer={<>{data && data.onlineParts.length > 0 && <Button variant="outline" onClick={sync}>Đồng bộ điểm online</Button>}
        <Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={saving || !data} onClick={save}>{saving ? "Đang lưu..." : "Lưu điểm"}</Button></>}>
      <QueryState loading={loading} error={error} onRetry={reload}>
        <Notice message={err} tone="error" />
        {data && (
          <>
            {data.onlineParts.length > 0 && (
              <p className="t-muted t-small">Phần thi online: {data.onlineParts.map(p => `${p.title} (${p.submittedCount} bài nộp, ${p.pendingGrading} chờ chấm)`).join("; ")}. Điểm nhập tay không bị đồng bộ ghi đè.</p>
            )}
            <div className="t-table-wrap" style={{ maxHeight: "55vh", overflowY: "auto" }}>
              <table className="teacher-table">
                <thead><tr><th>Học viên</th><th>Điểm</th><th>Ghi chú</th><th>Nguồn</th></tr></thead>
                <tbody>
                  {data.results.map(r => (
                    <tr key={r.studentId}>
                      <td>{r.fullName} <span className="t-muted t-small">{r.code}</span></td>
                      <td><input className="t-input t-input--sm" style={{ width: 80 }} type="number" min={0} max={data.maxScore} step={0.25} value={rows[r.studentId]?.score ?? ""}
                        onChange={e => setRows({ ...rows, [r.studentId]: { ...rows[r.studentId], score: e.target.value } })} /></td>
                      <td><input className="t-input t-input--sm" value={rows[r.studentId]?.note ?? ""} onChange={e => setRows({ ...rows, [r.studentId]: { ...rows[r.studentId], note: e.target.value } })} /></td>
                      <td className="t-muted t-small">{r.source === "Manual" ? "Nhập tay" : r.source === "Online" ? "Online" : "—"}{r.updatedAt ? ` · ${fmtDateTime(r.updatedAt)}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </QueryState>
    </Modal>
  );
}

function ConfigTab({ classId, onNotice }: { classId: number; onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<GradeConfig>(`classes/${classId}/grade-config`);
  const [cfg, setCfg] = useState<GradeConfig | null>(null);
  useEffect(() => { if (data) setCfg(data); }, [data]);
  const total = cfg ? cfg.assignmentWeight + cfg.periodicWeight + cfg.midtermWeight + cfg.finalWeight : 0;
  async function save() {
    if (!cfg) return;
    try { await api.send("PUT", `classes/${classId}/grade-config`, cfg); onNotice({ text: "Đã lưu trọng số", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }
  const fields: [keyof GradeConfig, string][] = [["assignmentWeight", "Bài tập (%)"], ["periodicWeight", "Định kỳ (%)"], ["midtermWeight", "Giữa kỳ (%)"], ["finalWeight", "Cuối kỳ (%)"], ["passScore", "Điểm đạt (thang 10)"]];
  return (
    <QueryState loading={loading} error={error} onRetry={reload}>
      {cfg && (
        <Card style={{ maxWidth: 640 }}>
          <div className="t-form">
            <div className="t-form-grid">
              {fields.map(([k, l]) => (
                <label key={k}><span className="t-label">{l}</span>
                  <input className="t-input" style={{ width: "100%" }} type="number" min={0} max={k === "passScore" ? 10 : 100} step={k === "passScore" ? 0.5 : 5}
                    value={cfg[k] ?? 0} onChange={e => setCfg({ ...cfg, [k]: Number(e.target.value) })} /></label>
              ))}
            </div>
            <p className={total === 100 ? "t-muted" : "t-danger-text"} style={{ margin: 0 }}>Tổng trọng số: {total}% {total !== 100 && "(phải bằng 100%)"}</p>
            <div className="t-actions"><Button disabled={total !== 100} onClick={save}>Lưu trọng số</Button></div>
          </div>
        </Card>
      )}
    </QueryState>
  );
}
