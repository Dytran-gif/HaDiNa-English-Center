import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { query, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { Paged, PromotionItem, TeacherClass, TeacherStudentItem } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { fmtDateTime, fmtNumber, requestStatusLabel } from "../Components/Common/format";

export default function Students() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [showPromotions, setShowPromotions] = useState(false);
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const { data, loading, error, reload } = useTeacherQuery<Paged<TeacherStudentItem>>(`students${query({ search: debounced, classId, page, pageSize: 20 })}`);

  useEffect(() => { const t = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 350); return () => clearTimeout(t); }, [search]);
  const totalPages = data ? Math.max(1, Math.ceil(data.totalItems / data.pageSize)) : 1;

  return (
    <div className="t-page">
      <div className="t-row t-row--between">
        <div className="t-row">
          <input className="t-input" style={{ minWidth: 260 }} placeholder="Tìm theo tên hoặc mã học viên" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="t-input" value={classId} onChange={e => { setClassId(e.target.value); setPage(1); }} aria-label="Lớp">
            <option value="">Tất cả lớp</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Button variant="outline" onClick={() => setShowPromotions(v => !v)}>{showPromotions ? "Ẩn đề xuất lên lớp" : "Đề xuất lên lớp đã gửi"}</Button>
      </div>
      {showPromotions && <Promotions />}
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.items.length === 0 ? <Empty>Không tìm thấy học viên.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Mã</th><th>Họ tên</th><th>Lớp</th><th>Liên hệ</th><th>Band gần nhất</th><th>Mục tiêu</th><th>Chuyên cần</th></tr></thead>
              <tbody>
                {data.items.map(s => (
                  <tr key={s.id} className={s.absenceWarning ? "t-row-warn" : ""}>
                    <td>{s.code}</td>
                    <td><Link className="t-link" to={`/teacher/students/${s.id}`}>{s.fullName}</Link></td>
                    <td className="t-wrap">{s.classes.map(c => c.className).join(", ")}</td>
                    <td>{s.phone ?? "—"}<div className="t-muted t-small">{s.email}</div></td>
                    <td>{fmtNumber(s.latestBand)}</td>
                    <td>{fmtNumber(s.targetBand)}</td>
                    <td>{s.attendanceRate != null ? `${fmtNumber(s.attendanceRate)}%` : "—"} {s.absenceWarning && <Tag tone="red">&gt;20% vắng</Tag>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="t-row t-row--between" style={{ padding: "12px 16px" }}>
              <span className="t-muted t-small">{data.totalItems} học viên</span>
              <div className="t-row">
                <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                <span className="t-small">Trang {page}/{totalPages}</span>
                <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}

function Promotions() {
  const { data, loading, error, reload } = useTeacherQuery<PromotionItem[]>("students/promotions");
  return (
    <Card>
      <h3 className="t-card-title">Đề xuất lên lớp đã gửi Admin</h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Chưa gửi đề xuất nào.</Empty> : (
          <ul className="t-list">
            {data.map(p => (
              <li key={p.id}>
                <div>
                  <Link className="t-link" to={`/teacher/students/${p.studentId}`}>{p.studentName}</Link>
                  <span className="t-muted"> · từ {p.fromClassName}{p.recommendedCourseName ? ` → ${p.recommendedCourseName}` : ""}{p.reason ? ` · ${p.reason}` : ""}</span>
                </div>
                <div className="t-row"><StatusTag status={p.status} labels={requestStatusLabel} /><span className="t-muted t-small">{fmtDateTime(p.createdAt)}</span></div>
              </li>
            ))}
          </ul>
        ))}
      </QueryState>
    </Card>
  );
}
