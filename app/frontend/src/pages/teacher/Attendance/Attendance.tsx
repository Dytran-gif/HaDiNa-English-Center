import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type {
  AttendanceMark, AttendanceSaveResponse, AttendanceSheet, ClassSessionsResponse, TeacherClass,
} from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { attendanceLabel, fmtDate, fmtDateTime, fmtNumber, fmtTime, sessionStatusLabel } from "../Components/Common/format";

const marks: AttendanceMark[] = ["Present", "Late", "Absent", "Excused"];
type Row = { status: AttendanceMark | null; note: string };

export default function Attendance() {
  const api = useTeacherApi();
  const [params, setParams] = useSearchParams();
  const sessionId = params.get("session");
  const classParam = params.get("class");
  const { data: classes, loading: lc, error: ec, reload: rc } = useTeacherQuery<TeacherClass[]>("classes");
  const { data: sheet, loading, error, reload, setData } = useTeacherQuery<AttendanceSheet>(sessionId ? `sessions/${sessionId}/attendance` : null);
  const classId = sheet?.session.classId ?? (classParam ? Number(classParam) : undefined);
  const { data: sessions } = useTeacherQuery<ClassSessionsResponse>(classId ? `classes/${classId}/sessions` : null);
  const [rows, setRows] = useState<Record<number, Row>>({});
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" | "warn" }>({ text: "", tone: "ok" });
  const [saving, setSaving] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  // Chọn lớp mà chưa chọn buổi -> lấy buổi mặc định (gần nhất)
  useEffect(() => {
    if (sessionId || !classParam) return;
    let cancelled = false;
    api.get<{ sessionId: number }>(`classes/${classParam}/attendance/default`)
      .then(r => { if (!cancelled) setParams({ session: String(r.sessionId) }, { replace: true }); })
      .catch(e => { if (!cancelled) setNotice({ text: errorMessage(e), tone: "error" }); });
    return () => { cancelled = true; };
  }, [api, sessionId, classParam, setParams]);

  // Khi chưa chọn gì: tự chọn lớp đang học đầu tiên
  useEffect(() => {
    if (sessionId || classParam || !classes?.length) return;
    const first = classes.find(c => c.status === "Ongoing") ?? classes[0];
    setParams({ class: String(first.id) }, { replace: true });
  }, [classes, sessionId, classParam, setParams]);

  useEffect(() => {
    if (!sheet) return;
    setRows(Object.fromEntries(sheet.students.map(s => [s.studentId, { status: s.status, note: s.note ?? "" }])));
  }, [sheet]);

  const editable = !!sheet && sheet.canTakeYet && !sheet.locked && sheet.session.status !== "Cancelled";

  function setRow(id: number, patch: Partial<Row>) { setRows(r => ({ ...r, [id]: { ...r[id], ...patch } })); }
  function allPresent() {
    if (!sheet) return;
    setRows(r => Object.fromEntries(sheet.students.map(s => [s.studentId, { ...r[s.studentId], status: s.hasApprovedLeave ? "Excused" : "Present" }])));
  }

  async function save() {
    if (!sheet) return;
    const required = sheet.students.filter(s => s.requiresAttendance || s.isMarked);
    const missing = required.filter(s => s.requiresAttendance && !rows[s.studentId]?.status);
    if (missing.length) { setNotice({ text: `Còn ${missing.length} học viên chưa chọn trạng thái: ${missing.map(m => m.fullName).join(", ")}`, tone: "error" }); return; }
    setSaving(true);
    try {
      const items = required.filter(s => rows[s.studentId]?.status)
        .map(s => ({ studentId: s.studentId, status: rows[s.studentId].status, note: rows[s.studentId].note || null }));
      const r = await api.send<AttendanceSaveResponse>("PUT", `sessions/${sheet.session.id}/attendance`, { items });
      setData(r.sheet);
      const warn = r.warnings.length ? ` Cảnh báo vắng > 20%: ${r.warnings.map(w => `${w.fullName} (${fmtNumber(w.absenceRate)}%)`).join(", ")}` : "";
      setNotice({ text: r.message + "." + warn, tone: warn ? "warn" : "ok" });
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setSaving(false); }
  }

  async function requestUnlock() {
    if (!sheet) return;
    try {
      const r = await api.send<{ message: string }>("POST", `sessions/${sheet.session.id}/attendance/unlock-request`, { reason: unlockReason });
      setUnlockReason(""); setNotice({ text: r.message, tone: "ok" }); reload();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-page">
      <Card>
        <QueryState loading={lc} error={ec} onRetry={rc}>
          {classes && classes.length === 0 ? <Empty>Bạn chưa được phân công lớp nào.</Empty> : (
            <div className="t-form-grid">
              <label><span className="t-label">Lớp</span>
                <select className="t-input" style={{ width: "100%" }} value={classId ?? ""} onChange={e => setParams({ class: e.target.value })}>
                  {!classId && <option value="">— Chọn lớp —</option>}
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label><span className="t-label">Buổi học</span>
                <select className="t-input" style={{ width: "100%" }} value={sessionId ?? ""} onChange={e => setParams({ session: e.target.value })}>
                  {!sessionId && <option value="">— Chọn buổi —</option>}
                  {sessions?.sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      Buổi {s.sessionNo} · {fmtDate(s.date)} {fmtTime(s.startTime)}{s.attendanceTaken ? " ✓" : ""}{s.status === "Cancelled" ? " (đã hủy)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </QueryState>
      </Card>

      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />

      {sessionId && (
        <QueryState loading={loading} error={error} onRetry={reload}>
          {sheet && (
            <Card>
              <div className="t-row t-row--between" style={{ marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{sheet.session.className} · Buổi {sheet.session.sessionNo}</h3>
                  <div className="t-muted">
                    {fmtDate(sheet.session.date)} {fmtTime(sheet.session.startTime)}–{fmtTime(sheet.session.endTime)} ·{" "}
                    {sheet.locked ? "Đã khóa" : `Khóa lúc ${fmtDateTime(sheet.lockAt)}`}
                    {sheet.unlockedUntil && ` · Được mở sửa tới ${fmtDateTime(sheet.unlockedUntil)}`}
                  </div>
                </div>
                <div className="t-row">
                  <StatusTag status={sheet.session.status} labels={sessionStatusLabel} />
                  {sheet.taken && <Tag tone="green">Đã điểm danh {sheet.takenAt ? fmtDateTime(sheet.takenAt) : ""}</Tag>}
                  <Link className="t-link t-small" to={`/teacher/sessions/${sheet.session.id}`}>Chi tiết buổi</Link>
                </div>
              </div>

              {!sheet.canTakeYet && <Notice tone="warn" message="Chưa đến giờ học nên chưa thể điểm danh." />}
              {sheet.locked && (
                <div className="t-notice t-notice--warn" style={{ flexWrap: "wrap" }}>
                  <span>Điểm danh đã khóa sau 48 giờ.{sheet.pendingUnlockRequest ? " Đã gửi yêu cầu mở lại, đang chờ Admin duyệt." : ""}</span>
                  {!sheet.pendingUnlockRequest && (
                    <span className="t-row">
                      <input className="t-input t-input--sm" style={{ minWidth: 260 }} placeholder="Lý do xin mở lại" value={unlockReason} onChange={e => setUnlockReason(e.target.value)} />
                      <Button variant="outline" disabled={!unlockReason.trim()} onClick={requestUnlock}>Gửi yêu cầu</Button>
                    </span>
                  )}
                </div>
              )}

              <div className="t-row t-muted" style={{ margin: "12px 0" }}>
                <span>Tổng {sheet.summary.total}</span>·<span>Có mặt {sheet.summary.present}</span>·<span>Muộn {sheet.summary.late}</span>·
                <span>Vắng {sheet.summary.absent}</span>·<span>Có phép {sheet.summary.excused}</span>·<span>Chưa điểm {sheet.summary.unmarked}</span>
              </div>

              {sheet.students.length === 0 ? <Empty>Lớp chưa có học viên cần điểm danh.</Empty> : (
                <div className="t-table-wrap">
                  <table className="teacher-table">
                    <thead><tr><th>Học viên</th><th>Trạng thái</th><th>Ghi chú</th><th>Chuyên cần</th></tr></thead>
                    <tbody>
                      {sheet.students.map(s => (
                        <tr key={s.studentId} className={s.absenceWarning ? "t-row-warn" : ""}>
                          <td>
                            <div className="t-strong">{s.fullName}</div>
                            <div className="t-muted t-small">{s.code}{!s.requiresAttendance && " · không còn học"}{s.hasApprovedLeave && " · có đơn nghỉ đã duyệt"}</div>
                          </td>
                          <td>
                            <div className="teacher-attendance-actions">
                              {marks.map(m => (
                                <button key={m} type="button" disabled={!editable}
                                  className={`teacher-attendance-btn ${rows[s.studentId]?.status === m ? "active" : ""}`}
                                  onClick={() => setRow(s.studentId, { status: m })}>{attendanceLabel[m]}</button>
                              ))}
                            </div>
                          </td>
                          <td><input className="t-input t-input--sm" disabled={!editable} value={rows[s.studentId]?.note ?? ""} onChange={e => setRow(s.studentId, { note: e.target.value })} /></td>
                          <td>{s.attendanceRate != null ? `${fmtNumber(s.attendanceRate)}%` : "—"} {s.absenceWarning && <Tag tone="red">&gt; 20% vắng</Tag>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sheet.notRequired.length > 0 && (
                <p className="t-muted t-small">Không cần điểm danh (bảo lưu / đã nghỉ): {sheet.notRequired.map(n => n.fullName).join(", ")}</p>
              )}
              {editable && sheet.students.length > 0 && (
                <div className="t-actions" style={{ marginTop: 16 }}>
                  <Button variant="outline" onClick={allPresent}>Tất cả có mặt</Button>
                  <Button disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu điểm danh"}</Button>
                </div>
              )}
            </Card>
          )}
        </QueryState>
      )}
    </div>
  );
}
