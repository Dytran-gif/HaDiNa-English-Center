import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Button from "../../../components/ui/Button";
import { query, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { ScheduleEvent } from "../../../types/teacherApi";
import { QueryState } from "../Components/Common/Feedback";
import { addDays, dayNames, dayNo, fmtDate, fmtTime, todayStr } from "../Components/Common/format";

/** Thứ Hai của tuần chứa ngày date */
function mondayOf(date: string) {
  return addDays(date, 1 - dayNo(date));
}

export default function Schedule() {
  const [monday, setMonday] = useState(() => mondayOf(todayStr()));
  const sunday = addDays(monday, 6);
  const { data, loading, error, reload } = useTeacherQuery<ScheduleEvent[]>(`schedule${query({ from: monday, to: sunday })}`);
  const today = todayStr();
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <div className="t-page">
      <div className="t-row t-row--between">
        <div className="t-row">
          <Button variant="ghost" onClick={() => setMonday(addDays(monday, -7))}>‹ Tuần trước</Button>
          <Button variant="outline" onClick={() => setMonday(mondayOf(today))}>Tuần này</Button>
          <Button variant="ghost" onClick={() => setMonday(addDays(monday, 7))}>Tuần sau ›</Button>
        </div>
        <strong>{fmtDate(monday)} – {fmtDate(sunday)}</strong>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        <div className="t-week">
          {days.map(d => {
            const events = data?.filter(e => e.date === d) ?? [];
            return (
              <div key={d} className={`t-day ${d === today ? "t-day--today" : ""}`}>
                <div className="t-day__head"><span>{dayNames[dayNo(d)]}</span><span className="t-muted">{fmtDate(d).slice(0, 5)}</span></div>
                {events.length === 0 && <span className="t-muted t-small">Trống</span>}
                {events.map((e, i) => (
                  <Link key={i} className="t-event" to={d <= today ? `/teacher/attendance?class=${e.classId}&date=${d}` : `/teacher/classes/${e.classId}`}>
                    <strong>{fmtTime(e.startTime)}–{fmtTime(e.endTime)}</strong>
                    <span>{e.className}</span>
                    <span className="t-muted">Phòng {e.roomName}</span>
                    {d <= today && <span className={e.attendanceMarked ? "t-muted" : "t-danger-text"}>{e.attendanceMarked ? "✓ Đã điểm danh" : "Chưa điểm danh"}</span>}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}
