import { useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { query, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { FeedbackItem, TeacherClass, TeacherClassDetail } from "../../../types/teacherApi";
import { QueryState } from "../Components/Common/Feedback";
import { FeedbackComposer, FeedbackList } from "../Components/Common/FeedbackParts";

export default function Feedback() {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const { data: classes } = useTeacherQuery<TeacherClass[]>("classes");
  const { data: detail } = useTeacherQuery<TeacherClassDetail>(classId ? `classes/${classId}` : null);
  const list = useTeacherQuery<FeedbackItem[]>(`feedbacks${query({ classId })}`);
  const students = detail?.students.filter(s => s.enrollmentStatus === "Active") ?? [];

  return (
    <div className="t-page">
      <Card>
        <h3 className="t-card-title">Viết nhận xét</h3>
        <div className="t-row" style={{ marginBottom: 8 }}>
          <select className="t-input" value={classId} aria-label="Lớp" onChange={e => { setClassId(e.target.value); setStudentId(""); }}>
            <option value="">Chọn lớp</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="t-input" value={studentId} aria-label="Học viên" disabled={!classId} onChange={e => setStudentId(e.target.value)}>
            <option value="">Chọn học viên</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.code})</option>)}
          </select>
        </div>
        <FeedbackComposer classId={classId ? Number(classId) : undefined} studentId={studentId ? Number(studentId) : undefined}
          onSent={list.reload} />
      </Card>

      <Card>
        <h3 className="t-card-title">{classId ? "Nhận xét trong lớp đã chọn" : "Tất cả nhận xét đã gửi"}</h3>
        <QueryState loading={list.loading} error={list.error} onRetry={list.reload}>
          {list.data && <FeedbackList items={list.data} onChanged={list.reload} />}
        </QueryState>
      </Card>
    </div>
  );
}
