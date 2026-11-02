import { useState } from "react";
import { Link } from "react-router-dom";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Tag from "../../../components/ui/Tag";
import { useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { ClassSessionsResponse, TeacherClass } from "../../../types/teacherApi";
import { Empty, QueryState, StatusTag } from "../Components/Common/Feedback";
import { fmtDate, fmtTime, sessionStatusLabel } from "../Components/Common/format";

// Tài liệu gắn theo BUỔI học (api/teacher/sessions/{id}/materials).
// Trang này chọn lớp -> danh sách buổi kèm số tài liệu -> mở chi tiết buổi để thêm / xóa.
export default function Materials() {
  const { data: classes, loading, error, reload } = useTeacherQuery<TeacherClass[]>("classes");
  const [picked, setPicked] = useState<number | null>(null);
  const classId = picked ?? classes?.find(c => c.status === "Ongoing")?.id ?? classes?.[0]?.id ?? null;
  const { data: sessions, loading: ls, error: es, reload: rs } = useTeacherQuery<ClassSessionsResponse>(classId ? `classes/${classId}/sessions` : null);

  return (
    <div className="t-page">
      <QueryState loading={loading} error={error} onRetry={reload}>
        {classes && classes.length === 0 && <Empty>Bạn chưa được phân công lớp nào.</Empty>}
        {classes && classId && (
          <div className="t-row">
            <select className="t-input" value={classId} onChange={e => setPicked(Number(e.target.value))} aria-label="Lớp">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="t-muted t-small">Tài liệu được gắn vào từng buổi học. Bấm “Quản lý tài liệu” để tải file / thêm link.</span>
          </div>
        )}
      </QueryState>
      {classId && (
        <QueryState loading={ls} error={es} onRetry={rs}>
          {sessions && (sessions.sessions.length === 0 ? <Empty>Lớp chưa có buổi học.</Empty> : (
            <Card padded={false} className="t-table-wrap">
              <table className="teacher-table">
                <thead><tr><th>Buổi</th><th>Ngày</th><th>Bài giáo án</th><th>Tài liệu</th><th>Trạng thái</th><th /></tr></thead>
                <tbody>
                  {sessions.sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.sessionNo}</td>
                      <td>{fmtDate(s.date)} {fmtTime(s.startTime)}</td>
                      <td className="t-wrap">{s.lessonTitle ?? <span className="t-muted">Chưa gắn</span>}</td>
                      <td>{s.materialCount > 0 ? <Tag tone="green">{s.materialCount} tài liệu</Tag> : <span className="t-muted">0</span>}</td>
                      <td><StatusTag status={s.status} labels={sessionStatusLabel} /></td>
                      <td><Link className="t-link t-small" to={`/teacher/sessions/${s.id}`}>Quản lý tài liệu</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </QueryState>
      )}
    </div>
  );
}
