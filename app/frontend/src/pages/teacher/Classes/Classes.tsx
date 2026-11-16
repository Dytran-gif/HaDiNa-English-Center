import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherClass } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { classStatusLabel, dayNames, fmtDate, fmtTime } from "../Components/Common/format";

const filters = [
  { value: "", label: "Tất cả" },
  { value: "Ongoing", label: "Đang học" },
  { value: "Upcoming", label: "Sắp mở" },
  { value: "Finished", label: "Đã kết thúc" },
];

export default function Classes() {
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useTeacherQuery<TeacherClass[]>(`classes${status ? `?status=${status}` : ""}`);

  return (
    <div className="t-page">
      <div className="t-tabs">
        {filters.map(f => (
          <button key={f.value} type="button" className={`t-tab ${status === f.value ? "active" : ""}`} onClick={() => setStatus(f.value)}>
            {f.label}
          </button>
        ))}
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && data.length === 0 && <Empty>Chưa có lớp nào. Lớp do Admin tạo và phân công cho giáo viên.</Empty>}
        <div className="t-grid">
          {data?.map(c => <ClassCard key={c.id} c={c} />)}
        </div>
      </QueryState>
    </div>
  );
}

function ClassCard({ c }: { c: TeacherClass }) {
  return (
    <Card>
      <div className="t-row t-row--between" style={{ marginBottom: 8 }}>
        <StatusTag status={c.status} labels={classStatusLabel} />
        <span className="t-muted">{c.enrolledCount}/{c.maxStudents} học viên</span>
      </div>
      <h3 style={{ margin: "0 0 4px" }}><Link className="t-link" to={`/teacher/classes/${c.id}`}>{c.name}</Link></h3>
      <p className="t-muted" style={{ margin: "0 0 10px" }}>{c.courseName} · {fmtDate(c.startDate)} – {fmtDate(c.endDate)}</p>
      <ul className="t-muted" style={{ margin: "0 0 12px", paddingLeft: 18 }}>
        {c.schedules.map((s, i) => (
          <li key={i}>{dayNames[s.dayOfWeek]} {fmtTime(s.startTime)}–{fmtTime(s.endTime)} · {s.roomName}</li>
        ))}
      </ul>
      <div className="t-row" style={{ marginTop: 14 }}>
        <Link className="t-link t-small" to={`/teacher/classes/${c.id}`}>Chi tiết lớp</Link>
        <Link className="t-link t-small" to={`/teacher/attendance?class=${c.id}`}>Điểm danh</Link>
        <Link className="t-link t-small" to={`/teacher/assignments?course=${c.courseId}`}>Bài tập</Link>
        {c.meetingUrl && <a className="t-link t-small" href={c.meetingUrl} target="_blank" rel="noreferrer">Link học online</a>}
      </div>
    </Card>
  );
}
