import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Tag from "../../../components/ui/Tag";
import { query, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { GradingListItem, GradingSummary, Paged, TeacherClass } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { fmtDateTime, fmtNumber, submissionStatusLabel } from "../Components/Common/format";

const tabs = [
  { value: "pending", label: "Chờ chấm" },
  { value: "overdue", label: "Trễ hạn 24h" },
  { value: "graded", label: "Đã công bố" },
  { value: "returned", label: "Đã trả bài" },
  { value: "", label: "Tất cả" },
];

export default function Grading() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("pending");
  const [classId, setClassId] = useState("");
  const [skill, setSkill] = useState("");
  const assignmentId = params.get("assignmentId") ?? "";
  const { data: summary } = useTeacherQuery<GradingSummary>("grading/summary");
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const { data, loading, error, reload } = useTeacherQuery<Paged<GradingListItem>>(
    `grading/submissions${query({ status, classId, skill, assignmentId, includeQuiz: status === "" || undefined, pageSize: 100 })}`);

  return (
    <div className="t-page">
      {summary && (
        <div className="t-grid--stats">
          <div className="t-stat"><span className="t-stat__value">{summary.pending}</span><span className="t-stat__label">Chờ chấm</span></div>
          <div className={`t-stat ${summary.overdue ? "t-stat--warn" : ""}`}><span className="t-stat__value">{summary.overdue}</span><span className="t-stat__label">Trễ hạn chấm 24h</span></div>
          <div className="t-stat"><span className="t-stat__value">{summary.writing}</span><span className="t-stat__label">Writing</span></div>
          <div className="t-stat"><span className="t-stat__value">{summary.speaking}</span><span className="t-stat__label">Speaking</span></div>
        </div>
      )}
      <div className="t-tabs">
        {tabs.map(t => (
          <button key={t.value} type="button" className={`t-tab ${status === t.value ? "active" : ""}`} onClick={() => setStatus(t.value)}>
            {t.label}{t.value === "overdue" && summary?.overdue ? <span className="t-badge">{summary.overdue}</span> : null}
          </button>
        ))}
      </div>
      <div className="t-row">
        <select className="t-input" value={classId} onChange={e => setClassId(e.target.value)} aria-label="Lớp">
          <option value="">Tất cả lớp</option>
          {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="t-input" value={skill} onChange={e => setSkill(e.target.value)} aria-label="Kỹ năng">
          <option value="">Mọi kỹ năng</option><option value="Writing">Writing</option><option value="Speaking">Speaking</option>
        </select>
        {assignmentId && <Link className="t-chip" to="/teacher/grading">Đang lọc theo 1 bài tập ✕</Link>}
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.items.length === 0 ? <Empty>Không có bài nộp nào.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Học viên</th><th>Bài</th><th>Lớp</th><th>Nộp lúc</th><th>Lần</th><th>Trạng thái</th><th>Band / điểm</th><th /></tr></thead>
              <tbody>
                {data.items.map(s => (
                  <tr key={s.id} className={s.gradingOverdue ? "t-row-warn" : ""}>
                    <td><span className="t-strong">{s.studentName}</span> <span className="t-muted t-small">{s.studentCode}</span></td>
                    <td className="t-wrap">{s.assignmentTitle} <span className="t-muted">· {s.skill}</span></td>
                    <td>{s.className}</td>
                    <td>{fmtDateTime(s.submittedAt)} {s.isLate && <Tag tone="yellow">Nộp trễ</Tag>} {s.gradingOverdue && <Tag tone="red">Quá 24h</Tag>}</td>
                    <td>{s.attemptNo}</td>
                    <td><StatusTag status={s.status} labels={submissionStatusLabel} /></td>
                    <td>{s.type === "Quiz" ? `${fmtNumber(s.autoScore)}/${fmtNumber(s.autoMaxScore)}` : fmtNumber(s.overallBand)}</td>
                    <td><Link className="t-link" to={`/teacher/grading/${s.id}`}>{s.status === "Submitted" || s.status === "Draft" ? "Chấm" : "Xem"}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalItems > data.items.length && <p className="t-muted t-small" style={{ padding: "0 16px" }}>Hiển thị {data.items.length}/{data.totalItems} bài. Lọc theo lớp để thu hẹp.</p>}
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
