import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Tag from "../../../components/ui/Tag";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { StudentProfile, StudentReview, StudentReviewBody, TeacherClass } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import {
  bandOptions, enrollmentLabel, examTypeLabel, fmtDate, fmtDateTime, fmtNumber, submissionStatusLabel,
} from "../Components/Common/format";
import { AnnounceModal } from "../Classes/ClassDetail";
import { ReviewFormModal } from "./ReviewFormModal";
import { blankReview, periodLabel, reviewFields } from "./reviewFields";

type NoticeState = { text: string; tone: "ok" | "error" };

export default function StudentDetail() {
  const id = Number(useParams().id);
  const api = useTeacherApi();
  const { data: p, loading, error, reload } = useTeacherQuery<StudentProfile>(`students/${id}`);
  const [notice, setNotice] = useState<NoticeState>({ text: "", tone: "ok" });
  const [target, setTarget] = useState<string | null>(null);
  const [announce, setAnnounce] = useState(false);
  const [promote, setPromote] = useState(false);

  async function saveTarget() {
    try {
      await api.send("PUT", `students/${id}/target-band`, { targetBand: target === "" ? null : Number(target) });
      setTarget(null); setNotice({ text: "Đã lưu band mục tiêu", tone: "ok" }); reload();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  function printReport(classId: number) {
    const w = window.open("", "_blank");
    api.openPrint(`students/${id}/final-report/print?classId=${classId}`, w).catch(e => { w?.close(); setNotice({ text: errorMessage(e), tone: "error" }); });
  }

  return (
    <div className="t-page">
      <Link className="t-link t-small" to="/teacher/students">← Danh sách học viên</Link>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {p && (
          <>
            <Card>
              <div className="t-row t-row--between">
                <div>
                  <h2 style={{ margin: 0 }}>{p.student.fullName} <span className="t-muted">({p.student.code})</span></h2>
                  <p className="t-muted" style={{ margin: "4px 0 0" }}>
                    {p.student.phone ?? "—"} · {p.student.email ?? "—"}{p.student.dateOfBirth ? ` · sinh ${fmtDate(p.student.dateOfBirth)}` : ""}
                    {p.student.parentName ? ` · PH: ${p.student.parentName} ${p.student.parentPhone ?? ""}` : ""}
                  </p>
                </div>
                <div className="t-row">
                  <Button variant="outline" onClick={() => setAnnounce(true)}>Gửi thông báo</Button>
                  <Button variant="outline" onClick={() => setPromote(true)}>Đề xuất lên lớp</Button>
                </div>
              </div>
              <div className="t-row" style={{ marginTop: 12 }}>
                <span className="t-strong">Band mục tiêu:</span>
                {target === null ? (
                  <><span>{fmtNumber(p.targetBand)}</span><button type="button" className="teacher-action-link" onClick={() => setTarget(p.targetBand != null ? String(p.targetBand) : "")}>Sửa</button></>
                ) : (
                  <>
                    <select className="t-input t-input--sm" value={target} onChange={e => setTarget(e.target.value)}>
                      <option value="">— Chưa đặt —</option>
                      {bandOptions.map(b => <option key={b} value={b}>{b.toFixed(1)}</option>)}
                    </select>
                    <button type="button" className="teacher-action-link" onClick={saveTarget}>Lưu</button>
                    <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => setTarget(null)}>Hủy</button>
                  </>
                )}
                {p.bandBySkill.map(b => <Tag key={b.skill}>{b.skill}: TB {fmtNumber(b.average)} · gần nhất {fmtNumber(b.latest)}</Tag>)}
              </div>
            </Card>

            <Card>
              <h3 className="t-card-title">Tiến bộ band</h3>
              <BandChart history={p.bandHistory} target={p.targetBand ?? null} />
            </Card>

            <Card padded={false} className="t-table-wrap">
              <h3 className="t-card-title" style={{ padding: "16px 16px 0" }}>Lớp đang / đã học với bạn</h3>
              <table className="teacher-table">
                <thead><tr><th>Lớp</th><th>Thời gian</th><th>Trạng thái</th><th>Chuyên cần</th><th>Chưa nộp</th><th /></tr></thead>
                <tbody>
                  {p.classes.map(c => (
                    <tr key={c.classId} className={c.attendance?.warning ? "t-row-warn" : ""}>
                      <td><Link className="t-link" to={`/teacher/classes/${c.classId}`}>{c.className}</Link> <span className="t-muted t-small">{c.courseName}</span></td>
                      <td>{fmtDate(c.startDate)} – {fmtDate(c.endDate)}</td>
                      <td><StatusTag status={c.enrollmentStatus === "Active" ? "Ongoing" : c.enrollmentStatus} labels={{ Ongoing: "Đang học", ...enrollmentLabel }} /></td>
                      <td>{c.attendance ? `${fmtNumber(c.attendance.attendanceRate)}% (${c.attendance.present + c.attendance.late}/${c.attendance.totalMarked})` : "—"}</td>
                      <td>{c.missingAssignments || "—"}</td>
                      <td><button type="button" className="teacher-action-link" onClick={() => printReport(c.classId)}>In phiếu cuối khóa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="t-grid--2">
              <Card>
                <h3 className="t-card-title">Bài kiểm tra</h3>
                {p.examHistory.length === 0 ? <Empty>Chưa có điểm kiểm tra.</Empty> : (
                  <ul className="t-list">
                    {p.examHistory.map(x => (
                      <li key={x.examId}>
                        <span>{x.title} <span className="t-muted">· {examTypeLabel[x.type] ?? x.type} · {fmtDate(x.date)}</span></span>
                        <span className="t-strong">{fmtNumber(x.score, 2)}/{fmtNumber(x.maxScore)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <h3 className="t-card-title">Bài đã nộp</h3>
                {p.submissions.length === 0 ? <Empty>Chưa nộp bài nào.</Empty> : (
                  <ul className="t-list" style={{ maxHeight: 320, overflowY: "auto" }}>
                    {p.submissions.map(s => (
                      <li key={s.id}>
                        <span><Link className="t-link" to={`/teacher/grading/${s.id}`}>{s.title}</Link> <span className="t-muted">· {s.skill} · lần {s.attemptNo} · {fmtDateTime(s.submittedAt)}</span></span>
                        <span className="t-row"><StatusTag status={s.status} labels={submissionStatusLabel} />{s.type === "Quiz" ? `${fmtNumber(s.autoScore)}/${fmtNumber(s.autoMaxScore)}` : fmtNumber(s.overallBand)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <Reviews studentId={id} classes={p.classes.map(c => ({ id: c.classId, name: c.className }))} onNotice={setNotice} />

            <AnnounceModal open={announce} studentIds={[id]} className={p.student.fullName} onClose={() => setAnnounce(false)}
              onDone={msg => { setAnnounce(false); setNotice({ text: msg, tone: "ok" }); }} />
            <PromoteModal open={promote} studentId={id} classes={p.classes.map(c => ({ id: c.classId, name: c.className }))}
              onClose={() => setPromote(false)} onDone={msg => { setPromote(false); setNotice({ text: msg, tone: "ok" }); }} />
          </>
        )}
      </QueryState>
    </div>
  );
}

/** Biểu đồ đường band theo thời gian (SVG thuần, không thêm thư viện) */
function BandChart({ history, target }: { history: StudentProfile["bandHistory"]; target: number | null }) {
  const colors: Record<string, string> = { Writing: "#2563eb", Speaking: "#10b981" };
  if (history.length === 0) return <Empty>Chưa có bài Writing / Speaking nào được công bố điểm.</Empty>;
  const W = 720, H = 220, L = 36, R = 12, T = 12, B = 28;
  const minB = Math.max(0, Math.floor(Math.min(...history.map(h => h.band), target ?? 9) - 1));
  const maxB = 9;
  const x = (i: number) => L + (history.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (history.length - 1));
  const y = (b: number) => T + ((maxB - b) * (H - T - B)) / (maxB - minB || 1);
  const skills = [...new Set(history.map(h => h.skill))];
  return (
    <>
      <svg className="t-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ band">
        {Array.from({ length: maxB - minB + 1 }, (_, k) => minB + k).map(b => (
          <g key={b}><line x1={L} x2={W - R} y1={y(b)} y2={y(b)} stroke="#e5e9f5" /><text x={4} y={y(b) + 4}>{b}</text></g>
        ))}
        {target != null && <><line x1={L} x2={W - R} y1={y(target)} y2={y(target)} stroke="#ed3838" strokeDasharray="6 4" /><text x={W - R - 70} y={y(target) - 4} style={{ fill: "#ed3838" }}>Mục tiêu {target}</text></>}
        {skills.map(sk => {
          const pts = history.map((h, i) => ({ h, i })).filter(p => p.h.skill === sk);
          return (
            <g key={sk}>
              <polyline fill="none" stroke={colors[sk] ?? "#5b6478"} strokeWidth={2} points={pts.map(p => `${x(p.i)},${y(p.h.band)}`).join(" ")} />
              {pts.map(p => <circle key={p.h.submissionId} cx={x(p.i)} cy={y(p.h.band)} r={4} fill={colors[sk] ?? "#5b6478"}><title>{`${p.h.title} · ${fmtDate(p.h.date)} · ${p.h.band}`}</title></circle>)}
            </g>
          );
        })}
        {history.map((h, i) => <text key={h.submissionId} x={Math.min(Math.max(x(i), L + 14), W - R - 16)} y={H - 8} textAnchor="middle">{fmtDate(h.date).slice(0, 5)}</text>)}
      </svg>
      <div className="t-row t-small">{skills.map(sk => <span key={sk} style={{ color: colors[sk] ?? "#5b6478" }}>● {sk}</span>)}</div>
    </>
  );
}

function Reviews({ studentId, classes, onNotice }: { studentId: number; classes: { id: number; name: string }[]; onNotice: (n: NoticeState) => void }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<StudentReview[]>(`students/${studentId}/reviews`);
  const [form, setForm] = useState<(StudentReviewBody & { id?: number }) | null>(null);
  // ?review=<classId>: mở sẵn form nhận xét cho lớp đó (đi từ trang chi tiết lớp)
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const cid = Number(params.get("review"));
    if (cid && classes.some(c => c.id === cid)) {
      setForm(blankReview(cid));
      setParams(p => { p.delete("review"); return p; }, { replace: true });
    }
  }, [params, classes, setParams]);

  async function remove(rid: number) {
    if (!confirm("Xóa nhận xét này?")) return;
    try { await api.send("DELETE", `students/${studentId}/reviews/${rid}`); onNotice({ text: "Đã xóa nhận xét", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }
  return (
    <Card>
      <h3 className="t-card-title">Nhận xét định kỳ <Button disabled={!classes.length} onClick={() => setForm(blankReview(classes[0]?.id ?? 0))}>+ Viết nhận xét</Button></h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa có nhận xét.</Empty> : (
          <ul className="t-list">
            {data.map(r => (
              <li key={r.id}>
                <div>
                  <div className="t-strong">{periodLabel[r.period]} {r.periodLabel ?? ""} · {r.className}</div>
                  {reviewFields.filter(([k]) => r[k]).map(([k, l]) => <div key={k} className="t-small"><span className="t-muted">{l}:</span> {String(r[k])}</div>)}
                  <div className="t-muted t-small">{fmtDateTime(r.updatedAt ?? r.createdAt)}</div>
                </div>
                <div className="teacher-row-actions">
                  <button type="button" className="teacher-action-link" onClick={() => setForm({ ...r })}>Sửa</button>
                  <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(r.id)}>Xóa</button>
                </div>
              </li>
            ))}
          </ul>
        ))}
      </QueryState>
      <ReviewFormModal studentId={studentId} classes={classes} value={form} onClose={() => setForm(null)}
        onSaved={msg => { setForm(null); onNotice({ text: msg, tone: "ok" }); reload(); }} />
    </Card>
  );
}

function PromoteModal({ open, studentId, classes, onClose, onDone }: {
  open: boolean; studentId: number; classes: { id: number; name: string }[]; onClose: () => void; onDone: (msg: string) => void;
}) {
  const api = useTeacherApi();
  const { data: myClasses } = useTeacherQuery<TeacherClass[]>(open ? "classes" : null);
  const courses = useMemo(() => {
    const map = new Map<number, string>();
    myClasses?.forEach(c => map.set(c.courseId, c.courseName));
    return [...map.entries()];
  }, [myClasses]);
  const [classId, setClassId] = useState<number | "">("");
  const [courseId, setCourseId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  async function send() {
    setError("");
    try {
      const r = await api.send<{ message: string }>("POST", `students/${studentId}/promotions`, {
        classId: classId || classes[0]?.id, recommendedCourseId: courseId ? Number(courseId) : null, reason: reason || null,
      });
      setReason(""); onDone(r.message);
    } catch (e) { setError(errorMessage(e)); }
  }
  return (
    <Modal open={open} title="Đề xuất lên lớp" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={!classes.length} onClick={send}>Gửi Admin</Button></>}>
      <div className="t-form">
        <Notice message={error} tone="error" />
        <label><span className="t-label">Từ lớp</span>
          <select className="t-input" style={{ width: "100%" }} value={classId || classes[0]?.id || ""} onChange={e => setClassId(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <label><span className="t-label">Khóa đề xuất (trong các khóa bạn đang dạy)</span>
          <select className="t-input" style={{ width: "100%" }} value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">— Để Admin chọn —</option>
            {courses.map(([cid, name]) => <option key={cid} value={cid}>{name}</option>)}
          </select></label>
        <label><span className="t-label">Lý do</span><textarea className="t-input" style={{ width: "100%" }} value={reason} onChange={e => setReason(e.target.value)} /></label>
      </div>
    </Modal>
  );
}
