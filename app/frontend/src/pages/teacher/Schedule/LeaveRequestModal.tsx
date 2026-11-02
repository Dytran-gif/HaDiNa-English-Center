import { useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { errorMessage, useTeacherApi } from "../../../services/teacher/teacherApi";
import { Notice } from "../Components/Common/Feedback";
import { fromInputTime } from "../Components/Common/format";

// Đơn xin nghỉ / đổi buổi gửi Admin duyệt (POST api/teacher/schedule/leave-requests)
export function LeaveRequestModal({ open, session, onClose, onDone }: {
  open: boolean; session: { id: number; label: string } | null; onClose: () => void; onDone: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [type, setType] = useState<"Leave" | "Reschedule">("Leave");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!session) return;
    setSaving(true); setError("");
    try {
      const hasMakeup = date && start && end;
      const r = await api.send<{ message: string }>("POST", "schedule/leave-requests", {
        type, sessionId: session.id, reason,
        proposedDate: hasMakeup ? date : null,
        proposedStartTime: hasMakeup ? fromInputTime(start) : null,
        proposedEndTime: hasMakeup ? fromInputTime(end) : null,
      });
      setReason(""); setDate(""); setStart(""); setEnd("");
      onDone(r.message);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }

  return (
    <Modal open={open} title="Xin nghỉ / đổi buổi" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button disabled={saving || !reason.trim() || (type === "Reschedule" && !(date && start && end))} onClick={submit}>{saving ? "Đang gửi..." : "Gửi Admin duyệt"}</Button></>}>
      <div className="t-form">
        <Notice message={error} tone="error" />
        <div className="t-muted">{session?.label}</div>
        <div className="t-row">
          <label className="t-check"><input type="radio" checked={type === "Leave"} onChange={() => setType("Leave")} /> Xin nghỉ</label>
          <label className="t-check"><input type="radio" checked={type === "Reschedule"} onChange={() => setType("Reschedule")} /> Đổi buổi</label>
        </div>
        <label><span className="t-label">Lý do *</span><textarea className="t-input" value={reason} onChange={e => setReason(e.target.value)} /></label>
        <span className="t-label">Buổi bù đề xuất {type === "Reschedule" ? "*" : "(không bắt buộc)"}</span>
        <div className="t-form-grid">
          <input className="t-input" type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Ngày bù" />
          <input className="t-input" type="time" value={start} onChange={e => setStart(e.target.value)} aria-label="Giờ bắt đầu" />
          <input className="t-input" type="time" value={end} onChange={e => setEnd(e.target.value)} aria-label="Giờ kết thúc" />
        </div>
        <p className="t-muted t-small" style={{ margin: 0 }}>
          Đơn do Admin duyệt. Theo dõi trạng thái ở trang Lịch dạy → Đơn đã gửi.
        </p>
      </div>
    </Modal>
  );
}
