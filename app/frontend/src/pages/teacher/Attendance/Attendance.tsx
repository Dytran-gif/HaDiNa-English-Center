import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Tag from "../../../components/ui/Tag";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { AttendanceRoster, AttendanceSession, AttendanceStatus, TeacherClass } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { attendanceLabel, dayNames, dayNo, fmtDate, fmtTime } from "../Components/Common/format";

const STATUSES: AttendanceStatus[] = ["Present", "Late", "Absent", "Excused"];
type Row = { status: AttendanceStatus | null; note: string };

export default function Attendance() {
  const [params, setParams] = useSearchParams();
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  // Mặc định: lớp đang học đầu tiên
  const classId = params.get("class") ?? String(classes?.find(c => c.status === "Ongoing")?.id ?? classes?.[0]?.id ?? "");
  const date = params.get("date") ?? "";
  const sessions = useTeacherQuery<AttendanceSession[]>(classId ? `attendance/sessions${query({ classId })}` : null);

  // Chưa chọn ngày: lấy buổi mới nhất (hôm nay hoặc gần nhất)
  const activeDate = date || sessions.data?.[0]?.date || "";

  function select(next: { class?: string; date?: string }) {
    const p: Record<string, string> = {};
    const c = next.class ?? classId; if (c) p.class = c;
    const d = next.date ?? (next.class ? "" : date); if (d) p.date = d;
    setParams(p);
  }

  return (
    <div className="t-page">
      <div className="t-row">
        <select className="t-input" value={classId} aria-label="Lớp" onChange={e => select({ class: e.target.value })}>
          {!classes?.length && <option value="">Chưa có lớp</option>}
          {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {classId && <Link className="t-link t-small" to={`/teacher/classes/${classId}`}>Chi tiết lớp & chuyên cần</Link>}
      </div>

      {!classId ? <Empty>Bạn chưa phụ trách lớp nào.</Empty> : (
        <div className="t-attendance">
          <Card>
            <h3 className="t-card-title">Buổi học</h3>
            <QueryState loading={sessions.loading} error={sessions.error} onRetry={sessions.reload}>
              {sessions.data && (sessions.data.length === 0 ? <Empty>Lớp chưa tới buổi học nào (hoặc chưa xếp lịch).</Empty> : (
                <ul className="t-session-list">
                  {sessions.data.map(s => {
                    const done = s.markedCount > 0;
                    return (
                      <li key={s.date}>
                        <button type="button" className={`t-session ${s.date === activeDate ? "active" : ""}`} onClick={() => select({ date: s.date })}>
                          <span>
                            <strong className="t-session__date">{dayNames[dayNo(s.date)]} {fmtDate(s.date)}</strong>
                            {s.isToday && <span className="t-small" style={{ color: "var(--blue)" }}> · Hôm nay</span>}
                            <div className="t-muted t-small">{fmtTime(s.startTime)}–{fmtTime(s.endTime)} · {s.roomName}</div>
                          </span>
                          <span className="t-session__tag">
                            {done
                              ? <Tag tone={s.absentCount > 0 ? "yellow" : "green"}>{s.markedCount}/{s.studentCount}{s.absentCount > 0 ? ` · ${s.absentCount} vắng` : ""}</Tag>
                              : <Tag tone="red">Chưa</Tag>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </QueryState>
          </Card>

          {activeDate
            ? <RosterEditor key={`${classId}-${activeDate}`} classId={Number(classId)} date={activeDate} onSaved={sessions.reload} />
            : <Card><Empty>Chọn một buổi học để điểm danh.</Empty></Card>}
        </div>
      )}
    </div>
  );
}

function RosterEditor({ classId, date, onSaved }: { classId: number; date: string; onSaved: () => void }) {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<AttendanceRoster>(`attendance${query({ classId, date })}`);
  const [rows, setRows] = useState<Record<number, Row>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });

  useEffect(() => {
    if (!data) return;
    setRows(Object.fromEntries(data.items.map(i => [i.studentId, { status: i.status, note: i.note ?? "" }])));
  }, [data]);

  const saved = useMemo(() => data?.items.filter(i => i.status).length ?? 0, [data]);
  const missing = data?.items.filter(i => !rows[i.studentId]?.status).length ?? 0;
  const dirty = !!data && data.items.some(i => {
    const r = rows[i.studentId];
    return r && (r.status !== i.status || r.note.trim() !== (i.note ?? ""));
  });

  function set(studentId: number, patch: Partial<Row>) {
    setRows(r => ({ ...r, [studentId]: { status: r[studentId]?.status ?? null, note: r[studentId]?.note ?? "", ...patch } }));
  }
  function markAllPresent() {
    if (!data) return;
    setRows(r => Object.fromEntries(data.items.map(i => [i.studentId, { status: r[i.studentId]?.status ?? "Present", note: r[i.studentId]?.note ?? "" }])));
  }

  async function save() {
    if (!data) return;
    const items = data.items
      .filter(i => rows[i.studentId]?.status)
      .map(i => ({ studentId: i.studentId, status: rows[i.studentId].status, note: rows[i.studentId].note.trim() || null }));
    if (items.length === 0) { setNotice({ text: "Chưa chọn trạng thái cho học viên nào.", tone: "error" }); return; }
    setBusy(true);
    try {
      const r = await api.send<{ message: string }>("PUT", "attendance", { classId, date, items });
      setNotice({ text: r.message, tone: "ok" });
      reload(); onSaved();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="t-row t-row--between" style={{ marginBottom: 8 }}>
              <div>
                <h3 className="t-card-title" style={{ margin: 0 }}>{dayNames[dayNo(data.date)]} {fmtDate(data.date)}</h3>
                <span className="t-muted t-small">{data.className} · {fmtTime(data.startTime)}–{fmtTime(data.endTime)} · Phòng {data.roomName} · đã lưu {saved}/{data.items.length}</span>
              </div>
              {data.canEdit && <Button variant="outline" onClick={markAllPresent}>Còn lại: có mặt</Button>}
            </div>
            <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
            {!data.canEdit && <p className="t-muted t-small">Chưa tới ngày học, chưa điểm danh được.</p>}
            {data.items.length === 0 ? <Empty>Lớp chưa có học viên.</Empty> : (
              <div className="t-table-wrap">
                <table className="teacher-table">
                  <thead><tr><th>Học viên</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
                  <tbody>
                    {data.items.map(i => {
                      const r = rows[i.studentId] ?? { status: null, note: "" };
                      return (
                        <tr key={i.studentId}>
                          <td>
                            <Link className="t-link" to={`/teacher/students/${i.studentId}`}>{i.fullName}</Link>
                            <div className="t-muted t-small">{i.code}{i.enrollmentStatus !== "Active" ? " · đã nghỉ" : ""}</div>
                          </td>
                          <td>
                            <div className="teacher-attendance-actions">
                              {STATUSES.map(st => (
                                <button key={st} type="button" disabled={!data.canEdit}
                                  className={`teacher-attendance-btn ${r.status === st ? `active is-${st}` : ""}`}
                                  onClick={() => set(i.studentId, { status: st })}>
                                  {attendanceLabel[st]}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td>
                            <input className="t-input t-input--sm" maxLength={300} disabled={!data.canEdit} value={r.note}
                              placeholder={r.status === "Late" ? "Muộn bao lâu..." : r.status === "Excused" ? "Lý do..." : ""}
                              onChange={e => set(i.studentId, { note: e.target.value })} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {data.canEdit && data.items.length > 0 && (
              <div className="t-row t-row--between" style={{ marginTop: 12 }}>
                <span className="t-muted t-small">{missing > 0 ? `${missing} học viên chưa chọn trạng thái (sẽ không lưu)` : "Đã chọn đủ"}</span>
                <Button disabled={busy || !dirty} onClick={save}>{busy ? "Đang lưu..." : "Lưu điểm danh"}</Button>
              </div>
            )}
          </>
        )}
      </QueryState>
    </Card>
  );
}
