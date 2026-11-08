import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { errorMessage, query, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { ScheduleEvent, ScheduleResponse } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import {
  addDays, dayNames, dayNo, eventKindLabel, fmtDate, fmtTime, fromInputTime, sessionStatusLabel, todayStr,
} from "../Components/Common/format";

type Tab = "calendar" | "availability";

export default function Schedule() {
  const [tab, setTab] = useState<Tab>("calendar");
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  return (
    <div className="t-page">
      <div className="t-tabs">
        {([["calendar", "Lịch dạy"], ["availability", "Lịch rảnh (1 kèm 1)"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} type="button" className={`t-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      {tab === "calendar" && <CalendarTab />}
      {tab === "availability" && <AvailabilityTab onNotice={setNotice} />}
    </div>
  );
}

type NoticeFn = (n: { text: string; tone: "ok" | "error" }) => void;

function CalendarTab() {
  const [view, setView] = useState<"week" | "month">("week");
  const [date, setDate] = useState(todayStr());
  const { data, loading, error, reload } = useTeacherQuery<ScheduleResponse>(`schedule${query({ view, date, includeAvailability: true })}`);

  return (
    <>
      <div className="t-row t-row--between">
        <div className="t-row">
          <Button variant="outline" onClick={() => data && setDate(data.previous)}>‹ Trước</Button>
          <Button variant="ghost" onClick={() => setDate(todayStr())}>Hôm nay</Button>
          <Button variant="outline" onClick={() => data && setDate(data.next)}>Sau ›</Button>
          {data && <span className="t-strong">{fmtDate(data.from)} – {fmtDate(data.to)}</span>}
        </div>
        <div className="t-row">
          <button type="button" className={`teacher-attendance-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>Tuần</button>
          <button type="button" className={`teacher-attendance-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>Tháng</button>
        </div>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (view === "week" ? (
          <div className="t-week">
            {data.days.map(d => (
              <div key={d.date} className={`t-day ${d.isToday ? "t-day--today" : ""}`}>
                <div className="t-day__head"><span>{dayNames[d.dayOfWeek]}</span><span className="t-muted">{fmtDate(d.date).slice(0, 5)}</span></div>
                {d.events.length === 0 && <span className="t-muted t-small">Trống</span>}
                {d.events.map(e => <EventBox key={`${e.kind}-${e.id}`} e={e} />)}
                {data.availability?.filter(a => a.date === d.date).map(a => (
                  <div key={`slot-${a.id}`} className="t-event t-event--slot">
                    <strong>{fmtTime(a.startTime)}–{fmtTime(a.endTime)} · Rảnh</strong>
                    <span>{a.isBooked ? "Đã có HV đặt" : "Chưa ai đặt"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : <MonthGrid data={data} />)}
        {data && data.events.length === 0 && <Empty>Không có buổi dạy trong khoảng này.</Empty>}
      </QueryState>
    </>
  );
}

function EventBox({ e }: { e: ScheduleEvent }) {
  const cls = `t-event t-event--${e.kind} ${e.status === "Cancelled" ? "t-event--Cancelled" : ""}`;
  const body = (
    <>
      <strong>{fmtTime(e.startTime)}–{fmtTime(e.endTime)}</strong>
      <span>{e.title}{e.sessionNo ? ` · B${e.sessionNo}` : ""}</span>
      <span className="t-muted">{eventKindLabel[e.kind]}{e.roomName ? ` · ${e.roomName}` : ""}{e.enrolledCount != null ? ` · ${e.enrolledCount}/${e.maxStudents}` : ""}</span>
      <span><StatusTag status={e.status} labels={sessionStatusLabel} /> {e.attendanceTaken && <Tag tone="green">ĐD</Tag>}</span>
    </>
  );
  if (e.kind === "OneOnOne") return <div className={cls}>{body}{e.meetingUrl && <a className="t-link" href={e.meetingUrl} target="_blank" rel="noreferrer">Link online</a>}</div>;
  return (
    <div className={cls}>
      <Link to={`/teacher/sessions/${e.id}`} style={{ color: "inherit", textDecoration: "none", display: "flex", flexDirection: "column", gap: 2 }}>{body}</Link>
    </div>
  );
}

function MonthGrid({ data }: { data: ScheduleResponse }) {
  // Đệm đầu tháng cho đủ tuần bắt đầu từ Thứ 2
  const lead = dayNo(data.from) - 1;
  const cells: (string | null)[] = [...Array.from({ length: lead }, () => null), ...data.days.map(d => d.date)];
  while (cells.length % 7) cells.push(null);
  return (
    <div className="t-month">
      {dayNames.slice(1).map(n => <div key={n} className="t-muted t-small t-strong" style={{ textAlign: "center" }}>{n}</div>)}
      {cells.map((date, i) => {
        if (!date) return <div key={`x${i}`} className="t-day t-day--out" />;
        const day = data.days.find(d => d.date === date)!;
        return (
          <div key={date} className={`t-day ${day.isToday ? "t-day--today" : ""}`}>
            <div className="t-day__head"><span>{Number(date.slice(8))}</span></div>
            {day.events.map(e => (
              <Link key={`${e.kind}-${e.id}`} to={e.kind === "OneOnOne" ? "/teacher/requests?tab=oneonone" : `/teacher/sessions/${e.id}`}
                className={`t-event t-event--${e.kind} ${e.status === "Cancelled" ? "t-event--Cancelled" : ""}`}>
                <strong>{fmtTime(e.startTime)} {e.title}</strong>
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function AvailabilityTab({ onNotice }: { onNotice: NoticeFn }) {
  const api = useTeacherApi();
  const from = todayStr();
  const to = addDays(from, 60);
  const { data, loading, error, reload } = useTeacherQuery<ScheduleResponse["availability"]>(`schedule/availability${query({ from, to })}`);
  const [form, setForm] = useState({ date: from, startTime: "19:00", endTime: "20:00", note: "", repeatWeeks: 1 });
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const r = await api.send<{ created: unknown[]; skipped: string[] }>("POST", "schedule/availability", {
        ...form, startTime: fromInputTime(form.startTime), endTime: fromInputTime(form.endTime), note: form.note || null,
      });
      onNotice({ text: `Đã tạo ${r.created.length} khung giờ${r.skipped.length ? `. Bỏ qua: ${r.skipped.join("; ")}` : ""}`, tone: "ok" });
      reload();
    } catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }
  async function remove(id: number) {
    try { await api.send("DELETE", `schedule/availability/${id}`); onNotice({ text: "Đã xóa khung giờ", tone: "ok" }); reload(); }
    catch (e) { onNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-grid--2">
      <Card>
        <h3 className="t-card-title">Khai báo giờ rảnh</h3>
        <p className="t-muted t-small" style={{ marginTop: 0 }}>Học viên đặt lịch 1 kèm 1 vào các khung này; bạn duyệt ở trang Yêu cầu.</p>
        <div className="t-form">
          <div className="t-form-grid">
            <label><span className="t-label">Ngày</span><input className="t-input" type="date" min={from} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
            <label><span className="t-label">Từ</span><input className="t-input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></label>
            <label><span className="t-label">Đến</span><input className="t-input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></label>
            <label><span className="t-label">Lặp lại (tuần)</span><input className="t-input" type="number" min={1} max={12} value={form.repeatWeeks} onChange={e => setForm({ ...form, repeatWeeks: Number(e.target.value) || 1 })} /></label>
          </div>
          <label><span className="t-label">Ghi chú</span><input className="t-input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
          <div className="t-actions"><Button disabled={busy} onClick={add}>+ Thêm khung giờ</Button></div>
        </div>
      </Card>
      <Card>
        <h3 className="t-card-title">Khung giờ 60 ngày tới</h3>
        <QueryState loading={loading} error={error} onRetry={reload}>
          {data && data.length === 0 ? <Empty>Chưa khai báo khung giờ rảnh.</Empty> : (
            <ul className="t-list">
              {data?.map(a => (
                <li key={a.id}>
                  <div>
                    <div className="t-strong">{dayNames[dayNo(a.date)]} {fmtDate(a.date)} · {fmtTime(a.startTime)}–{fmtTime(a.endTime)}</div>
                    {a.note && <div className="t-muted">{a.note}</div>}
                  </div>
                  <div className="t-row">
                    {a.isBooked ? <Tag tone="green">Đã có HV đặt</Tag> : <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(a.id)}>Xóa</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </Card>
    </div>
  );
}
