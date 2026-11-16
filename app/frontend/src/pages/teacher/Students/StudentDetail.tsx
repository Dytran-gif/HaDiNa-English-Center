import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { assetUrl } from "../../../services/apiClient";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherStudentDetail } from "../../../types/teacherApi";
import { Empty, Notice, QueryState, StatusTag } from "../Components/Common/Feedback";
import { FeedbackComposer, FeedbackList } from "../Components/Common/FeedbackParts";
import { attendanceLabel, enrollmentLabel, fmtDate, fmtDateTime } from "../Components/Common/format";

export default function StudentDetail() {
  const { id } = useParams();
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<TeacherStudentDetail>(`students/${id}`);
  const [classId, setClassId] = useState<number>();
  const [notice, setNotice] = useState("");

  async function download(subId: number, name: string) {
    try { await api.download(`submissions/${subId}/download`, name); }
    catch (e) { setNotice(errorMessage(e)); }
  }

  const s = data?.student;
  const chosenClass = classId ?? data?.classes[0]?.id;

  return (
    <div className="t-page">
      <Link className="t-link t-small" to="/teacher/students">‹ Học viên</Link>
      <Notice message={notice} tone="error" onClose={() => setNotice("")} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && s && (
          <>
            <div className="t-grid--2">
              <Card>
                <div className="t-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "var(--blue-light)", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800, color: "var(--blue-dark)" }}>
                    {s.avatarUrl ? <img src={assetUrl(s.avatarUrl) ?? s.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : s.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>{s.fullName}</h2>
                    <p className="t-muted" style={{ margin: "4px 0 0" }}>{s.code}</p>
                  </div>
                </div>
                <dl className="t-kv" style={{ marginTop: 16 }}>
                  <dt>Email</dt><dd>{s.email}</dd>
                  <dt>Số điện thoại</dt><dd>{s.phone ?? "—"}</dd>
                  <dt>Ngày sinh</dt><dd>{fmtDate(s.dateOfBirth)}</dd>
                  <dt>Phụ huynh</dt><dd>{s.parentName ?? "—"}{s.parentPhone ? ` · ${s.parentPhone}` : ""}</dd>
                </dl>
              </Card>
              <Card>
                <h3 className="t-card-title">Lớp học với bạn</h3>
                <ul className="t-list">
                  {data.classes.map(c => {
                    const a = data.attendance.find(x => x.classId === c.id);
                    const total = a ? a.present + a.late + a.absent + a.excused : 0;
                    return (
                    <li key={c.id}>
                      <div>
                        <Link className="t-link" to={`/teacher/classes/${c.id}`}>{c.name}</Link>
                        <div className="t-muted t-small">{c.courseName} · {fmtDate(c.startDate)} – {fmtDate(c.endDate)}</div>
                        <div className="t-small">
                          {total === 0 ? <span className="t-muted">Chưa điểm danh buổi nào</span> : (
                            <>Chuyên cần <strong>{Math.round((a!.present + a!.late) * 1000 / total) / 10}%</strong>
                              <span className="t-muted"> · {a!.present} có mặt · {a!.late} muộn · {a!.absent} vắng · {a!.excused} phép</span></>
                          )}
                        </div>
                      </div>
                      <StatusTag status={c.status} labels={enrollmentLabel} />
                    </li>
                    );
                  })}
                </ul>
              </Card>
            </div>

            {data.recentAbsences.length > 0 && (
              <Card>
                <h3 className="t-card-title">Vắng / muộn gần đây</h3>
                <ul className="t-list">
                  {data.recentAbsences.map((x, i) => (
                    <li key={i}>
                      <div>
                        <strong>{fmtDate(x.date)}</strong> · {x.className}
                        {x.note && <div className="t-muted t-small">{x.note}</div>}
                      </div>
                      <StatusTag status={x.status} labels={attendanceLabel} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card>
              <h3 className="t-card-title">Bài đã nộp ({data.submissions.length})</h3>
              {data.submissions.length === 0 ? <Empty>Học viên chưa nộp bài nào.</Empty> : (
                <ul className="t-list">
                  {data.submissions.map(x => (
                    <li key={x.id}>
                      <div>
                        <strong>{x.assignmentTitle}</strong>
                        <div className="t-muted t-small">{x.fileName || "—"} · {fmtDateTime(x.submittedAt)}</div>
                      </div>
                      {x.hasFile
                        ? <button type="button" className="teacher-action-link" onClick={() => download(x.id, x.fileName || "bai-nop")}>Tải bài</button>
                        : <span className="t-muted t-small">File đã dọn</span>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="t-card-title">Nhận xét</h3>
              {data.classes.length > 1 && (
                <select className="t-input" style={{ marginBottom: 8 }} value={chosenClass} onChange={e => setClassId(Number(e.target.value))} aria-label="Lớp nhận xét">
                  {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <FeedbackComposer classId={chosenClass} studentId={s.id} onSent={reload} />
              <div style={{ marginTop: 16 }}>
                <FeedbackList items={data.feedbacks} onChanged={reload} showStudent={false} />
              </div>
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
