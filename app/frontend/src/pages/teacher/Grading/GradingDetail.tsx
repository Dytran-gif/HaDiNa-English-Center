import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { assetUrl } from "../../../services/apiClient";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { Annotation, CommentTemplate, Criterion, GradingDetail as Detail, Scores } from "../../../types/teacherApi";
import { Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { bandOptions, criterionName, fmtDateTime, fmtNumber, submissionStatusLabel } from "../Components/Common/format";

type Descriptor = { criterion: Criterion; name: string; bands: { band: number; description: string }[] };
const errorTypes: Annotation["errorType"][] = ["Grammar", "Vocabulary", "Coherence"];
const errorTypeLabel: Record<string, string> = { Grammar: "Ngữ pháp", Vocabulary: "Từ vựng", Coherence: "Mạch lạc" };
const key = (c: Criterion) => c.toLowerCase() as keyof Scores;

/** Band tổng kiểu IELTS: .25 lên .5, .75 lên số nguyên (giống IeltsBands.Overall ở BE) */
function overall(values: number[]) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.floor(avg * 2 + 0.5) / 2;
}

export default function GradingDetail() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const api = useTeacherApi();
  const { data: s, loading, error, reload } = useTeacherQuery<Detail>(`grading/submissions/${id}`);
  const skill = s?.assignment.skill;
  const gradable = !!s && s.assignment.type !== "Quiz";
  const { data: descriptors } = useTeacherQuery<Descriptor[]>(gradable && skill ? `grading/band-descriptors?skill=${skill}` : null);
  const { data: templates, reload: reloadTemplates } = useTeacherQuery<CommentTemplate[]>(gradable && skill ? `grading/comment-templates?skill=${skill}` : null);

  const [scores, setScores] = useState<Scores>({});
  const [feedback, setFeedback] = useState("");
  const [feedbackAudioUrl, setFeedbackAudioUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pending, setPending] = useState<Annotation | null>(null);
  const [returnMsg, setReturnMsg] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });
  const [busy, setBusy] = useState(false);
  const [showDesc, setShowDesc] = useState<Criterion | null>(null);
  const essayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!s) return;
    setScores(s.scores ?? {});
    setFeedback(s.feedback ?? "");
    setFeedbackAudioUrl(s.feedbackAudioUrl ?? null);
    setAnnotations(s.annotations);
    setPending(null); setReturnMsg("");
  }, [s]);

  const preview = useMemo(() => {
    if (!s) return null;
    const vals = s.criteria.map(c => scores[key(c)]);
    return vals.every(v => v !== null && v !== undefined) ? overall(vals as number[]) : null;
  }, [s, scores]);

  const isLatest = !!s && s.history[s.history.length - 1]?.id === s.id;
  const canEdit = gradable && isLatest;

  function captureSelection() {
    const box = essayRef.current;
    const sel = window.getSelection();
    if (!box || !sel || sel.rangeCount === 0 || sel.isCollapsed || !s?.content) return;
    const range = sel.getRangeAt(0);
    if (!box.contains(range.startContainer) || !box.contains(range.endContainer)) return;
    const pre = range.cloneRange();
    pre.selectNodeContents(box);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + range.toString().length;
    if (end <= start) return;
    if (annotations.some(a => start < a.endOffset && end > a.startOffset)) {
      setNotice({ text: "Đoạn chọn trùng với một lỗi đã đánh dấu.", tone: "error" }); return;
    }
    setPending({ startOffset: start, endOffset: end, selectedText: s.content.slice(start, end), errorType: "Grammar", suggestion: "", comment: "" });
  }

  function body() {
    return {
      ...scores, feedback: feedback || null, feedbackAudioUrl,
      annotations: s?.assignment.type === "Writing" ? annotations.map(a => ({ ...a, id: undefined })) : null,
    };
  }

  async function act(fn: () => Promise<{ nextSubmissionId?: number | null } | void>, ok: string, goNext = false) {
    setBusy(true);
    try {
      const r = await fn();
      setNotice({ text: ok, tone: "ok" });
      if (goNext && r && r.nextSubmissionId) navigate(`/teacher/grading/${r.nextSubmissionId}`);
      else reload();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }
  const saveDraft = () => act(() => api.send("PUT", `grading/submissions/${id}`, body()), "Đã lưu");
  const publish = () => act(async () => {
    await api.send("PUT", `grading/submissions/${id}`, body());
    return api.send<{ nextSubmissionId?: number | null }>("POST", `grading/submissions/${id}/publish`);
  }, "Đã công bố điểm cho học viên");
  const giveBack = () => act(async () => {
    await api.send("PUT", `grading/submissions/${id}`, body());
    return api.send<{ nextSubmissionId?: number | null }>("POST", `grading/submissions/${id}/return`, { message: returnMsg });
  }, "Đã trả bài cho học viên sửa");
  async function goNext() {
    try {
      const r = await api.get<{ nextSubmissionId?: number | null; message?: string }>(`grading/next?currentId=${id}`);
      if (r.nextSubmissionId) navigate(`/teacher/grading/${r.nextSubmissionId}`);
      else setNotice({ text: r.message ?? "Đã chấm hết bài", tone: "ok" });
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function addTemplate() {
    if (!skill) return;
    try { await api.send("POST", "grading/comment-templates", { skill, criterion: null, content: newTemplate }); setNewTemplate(""); reloadTemplates(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }
  async function removeTemplate(tid: number) {
    try { await api.send("DELETE", `grading/comment-templates/${tid}`); reloadTemplates(); }
    catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
  }

  return (
    <div className="t-page">
      <div className="t-row t-row--between">
        <Link className="t-link t-small" to="/teacher/grading">← Danh sách bài nộp</Link>
        <Button variant="outline" onClick={goNext}>Bài tiếp theo ›</Button>
      </div>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {s && (
          <>
            <Card>
              <div className="t-row t-row--between">
                <div>
                  <h2 style={{ margin: 0 }}>{s.assignment.title}</h2>
                  <p className="t-muted" style={{ margin: "4px 0 0" }}>
                    <Link className="t-link" to={`/teacher/students/${s.student.id}`}>{s.student.fullName}</Link> ({s.student.code})
                    {s.student.targetBand != null && ` · mục tiêu ${fmtNumber(s.student.targetBand)}`} · {s.assignment.className} · {s.assignment.skill}
                    {" "}· Nộp {fmtDateTime(s.submittedAt)} (lần {s.attemptNo}) · Hạn {fmtDateTime(s.assignment.dueAt)}
                  </p>
                </div>
                <div className="t-row">
                  <StatusTag status={s.status} labels={submissionStatusLabel} />
                  {s.isLate && <Tag tone="yellow">Nộp trễ</Tag>}
                  {s.gradingOverdue && <Tag tone="red">Quá hạn chấm 24h</Tag>}
                </div>
              </div>
              {s.history.length > 1 && (
                <div className="t-row" style={{ marginTop: 10 }}>
                  <span className="t-muted t-small">Các lần nộp:</span>
                  {s.history.map(h => (
                    <Link key={h.id} className="t-chip" to={`/teacher/grading/${h.id}`} style={h.id === s.id ? { outline: "2px solid var(--blue)" } : undefined}>
                      Lần {h.attemptNo} · {submissionStatusLabel[h.status]}{h.overallBand != null ? ` · ${fmtNumber(h.overallBand)}` : ""}
                    </Link>
                  ))}
                </div>
              )}
              {!isLatest && <Notice tone="error" message="Đây không phải lần nộp mới nhất, chỉ xem được." />}
            </Card>

            <div className="t-grading">
              <div className="t-page">
                <Card>
                  <h3 className="t-card-title">Đề bài</h3>
                  <p className="t-pre">{s.assignment.prompt}</p>
                  {s.assignment.attachmentUrl && <p><a className="t-link" href={assetUrl(s.assignment.attachmentUrl) ?? s.assignment.attachmentUrl} target="_blank" rel="noreferrer">File đính kèm</a></p>}
                </Card>

                {s.assignment.type === "Writing" && (
                  <Card>
                    <h3 className="t-card-title">
                      Bài viết · {s.wordCount ?? 0} từ
                      {canEdit && <span className="t-muted t-small">Bôi đen một đoạn để đánh dấu lỗi</span>}
                    </h3>
                    {s.attachmentUrl && (
                      <p style={{ margin: "0 0 8px" }}>
                        <a className="t-link" href={assetUrl(s.attachmentUrl) ?? s.attachmentUrl} target="_blank" rel="noreferrer">Tải file bài làm học viên đính kèm</a>
                      </p>
                    )}
                    {s.minWordsWarning && !s.attachmentUrl && <Notice tone="warn" message={s.minWordsMessage ?? "Bài viết ít hơn số từ yêu cầu"} />}
                    <div ref={essayRef} className="t-essay" onMouseUp={canEdit ? captureSelection : undefined}>
                      <Highlighted text={s.content ?? ""} annotations={annotations} />
                    </div>
                    {pending && (
                      <div className="t-stat" style={{ marginTop: 12 }}>
                        <div className="t-strong">“{pending.selectedText}”</div>
                        <div className="t-form-grid" style={{ marginTop: 8 }}>
                          <select className="t-input" value={pending.errorType} onChange={e => setPending({ ...pending, errorType: e.target.value as Annotation["errorType"] })}>
                            {errorTypes.map(t => <option key={t} value={t}>{errorTypeLabel[t]}</option>)}
                          </select>
                          <input className="t-input" placeholder="Gợi ý sửa" value={pending.suggestion ?? ""} onChange={e => setPending({ ...pending, suggestion: e.target.value })} />
                          <input className="t-input" placeholder="Nhận xét" value={pending.comment ?? ""} onChange={e => setPending({ ...pending, comment: e.target.value })} />
                        </div>
                        <div className="t-actions" style={{ marginTop: 8 }}>
                          <Button variant="ghost" onClick={() => setPending(null)}>Bỏ</Button>
                          <Button onClick={() => { setAnnotations(a => [...a, pending].sort((x, y) => x.startOffset - y.startOffset)); setPending(null); }}>Thêm lỗi</Button>
                        </div>
                      </div>
                    )}
                    {annotations.length > 0 && (
                      <ul className="t-list" style={{ marginTop: 8 }}>
                        {annotations.map((a, i) => (
                          <li key={`${a.startOffset}-${a.endOffset}`}>
                            <div>
                              <span className={`t-mark t-mark--${a.errorType}`}>{a.selectedText}</span>
                              <span className="t-muted"> · {errorTypeLabel[a.errorType]}{a.suggestion ? ` → ${a.suggestion}` : ""}{a.comment ? ` · ${a.comment}` : ""}</span>
                            </div>
                            {canEdit && <button type="button" className="teacher-action-link teacher-action-danger" onClick={() => setAnnotations(x => x.filter((_, j) => j !== i))}>Xóa</button>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}

                {s.assignment.type === "Speaking" && (
                  <Card>
                    <h3 className="t-card-title">Bài nói</h3>
                    {s.audioUrl ? <audio controls src={assetUrl(s.audioUrl) ?? s.audioUrl} style={{ width: "100%" }} /> : <p className="t-muted">Không có file ghi âm.</p>}
                    {s.content && <p className="t-pre" style={{ marginTop: 12 }}>{s.content}</p>}
                    {s.attachmentUrl && <p><a className="t-link" href={assetUrl(s.attachmentUrl) ?? s.attachmentUrl} target="_blank" rel="noreferrer">File đính kèm của học viên</a></p>}
                  </Card>
                )}

                {s.assignment.type === "Quiz" && s.quiz && (
                  <Card padded={false} className="t-table-wrap">
                    <p style={{ padding: "16px 16px 0", margin: 0 }} className="t-strong">Tự chấm: {fmtNumber(s.autoScore)}/{fmtNumber(s.autoMaxScore)} điểm</p>
                    <table className="teacher-table">
                      <thead><tr><th>#</th><th>Câu hỏi</th><th>Trả lời</th><th>Đáp án</th><th>Kết quả</th></tr></thead>
                      <tbody>
                        {s.quiz.map((q, i) => (
                          <tr key={q.questionId}>
                            <td>{i + 1}</td><td className="t-wrap">{q.content}</td><td>{q.answer ?? "—"}</td><td>{q.correctAnswer}</td>
                            <td>{q.isCorrect ? <Tag tone="green">Đúng</Tag> : <Tag tone="red">Sai</Tag>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}
              </div>

              {gradable && (
                <div className="t-page">
                  <Card>
                    <h3 className="t-card-title">Chấm điểm <span className="t-overall">{fmtNumber(preview ?? s.overallBand)}</span></h3>
                    <div className="t-criteria">
                      {s.criteria.map(c => (
                        <label key={c}>
                          <span className="t-label">{c} · {criterionName[c]} <button type="button" className="teacher-action-link t-small" onClick={() => setShowDesc(showDesc === c ? null : c)}>mô tả</button></span>
                          <select className="t-input" style={{ width: "100%" }} disabled={!canEdit} value={scores[key(c)] ?? ""}
                            onChange={e => setScores({ ...scores, [key(c)]: e.target.value === "" ? null : Number(e.target.value) })}>
                            <option value="">—</option>
                            {bandOptions.map(b => <option key={b} value={b}>{b.toFixed(1)}</option>)}
                          </select>
                        </label>
                      ))}
                    </div>
                    {showDesc && descriptors && (
                      <div className="t-stat" style={{ marginTop: 12, maxHeight: 240, overflowY: "auto" }}>
                        {descriptors.find(d => d.criterion === showDesc)?.bands.map(b => (
                          <p key={b.band} className="t-small" style={{ margin: "0 0 6px" }}><strong>{b.band}</strong> — {b.description}</p>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h3 className="t-card-title">Nhận xét</h3>
                    <textarea className="t-input" style={{ width: "100%" }} rows={6} disabled={!canEdit} value={feedback} onChange={e => setFeedback(e.target.value)} />
                    {templates && templates.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <span className="t-label">Nhận xét mẫu (bấm để chèn)</span>
                        <div className="t-row">
                          {templates.map(t => (
                            <span key={t.id} className="t-row" style={{ gap: 2 }}>
                              <button type="button" className="t-chip t-chip--clickable" disabled={!canEdit} title={t.content}
                                onClick={() => setFeedback(f => (f ? f + "\n" : "") + t.content)}>
                                {t.criterion ? `${t.criterion}: ` : ""}{t.content.length > 40 ? t.content.slice(0, 40) + "…" : t.content}
                              </button>
                              {t.isMine && <button type="button" className="teacher-action-link teacher-action-danger t-small" onClick={() => removeTemplate(t.id)} aria-label="Xóa mẫu">✕</button>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="t-row" style={{ marginTop: 10 }}>
                      <input className="t-input t-input--sm" style={{ flex: 1 }} placeholder="Thêm nhận xét mẫu của bạn" value={newTemplate} onChange={e => setNewTemplate(e.target.value)} />
                      <button type="button" className="teacher-action-link" disabled={!newTemplate.trim()} onClick={addTemplate}>Lưu mẫu</button>
                    </div>
                    {s.assignment.type === "Speaking" && (
                      <FeedbackRecorder url={feedbackAudioUrl} disabled={!canEdit} onChange={setFeedbackAudioUrl} onError={t => setNotice({ text: t, tone: "error" })} />
                    )}
                  </Card>

                  {canEdit && (
                    <Card>
                      <div className="t-actions" style={{ justifyContent: "stretch" }}>
                        <Button variant="outline" disabled={busy} onClick={saveDraft}>Lưu nháp</Button>
                        <Button disabled={busy || preview === null || s.status === "Published"} onClick={publish}>Công bố điểm</Button>
                      </div>
                      {s.status !== "Returned" && (
                        <div className="t-form" style={{ marginTop: 14 }}>
                          <textarea className="t-input" placeholder="Yêu cầu học viên sửa gì (trả bài để nộp lại)" value={returnMsg} onChange={e => setReturnMsg(e.target.value)} />
                          <div className="t-actions"><Button variant="ghost" disabled={busy || !returnMsg.trim()} onClick={giveBack}>Trả bài cho sửa</Button></div>
                        </div>
                      )}
                      {s.returnNote && <p className="t-muted t-small">Đã trả bài: {s.returnNote}</p>}
                    </Card>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}

function Highlighted({ text, annotations }: { text: string; annotations: Annotation[] }) {
  const parts: ReactNode[] = [];
  let pos = 0;
  for (const a of [...annotations].sort((x, y) => x.startOffset - y.startOffset)) {
    if (a.startOffset < pos || a.endOffset > text.length) continue;
    if (a.startOffset > pos) parts.push(text.slice(pos, a.startOffset));
    parts.push(
      <mark key={`${a.startOffset}-${a.endOffset}`} className={`t-mark t-mark--${a.errorType}`}
        title={`${errorTypeLabel[a.errorType]}${a.suggestion ? ` → ${a.suggestion}` : ""}${a.comment ? ` · ${a.comment}` : ""}`}>
        {text.slice(a.startOffset, a.endOffset)}
      </mark>);
    pos = a.endOffset;
  }
  parts.push(text.slice(pos));
  return <>{parts}</>;
}

// Thu âm nhận xét Speaking bằng MediaRecorder rồi upload (folder=feedback)
function FeedbackRecorder({ url, disabled, onChange, onError }: {
  url: string | null; disabled: boolean; onChange: (url: string | null) => void; onError: (text: string) => void;
}) {
  const api = useTeacherApi();
  const recorder = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setUploading(true);
        try {
          const r = await api.upload("files?folder=feedback", new Blob(chunks, { type: rec.mimeType || "audio/webm" }), "feedback.webm");
          onChange(r.url);
        } catch (e) { onError(errorMessage(e)); }
        finally { setUploading(false); }
      };
      rec.start();
      recorder.current = rec;
      setRecording(true);
    } catch { onError("Không truy cập được micro. Hãy cho phép trình duyệt dùng micro."); }
  }
  function stop() { recorder.current?.stop(); setRecording(false); }

  return (
    <div style={{ marginTop: 14 }}>
      <span className="t-label">Nhận xét bằng giọng nói</span>
      {url && <audio controls src={assetUrl(url) ?? url} style={{ width: "100%" }} />}
      <div className="t-row" style={{ marginTop: 6 }}>
        {!recording
          ? <Button variant="outline" disabled={disabled || uploading} onClick={start}>{uploading ? "Đang tải lên..." : url ? "Thu âm lại" : "● Thu âm"}</Button>
          : <Button onClick={stop}>■ Dừng</Button>}
        {url && !recording && <button type="button" className="teacher-action-link teacher-action-danger" disabled={disabled} onClick={() => onChange(null)}>Xóa</button>}
      </div>
    </div>
  );
}
