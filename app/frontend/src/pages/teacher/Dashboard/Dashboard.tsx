import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherDashboard } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { eventKindLabel, fmtDate, fmtDateTime, fmtTime, requestTypeLabel, sessionStatusLabel } from "../Components/Common/format";

export default function Dashboard() {
  const { data, loading, error, reload } = useTeacherQuery<TeacherDashboard>("dashboard");

  return (
    <div className="t-page">
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && <DashboardBody data={data} />}
      </QueryState>
    </div>
  );
}

function DashboardBody({ data }: { data: TeacherDashboard }) {
  const { stats, grading, shortcuts } = data;
  return (
    <>
      <div className="t-row t-row--between">
        <div>
          <h2 style={{ margin: 0 }}>Xin chào, {data.teacherName}</h2>
          <p className="t-muted" style={{ margin: "4px 0 0" }}>Hôm nay {fmtDate(data.today)}</p>
        </div>
        <div className="t-row">
          {shortcuts.attendanceSessionId && (
            <Button to={`/teacher/attendance?session=${shortcuts.attendanceSessionId}`}>Điểm danh buổi hôm nay</Button>
          )}
          {shortcuts.nextSubmissionId && (
            <Button variant="outline" to={`/teacher/grading/${shortcuts.nextSubmissionId}`}>Chấm bài tiếp theo</Button>
          )}
        </div>
      </div>

      <div className="t-grid--stats">
        <div className="t-stat"><span className="t-stat__value">{stats.ongoingClasses}</span><span className="t-stat__label">Lớp đang dạy</span></div>
        <div className="t-stat"><span className="t-stat__value">{stats.activeStudents}</span><span className="t-stat__label">Học viên đang học</span></div>
        <div className="t-stat"><span className="t-stat__value">{stats.sessionsToday}</span><span className="t-stat__label">Buổi dạy hôm nay</span></div>
        <div className={`t-stat ${grading.overdue > 0 ? "t-stat--warn" : ""}`}>
          <span className="t-stat__value">{stats.pendingGrading}</span>
          <span className="t-stat__label">Bài chờ chấm{grading.overdue > 0 ? ` · ${grading.overdue} trễ 24h` : ""}</span>
        </div>
      </div>

      <div className="t-grid--2">
        <Card>
          <h3 className="t-card-title">Lịch dạy hôm nay <Link className="t-link t-small" to="/teacher/schedule">Xem lịch tuần</Link></h3>
          {data.todaySchedule.length === 0 ? <Empty>Hôm nay không có buổi dạy.</Empty> : (
            <ul className="t-list">
              {data.todaySchedule.map(s => (
                <li key={`${s.kind}-${s.sessionId}`}>
                  <div>
                    <div className="t-strong">{fmtTime(s.startTime)}–{fmtTime(s.endTime)} · {s.title}</div>
                    <div className="t-muted">
                      {eventKindLabel[s.kind]}{s.sessionNo ? ` · Buổi ${s.sessionNo}` : ""}
                      {s.roomName ? ` · Phòng ${s.roomName}` : ""}
                      {s.enrolledCount != null ? ` · ${s.enrolledCount}/${s.maxStudents} HV` : ""}
                    </div>
                  </div>
                  <div className="t-row">
                    <StatusTag status={s.status} labels={sessionStatusLabel} />
                    {s.kind !== "OneOnOne" && (
                      s.attendanceTaken ? <Tag tone="green">Đã điểm danh</Tag>
                        : <Link className="t-link t-small" to={`/teacher/attendance?session=${s.sessionId}`}>Điểm danh</Link>
                    )}
                    {s.kind !== "OneOnOne" && <Link className="t-link t-small" to={`/teacher/sessions/${s.sessionId}`}>Chi tiết</Link>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="t-card-title">Bài chờ chấm <Link className="t-link t-small" to="/teacher/grading">Mở trang chấm bài</Link></h3>
          <div className="t-grid--stats">
            <div className="t-stat"><span className="t-stat__value">{grading.writing}</span><span className="t-stat__label">Writing</span></div>
            <div className="t-stat"><span className="t-stat__value">{grading.speaking}</span><span className="t-stat__label">Speaking</span></div>
            <div className={`t-stat ${grading.overdue ? "t-stat--warn" : ""}`}><span className="t-stat__value">{grading.overdue}</span><span className="t-stat__label">Trễ hạn chấm 24h</span></div>
          </div>
        </Card>
      </div>

      <div className="t-grid--2">
        <Card>
          <h3 className="t-card-title">Học viên cần chú ý</h3>
          {data.attentionStudents.length === 0 ? <Empty>Chưa có học viên nào cần chú ý.</Empty> : (
            <ul className="t-list">
              {data.attentionStudents.map(s => (
                <li key={`${s.classId}-${s.studentId}`}>
                  <div>
                    <Link className="t-link" to={`/teacher/students/${s.studentId}`}>{s.fullName}</Link>
                    <span className="t-muted"> · {s.code} · {s.className}</span>
                    <div className="t-row" style={{ marginTop: 6 }}>{s.reasons.map(r => <Tag key={r} tone="red">{r}</Tag>)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="t-card-title">
            Yêu cầu chờ xử lý ({data.pendingRequests.count})
            <Link className="t-link t-small" to="/teacher/requests">Xem tất cả</Link>
          </h3>
          {data.pendingRequests.items.length === 0 ? <Empty>Không có yêu cầu nào đang chờ.</Empty> : (
            <ul className="t-list">
              {data.pendingRequests.items.map(r => (
                <li key={r.id}>
                  <div>
                    <div className="t-strong">{requestTypeLabel[r.type] ?? r.type} · {r.studentName}</div>
                    <div className="t-muted">{r.className ?? ""}{r.date ? ` · ngày ${fmtDate(r.date)}` : ""}{r.reason ? ` · ${r.reason}` : ""}</div>
                  </div>
                  <span className="t-muted t-small">{fmtDateTime(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="t-card-title">
          Thông báo mới {data.notifications.unreadCount > 0 && <span className="t-badge">{data.notifications.unreadCount}</span>}
          <Link className="t-link t-small" to="/teacher/requests?tab=notifications">Tất cả thông báo</Link>
        </h3>
        {data.notifications.latest.length === 0 ? <Empty>Chưa có thông báo.</Empty> : (
          <ul className="t-list">
            {data.notifications.latest.map(n => (
              <li key={n.id}>
                <div>
                  <div className={n.isRead ? "" : "t-strong"}>{n.title}</div>
                  {n.content && <div className="t-muted">{n.content}</div>}
                </div>
                <span className="t-muted t-small">{fmtDateTime(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
