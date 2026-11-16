import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { errorMessage, useTeacherApi } from "../../../../services/teacher/teacherApi";
import type { FeedbackItem } from "../../../../types/teacherApi";
import { Empty, Notice } from "./Feedback";
import { fmtDateTime } from "./format";

const MAX = 1000;

/** Ô viết nhận xét cho 1 học viên ở 1 lớp (bảng StudentFeedbacks) */
export function FeedbackComposer({ classId, studentId, onSent, placeholder }: {
  classId?: number; studentId?: number; onSent: () => void; placeholder?: string;
}) {
  const api = useTeacherApi();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  const ready = !!classId && !!studentId && content.trim().length > 0 && content.length <= MAX;

  async function send() {
    if (!ready) return;
    setBusy(true);
    try {
      await api.send("POST", "feedbacks", { classId, studentId, content: content.trim() });
      setContent("");
      setNotice({ text: "Đã gửi nhận xét. Học viên xem ở trang Feedback.", tone: "ok" });
      onSent();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }

  return (
    <div className="t-form">
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <textarea className="t-input" rows={4} maxLength={MAX} value={content}
        placeholder={placeholder ?? "Nhận xét về thái độ, tiến bộ, điểm cần cải thiện..."}
        onChange={e => setContent(e.target.value)} />
      <div className="t-row t-row--between">
        <span className="t-muted t-small">{content.length}/{MAX}</span>
        <Button disabled={!ready || busy} onClick={send}>{busy ? "Đang gửi..." : "Gửi nhận xét"}</Button>
      </div>
    </div>
  );
}

/** Danh sách nhận xét, xóa được nhận xét của chính mình */
export function FeedbackList({ items, onChanged, showStudent = true, showClass = true }: {
  items: FeedbackItem[]; onChanged: () => void; showStudent?: boolean; showClass?: boolean;
}) {
  const api = useTeacherApi();
  const [error, setError] = useState("");

  async function remove(f: FeedbackItem) {
    if (!window.confirm("Xóa nhận xét này? Học viên sẽ không còn thấy nữa.")) return;
    try { await api.send("DELETE", `feedbacks/${f.id}`); onChanged(); }
    catch (e) { setError(errorMessage(e)); }
  }

  if (items.length === 0) return <Empty>Chưa có nhận xét nào.</Empty>;
  return (
    <>
      <Notice message={error} tone="error" onClose={() => setError("")} />
      <ul className="t-list">
        {items.map(f => (
          <li key={f.id}>
            <div style={{ flex: 1 }}>
              <div className="t-small t-muted">
                {showStudent && <><Link className="t-link" to={`/teacher/students/${f.studentId}`}>{f.studentName}</Link> ({f.studentCode}) · </>}
                {showClass && <>{f.className} · </>}
                {fmtDateTime(f.createdAt)}
              </div>
              <div className="t-pre" style={{ marginTop: 4 }}>{f.content}</div>
            </div>
            <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => remove(f)}>Xóa</button>
          </li>
        ))}
      </ul>
    </>
  );
}
