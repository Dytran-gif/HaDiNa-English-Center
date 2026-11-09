import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { errorMessage, useTeacherApi } from "../../../services/teacher/teacherApi";
import type { ReviewPeriod, StudentReviewBody } from "../../../types/teacherApi";
import { Notice } from "../Components/Common/Feedback";
import { periodLabel, reviewFields } from "./reviewFields";

// Form viết / sửa nhận xét định kỳ cho một học viên.
// Dùng ở trang hồ sơ học viên và ở tab "Học viên" của trang chi tiết lớp.
export function ReviewFormModal({ studentId, studentName, classes, value, onClose, onSaved }: {
  studentId: number;
  studentName?: string;
  classes: { id: number; name: string }[];
  value: (StudentReviewBody & { id?: number }) | null;   // null = đóng
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [form, setForm] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setForm(value); setError(""); }, [value]);

  async function save() {
    if (!form) return;
    setSaving(true); setError("");
    try {
      const { id: rid, ...body } = form;
      if (rid) await api.send("PUT", `students/${studentId}/reviews/${rid}`, body);
      else await api.send("POST", `students/${studentId}/reviews`, body);
      onSaved("Đã lưu nhận xét");
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }

  const title = `${form?.id ? "Sửa nhận xét" : "Viết nhận xét"}${studentName ? ` · ${studentName}` : ""}`;
  return (
    <Modal open={value !== null} title={title} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu"}</Button></>}>
      {form && (
        <div className="t-form" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Notice message={error} tone="error" />
          <div className="t-form-grid">
            <label><span className="t-label">Lớp</span>
              <select className="t-input" style={{ width: "100%" }} value={form.classId} onChange={e => setForm({ ...form, classId: Number(e.target.value) })}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></label>
            <label><span className="t-label">Kỳ</span>
              <select className="t-input" style={{ width: "100%" }} value={form.period} onChange={e => setForm({ ...form, period: e.target.value as ReviewPeriod })}>
                {(Object.keys(periodLabel) as ReviewPeriod[]).map(k => <option key={k} value={k}>{periodLabel[k]}</option>)}
              </select></label>
            <label><span className="t-label">Nhãn kỳ</span><input className="t-input" style={{ width: "100%" }} value={form.periodLabel ?? ""} onChange={e => setForm({ ...form, periodLabel: e.target.value })} /></label>
          </div>
          {reviewFields.map(([k, l]) => (
            <label key={k}><span className="t-label">{l}</span>
              <textarea className="t-input" style={{ width: "100%", minHeight: 50 }} value={(form[k] as string | null | undefined) ?? ""} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>
          ))}
        </div>
      )}
    </Modal>
  );
}
