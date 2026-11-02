import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type {
  AssignmentDetail, AssignmentRequestBody, AssignmentType, ExamListItem, QuestionInput, Skill, TeacherClass, TeacherClassDetail,
} from "../../../types/teacherApi";
import { Notice } from "../Components/Common/Feedback";
import { defaultDue, examTypeLabel, fromInputDateTime, toInputDateTime } from "../Components/Common/format";

const emptyQuestion = (): QuestionInput => ({ questionType: "MultipleChoice", content: "", options: ["A. ", "B. ", "C. ", "D. "], correctAnswer: "A", points: 1 });

function blank(classId: number, examId?: number): AssignmentRequestBody {
  return {
    classId, skill: "Writing", type: "Writing", title: "", prompt: "", dueAt: defaultDue(7), minWords: 250,
    attachmentUrl: null, note: null, allowLate: true, assignToAll: true, studentIds: [], questions: [], examId: examId ?? null,
  };
}

export function AssignmentForm({ open, editId, classes, defaultClassId, defaultExamId, onClose, onSaved }: {
  open: boolean; editId: number | null; classes: TeacherClass[]; defaultClassId?: number; defaultExamId?: number;
  onClose: () => void; onSaved: (message: string) => void;
}) {
  const api = useTeacherApi();
  const [form, setForm] = useState<AssignmentRequestBody>(() => blank(defaultClassId ?? classes[0]?.id ?? 0, defaultExamId));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { data: classDetail } = useTeacherQuery<TeacherClassDetail>(open && form.classId ? `classes/${form.classId}` : null);
  const { data: exams } = useTeacherQuery<ExamListItem[]>(open && form.classId ? `exams?classId=${form.classId}` : null);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (!editId) { setForm(blank(defaultClassId ?? classes[0]?.id ?? 0, defaultExamId)); return; }
    setLoadingDetail(true);
    api.get<AssignmentDetail>(`assignments/${editId}`).then(a => setForm({
      classId: a.classId, skill: a.skill, type: a.type, title: a.title, prompt: a.prompt, dueAt: toInputDateTime(a.dueAt),
      minWords: a.minWords ?? null, attachmentUrl: a.attachmentUrl ?? null, note: a.note ?? null, allowLate: a.allowLate,
      assignToAll: a.assignToAll, studentIds: a.students?.map(s => s.studentId) ?? [], examId: a.examId ?? null,
      questions: a.questions.map(q => ({ questionType: q.questionType, content: q.content, options: q.options ?? null, correctAnswer: q.correctAnswer, points: q.points })),
    })).catch(e => setError(errorMessage(e))).finally(() => setLoadingDetail(false));
  }, [open, editId, api, classes, defaultClassId, defaultExamId]);

  function setType(type: AssignmentType) {
    const skill: Skill = type === "Quiz" ? "Reading" : type;
    setForm(f => ({ ...f, type, skill, minWords: type === "Writing" ? f.minWords ?? 250 : null,
      questions: type === "Quiz" ? (f.questions.length ? f.questions : [emptyQuestion()]) : [] }));
  }
  function setQuestion(i: number, patch: Partial<QuestionInput>) {
    setForm(f => ({ ...f, questions: f.questions.map((q, j) => j === i ? { ...q, ...patch } : q) }));
  }

  async function uploadAttachment(file: File) {
    try { const r = await api.upload("files?folder=assignments", file); setForm(f => ({ ...f, attachmentUrl: r.url })); }
    catch (e) { setError(errorMessage(e)); }
  }

  async function save() {
    setSaving(true); setError("");
    const body: AssignmentRequestBody = {
      ...form, dueAt: fromInputDateTime(form.dueAt),
      note: form.note?.trim() || null, attachmentUrl: form.attachmentUrl?.trim() || null,
      questions: form.type === "Quiz" ? form.questions.map(q => ({
        ...q, options: q.questionType === "MultipleChoice" ? (q.options ?? []).filter(o => o.trim()) : null,
      })) : [],
    };
    try {
      const r = editId
        ? await api.send<{ message: string }>("PUT", `assignments/${editId}`, body)
        : await api.send<{ message: string }>("POST", "assignments", body);
      onSaved(r.message);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }

  const activeStudents = classDetail?.students.filter(s => s.status === "Active") ?? [];

  return (
    <Modal open={open} title={editId ? "Sửa bài tập" : "Giao bài tập"} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={saving || loadingDetail} onClick={save}>{saving ? "Đang lưu..." : editId ? "Lưu" : "Giao bài"}</Button></>}>
      <div className="t-form" style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
        <Notice message={error} tone="error" />
        <div className="t-form-grid">
          <label><span className="t-label">Lớp *</span>
            <select className="t-input" style={{ width: "100%" }} value={form.classId} onChange={e => setForm({ ...form, classId: Number(e.target.value), studentIds: [], examId: null })}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label><span className="t-label">Loại bài *</span>
            <select className="t-input" style={{ width: "100%" }} value={form.type} onChange={e => setType(e.target.value as AssignmentType)}>
              <option value="Writing">Writing (bài viết)</option>
              <option value="Speaking">Speaking (thu âm)</option>
              <option value="Quiz">Quiz trắc nghiệm / điền từ (tự chấm)</option>
            </select>
          </label>
          {form.type === "Quiz" && (
            <label><span className="t-label">Kỹ năng *</span>
              <select className="t-input" style={{ width: "100%" }} value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value as Skill })}>
                <option value="Reading">Reading</option><option value="Listening">Listening</option>
              </select>
            </label>
          )}
          <label><span className="t-label">Hạn nộp *</span>
            <input className="t-input" style={{ width: "100%" }} type="datetime-local" value={form.dueAt.slice(0, 16)} onChange={e => setForm({ ...form, dueAt: e.target.value })} />
          </label>
          {form.type === "Writing" && (
            <label><span className="t-label">Số từ tối thiểu</span>
              <input className="t-input" style={{ width: "100%" }} type="number" min={1} value={form.minWords ?? ""} onChange={e => setForm({ ...form, minWords: e.target.value ? Number(e.target.value) : null })} />
            </label>
          )}
        </div>
        <label><span className="t-label">Tên bài *</span><input className="t-input" style={{ width: "100%" }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label><span className="t-label">Đề bài *</span><textarea className="t-input" style={{ width: "100%" }} rows={4} value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} /></label>
        <div className="t-form-grid">
          <label><span className="t-label">File đính kèm (ảnh đề, audio...)</span>
            <input className="t-input" style={{ width: "100%" }} type="file" onChange={e => { const f = e.target.files?.[0]; if (f) void uploadAttachment(f); }} />
            {form.attachmentUrl && <span className="t-muted t-small">Đã đính kèm: {form.attachmentUrl} <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => setForm({ ...form, attachmentUrl: null })}>Bỏ</button></span>}
          </label>
          <label><span className="t-label">Gắn làm phần thi online của bài kiểm tra</span>
            <select className="t-input" style={{ width: "100%" }} value={form.examId ?? ""} onChange={e => setForm({ ...form, examId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— Không —</option>
              {exams?.map(x => <option key={x.id} value={x.id}>{x.title} ({examTypeLabel[x.type]})</option>)}
            </select>
          </label>
        </div>
        <label><span className="t-label">Ghi chú</span><input className="t-input" style={{ width: "100%" }} value={form.note ?? ""} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
        <div className="t-row">
          <label className="t-check"><input type="checkbox" checked={form.allowLate} onChange={e => setForm({ ...form, allowLate: e.target.checked })} /> Cho nộp trễ</label>
          <label className="t-check"><input type="checkbox" checked={form.assignToAll} onChange={e => setForm({ ...form, assignToAll: e.target.checked })} /> Giao cho cả lớp</label>
        </div>
        {!form.assignToAll && (
          <div>
            <span className="t-label">Chọn học viên ({form.studentIds.length})</span>
            <div className="t-row">
              {activeStudents.length === 0 && <span className="t-muted">Lớp chưa có học viên đang học.</span>}
              {activeStudents.map(s => (
                <label key={s.studentId} className="t-check">
                  <input type="checkbox" checked={form.studentIds.includes(s.studentId)}
                    onChange={e => setForm({ ...form, studentIds: e.target.checked ? [...form.studentIds, s.studentId] : form.studentIds.filter(x => x !== s.studentId) })} />
                  {s.fullName}
                </label>
              ))}
            </div>
          </div>
        )}

        {form.type === "Quiz" && (
          <div className="t-form">
            <span className="t-label">Câu hỏi ({form.questions.length}) — trắc nghiệm ghi đáp án là chữ cái (A/B/...), điền từ có thể ghi nhiều đáp án ngăn bằng |</span>
            {form.questions.map((q, i) => (
              <div key={i} className="t-stat">
                <div className="t-row t-row--between">
                  <strong>Câu {i + 1}</strong>
                  <div className="t-row">
                    <select className="t-input t-input--sm" value={q.questionType}
                      onChange={e => setQuestion(i, e.target.value === "FillBlank" ? { questionType: "FillBlank", options: null, correctAnswer: "" } : { questionType: "MultipleChoice", options: ["A. ", "B. ", "C. ", "D. "], correctAnswer: "A" })}>
                      <option value="MultipleChoice">Trắc nghiệm</option><option value="FillBlank">Điền từ</option>
                    </select>
                    <input className="t-input t-input--sm" style={{ width: 70 }} type="number" min={0.25} step={0.25} value={q.points} onChange={e => setQuestion(i, { points: Number(e.target.value) })} aria-label="Điểm" />
                    <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => setForm({ ...form, questions: form.questions.filter((_, j) => j !== i) })}>Xóa</button>
                  </div>
                </div>
                <textarea className="t-input" style={{ width: "100%", marginTop: 8, minHeight: 50 }} placeholder="Nội dung câu hỏi" value={q.content} onChange={e => setQuestion(i, { content: e.target.value })} />
                {q.questionType === "MultipleChoice" && (
                  <div className="t-form-grid" style={{ marginTop: 8 }}>
                    {(q.options ?? []).map((o, k) => (
                      <input key={k} className="t-input t-input--sm" value={o} onChange={e => setQuestion(i, { options: (q.options ?? []).map((x, m) => m === k ? e.target.value : x) })} />
                    ))}
                  </div>
                )}
                <input className="t-input t-input--sm" style={{ marginTop: 8 }} placeholder="Đáp án đúng" value={q.correctAnswer} onChange={e => setQuestion(i, { correctAnswer: e.target.value })} />
              </div>
            ))}
            <div><Button variant="outline" onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()] })}>+ Thêm câu hỏi</Button></div>
          </div>
        )}
      </div>
    </Modal>
  );
}
