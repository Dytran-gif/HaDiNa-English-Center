import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { AttendanceSummary, ClassStudent, FeedbackItem, TeacherClassDetail } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { FeedbackComposer, FeedbackList } from "../Components/Common/FeedbackParts";
import { classStatusLabel, dayNames, enrollmentLabel, fmtDate, fmtTime } from "../Components/Common/format";

export default function ClassDetail() {
  const { id } = useParams();
  const { data: c, loading, error, reload } = useTeacherQuery<TeacherClassDetail>(`classes/${id}`);
  const feedbacks = useTeacherQuery<FeedbackItem[]>(`feedbacks?classId=${id}`);
  const att = useTeacherQuery<AttendanceSummary>(`attendance/summary?classId=${id}`);
  const [target, setTarget] = useState<ClassStudent | null>(null);

  return (
    <div className="t-page">
      <Link className="t-link t-small" to="/teacher/classes">‹ Lớp phụ trách</Link>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {c && (
          <>
            <Card>
              <div className="t-row t-row--between">
                <h2 style={{ margin: 0 }}>{c.name}</h2>
                <StatusTag status={c.status} labels={classStatusLabel} />
              </div>
              <dl className="t-kv" style={{ marginTop: 12 }}>
                <dt>Khóa học</dt><dd>{c.courseName} ({c.totalSessions} buổi)</dd>
                <dt>Thời gian</dt><dd>{fmtDate(c.startDate)} – {fmtDate(c.endDate)}</dd>
                <dt>Sĩ số</dt><dd>{c.enrolledCount}/{c.maxStudents}</dd>
                <dt>Lịch học</dt>
                <dd>{c.schedules.length === 0 ? "Chưa xếp lịch" : c.schedules.map((s, i) => (
                  <div key={i}>{dayNames[s.dayOfWeek]} {fmtTime(s.startTime)}–{fmtTime(s.endTime)} · Phòng {s.roomName}</div>
                ))}</dd>
                {c.meetingUrl && <><dt>Học online</dt><dd><a className="t-link" href={c.meetingUrl} target="_blank" rel="noreferrer">{c.meetingUrl}</a></dd></>}
              </dl>
              <div className="t-row" style={{ marginTop: 12 }}>
                <Link className="t-link t-small" to={`/teacher/attendance?class=${c.id}`}>Điểm danh</Link>
                <Link className="t-link t-small" to={`/teacher/assignments?course=${c.courseId}`}>Bài tập của khóa</Link>
              </div>
            </Card>

            <Card padded={false} className="t-table-wrap">
              <div style={{ padding: "16px 16px 0" }}>
                <h3 className="t-card-title">Học viên ({c.students.length})</h3>
                {att.data && <p className="t-muted t-small" style={{ marginTop: -6 }}>Đã điểm danh {att.data.markedDays}/{att.data.heldDays} buổi đã học. Chuyên cần = (có mặt + muộn) / số buổi đã điểm danh.</p>}
              </div>
              {c.students.length === 0 ? <div style={{ padding: 16 }}><Empty>Lớp chưa có học viên ghi danh.</Empty></div> : (
                <table className="teacher-table">
                  <thead><tr><th>Mã</th><th>Họ tên</th><th>Liên hệ</th><th>Trạng thái</th><th>Chuyên cần</th><th></th></tr></thead>
                  <tbody>
                    {c.students.map(s => (
                      <tr key={s.id}>
                        <td>{s.code}</td>
                        <td><Link className="t-link" to={`/teacher/students/${s.id}`}>{s.fullName}</Link></td>
                        <td>{s.phone ?? "—"}<div className="t-muted t-small">{s.email}</div></td>
                        <td><StatusTag status={s.enrollmentStatus} labels={enrollmentLabel} /></td>
                        <td><AttendanceCell row={att.data?.items.find(x => x.studentId === s.id)} /></td>
                        <td><button type="button" className="teacher-action-link" onClick={() => setTarget(s)}>Nhận xét</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card>
              <h3 className="t-card-title">Nhận xét đã gửi trong lớp</h3>
              <QueryState loading={feedbacks.loading} error={feedbacks.error} onRetry={feedbacks.reload}>
                {feedbacks.data && <FeedbackList items={feedbacks.data} onChanged={feedbacks.reload} showClass={false} />}
              </QueryState>
            </Card>

            <Modal open={target !== null} title={`Nhận xét: ${target?.fullName ?? ""}`} onClose={() => setTarget(null)}>
              {target && (
                <FeedbackComposer classId={c.id} studentId={target.id}
                  onSent={() => { feedbacks.reload(); setTarget(null); }} />
              )}
            </Modal>
          </>
        )}
      </QueryState>
    </div>
  );
}

function AttendanceCell({ row }: { row?: AttendanceSummary["items"][number] }) {
  if (!row || row.total === 0) return <span className="t-muted t-small">—</span>;
  const low = (row.attendanceRate ?? 100) < 80;
  return (
    <span>
      <strong className={low ? "t-danger-text" : ""}>{row.attendanceRate}%</strong>
      <div className="t-muted t-small">
        {row.present} có mặt{row.late ? ` · ${row.late} muộn` : ""}{row.absent ? ` · ${row.absent} vắng` : ""}{row.excused ? ` · ${row.excused} phép` : ""}
      </div>
    </span>
  );
}
