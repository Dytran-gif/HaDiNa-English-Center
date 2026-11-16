import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherDashboard } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDate, fmtDateTime, fmtTime } from "../Components/Common/format";

export default function Dashboard() {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<TeacherDashboard>("dashboard");
  const [notice, setNotice] = useState("");

  async function download(id: number, name: string) {
    try { await api.download(`submissions/${id}/download`, name); }
    catch (e) { setNotice(errorMessage(e)); }
  }

  return (
    <div className="t-page">
      <Notice message={notice} tone="error" onClose={() => setNotice("")} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="t-grid--stats">
              <div className="t-stat"><span className="t-stat__value">{data.ongoingClassCount}/{data.classCount}</span><span className="t-stat__label"><Link className="t-link" to="/teacher/classes">Lớp đang dạy / tổng</Link></span></div>
              <div className="t-stat"><span className="t-stat__value">{data.studentCount}</span><span className="t-stat__label"><Link className="t-link" to="/teacher/students">Học viên đang học</Link></span></div>
              <div className="t-stat"><span className="t-stat__value">{data.today.length}</span><span className="t-stat__label"><Link className="t-link" to="/teacher/schedule">Buổi dạy hôm nay</Link></span></div>
              <div className={`t-stat ${data.unmarkedSessions.length > 0 ? "t-stat--warn" : ""}`}><span className="t-stat__value">{data.unmarkedSessions.length}</span><span className="t-stat__label"><Link className="t-link" to="/teacher/attendance">Buổi chưa điểm danh (7 ngày)</Link></span></div>
              <div className="t-stat"><span className="t-stat__value">{data.assignmentCount}</span><span className="t-stat__label"><Link className="t-link" to="/teacher/assignments">Bài tập đã giao</Link></span></div>
              <div className={`t-stat ${data.newSubmissionCount > 0 ? "t-stat--warn" : ""}`}><span className="t-stat__value">{data.newSubmissionCount}</span><span className="t-stat__label">Bài nộp 7 ngày qua</span></div>
            </div>

            <div className="t-grid--2">
              <Card>
                <h3 className="t-card-title">Lịch dạy hôm nay</h3>
                {data.today.length === 0 ? <Empty>Hôm nay không có buổi dạy.</Empty> : (
                  <ul className="t-list">
                    {data.today.map((e, i) => (
                      <li key={i}>
                        <div>
                          <strong>{fmtTime(e.startTime)}–{fmtTime(e.endTime)}</strong>{" "}
                          <Link className="t-link" to={`/teacher/classes/${e.classId}`}>{e.className}</Link>
                          <div className="t-muted t-small">{e.courseName} · Phòng {e.roomName}</div>
                        </div>
                        <div className="t-row" style={{ gap: 10 }}>
                          {e.meetingUrl && <a className="t-link t-small" href={e.meetingUrl} target="_blank" rel="noreferrer">Link online</a>}
                          <Link className="t-link t-small" to={`/teacher/attendance?class=${e.classId}&date=${e.date}`}>{e.attendanceMarked ? "✓ Đã điểm danh" : "Điểm danh"}</Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {data.unmarkedSessions.length > 0 && (
                <Card>
                  <h3 className="t-card-title">Buổi chưa điểm danh</h3>
                  <ul className="t-list">
                    {data.unmarkedSessions.map(e => (
                      <li key={`${e.classId}-${e.date}`}>
                        <div>
                          <strong>{fmtDate(e.date)}</strong> {fmtTime(e.startTime)}–{fmtTime(e.endTime)}
                          <div className="t-muted t-small">{e.className}</div>
                        </div>
                        <Link className="t-link t-small" to={`/teacher/attendance?class=${e.classId}&date=${e.date}`}>Điểm danh</Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card>
                <h3 className="t-card-title">Bài nộp gần đây</h3>
                {data.recentSubmissions.length === 0 ? <Empty>Chưa có học viên nộp bài.</Empty> : (
                  <ul className="t-list">
                    {data.recentSubmissions.map(s => (
                      <li key={s.id}>
                        <div>
                          <strong>{s.studentName}</strong> <span className="t-muted t-small">({s.studentCode})</span>
                          <div className="t-muted t-small">{s.assignmentTitle} · {fmtDateTime(s.submittedAt)}</div>
                        </div>
                        {s.hasFile
                          ? <button type="button" className="teacher-action-link" onClick={() => download(s.id, "bai-nop")}>Tải bài</button>
                          : <span className="t-muted t-small">File đã dọn</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
