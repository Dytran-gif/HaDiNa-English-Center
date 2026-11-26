import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import InitialsBlock from "../components/ui/InitialsBlock";
import usePublicTeachers from "../services/usePublicTeachers";
import TeacherLoadState from "../components/ui/TeacherLoadState";
import NotFound from "./NotFound";
import "./TeacherDetail.css";

export default function TeacherDetail() {
  const { slug = "" } = useParams();
  const { teachers, loading, error, reload } = usePublicTeachers();
  if (loading || error) return <PageShell><div className="container teacher-detail"><TeacherLoadState loading={loading} error={error} empty={false} reload={reload}/></div></PageShell>;
  const teacher = teachers.find(item => item.slug === slug);
  if (!teacher) return <NotFound/>;

  return <PageShell>
    <div className="container teacher-detail">
      <Button to="/giao-vien" variant="ghost" className="teacher-detail__back">← Đội ngũ giáo viên</Button>
      <div className="teacher-detail__head">
        {teacher.avatar ? <img src={teacher.avatar} alt={teacher.full_name} className="teacher-detail__avatar"/> : <InitialsBlock initials={teacher.initials} size="lg" tone="green"/>}
        <h1>{teacher.full_name}</h1>
      </div>
      <dl className="teacher-detail__qualifications">
        <div><dt>Bằng cấp</dt><dd>{teacher.degree?.trim() || "Chưa cập nhật"}</dd></div>
        <div><dt>Trình độ / chuyên môn</dt><dd>{teacher.specialty?.trim() || "Chưa cập nhật"}</dd></div>
        <div><dt>Kinh nghiệm giảng dạy</dt><dd>{teacher.teaching_experience?.trim() || "Chưa cập nhật"}</dd></div>
      </dl>
    </div>
  </PageShell>;
}
