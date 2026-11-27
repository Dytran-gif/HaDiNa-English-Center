import { useState } from "react";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import { useStudentApi } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "../../StudentExtra.css";

export default function CourseRegistrationDialog({ course, onClose, onDone }: { course: Course; onClose: () => void; onDone: () => void }) {
  const api = useStudentApi(); const { money } = useLang();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);
  async function register() {
    if (busy || done) return; setBusy(true); setError("");
    try { await api.send("POST", "course-registrations", { courseId: Number(course.id) }); setDone(true); onDone(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Chưa gửi được đăng ký."); }
    finally { setBusy(false); }
  }
  return <div className="sx-overlay" role="presentation" onClick={() => { if (!busy) onClose(); }}><div className="sx-modal" role="dialog" aria-modal="true" aria-labelledby="course-registration-title" onClick={e => e.stopPropagation()}>
    <div className="sx-modal-head"><h3 id="course-registration-title">{done ? "Đã gửi đăng ký khóa học" : "Đăng ký khóa học"}</h3><button className="sx-close" type="button" disabled={busy} onClick={onClose} aria-label="Đóng">×</button></div>
    <h4>{course.name}</h4>
    {done ? <p role="status">Yêu cầu đang chờ trung tâm xếp lớp. Lớp học, giáo viên và lịch học sẽ xuất hiện trong Khóa của tôi sau khi Admin xác nhận.</p> : <><dl className="sx-dl"><dt>Trình độ</dt><dd>Band {course.bandFrom} → {course.bandTo}</dd><dt>Thời lượng</dt><dd>{course.totalSessions} buổi · {course.sessionsPerWeek} buổi/tuần</dd><dt>Học phí tham khảo trước giảm</dt><dd>{money(course.tuition)}</dd></dl><p>Đăng ký này chưa ghi danh vào lớp và chưa phát sinh phiếu thu. Trung tâm sẽ xác nhận lớp và học phí khi xếp lớp.</p></>}
    {error && <p className="sx-error" role="alert">{error}</p>}
    <div className="sx-modal-foot"><button className="sx-btn" type="button" disabled={busy} onClick={onClose}>{done ? "Đóng" : "Hủy"}</button>{!done && <button className="sx-btn is-primary" type="button" disabled={busy} onClick={() => void register()}>{busy ? "Đang gửi…" : "Gửi đăng ký khóa học"}</button>}</div>
  </div></div>;
}
