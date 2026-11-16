import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { query, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherClass, TeacherStudentItem } from "../../../types/teacherApi";
import { Empty, QueryState } from "../Components/Common/Feedback";
import { enrollmentLabel } from "../Components/Common/format";

export default function Students() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [classId, setClassId] = useState("");
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const { data, loading, error, reload } = useTeacherQuery<TeacherStudentItem[]>(`students${query({ q: debounced, classId })}`);

  useEffect(() => { const t = setTimeout(() => setDebounced(search.trim()), 350); return () => clearTimeout(t); }, [search]);

  return (
    <div className="t-page">
      <div className="t-row">
        <input className="t-input" style={{ minWidth: 260 }} placeholder="Tìm theo tên, mã, email, số điện thoại" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="t-input" value={classId} onChange={e => setClassId(e.target.value)} aria-label="Lớp">
          <option value="">Tất cả lớp</option>
          {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.length === 0 ? <Empty>Không tìm thấy học viên.</Empty> : (
          <Card padded={false} className="t-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>Mã</th><th>Họ tên</th><th>Lớp</th><th>Liên hệ</th></tr></thead>
              <tbody>
                {data.map(s => (
                  <tr key={s.id}>
                    <td>{s.code}</td>
                    <td><Link className="t-link" to={`/teacher/students/${s.id}`}>{s.fullName}</Link></td>
                    <td className="t-wrap">
                      {s.classes.map(c => (
                        <div key={c.id}>
                          <Link className="t-link" to={`/teacher/classes/${c.id}`}>{c.name}</Link>
                          {c.enrollmentStatus !== "Active" && <span className="t-muted t-small"> ({enrollmentLabel[c.enrollmentStatus] ?? c.enrollmentStatus})</span>}
                        </div>
                      ))}
                    </td>
                    <td>{s.phone ?? "—"}<div className="t-muted t-small">{s.email}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "12px 16px" }}><span className="t-muted t-small">{data.length} học viên</span></div>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
