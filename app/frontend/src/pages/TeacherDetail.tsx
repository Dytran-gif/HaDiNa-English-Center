import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import InitialsBlock from "../components/ui/InitialsBlock";
import { getTeacherBySlug } from "../data/teachers";
import { getCoursesByTeacher, formatPrice } from "../data/courses";
import NotFound from "./NotFound";
import "./TeacherDetail.css";

export default function TeacherDetail() {
  const { slug = "" } = useParams();
  const teacher = getTeacherBySlug(slug);

  if (!teacher) {
    return <NotFound />;
  }

  const taughtCourses = getCoursesByTeacher(teacher.teacher_id);

  return (
    <PageShell>
      <div className="container teacher-detail">
        <Button to="/giao-vien" variant="ghost" className="teacher-detail__back">
          ← Đội ngũ giáo viên
        </Button>

        <div className="teacher-detail__head">
          <InitialsBlock initials={teacher.initials} size="lg" tone="green" />
          <div>
            <h1>{teacher.full_name}</h1>
            <p className="teacher-detail__title">{teacher.title}</p>
            <p className="teacher-detail__rating">★ {teacher.rating_avg.toFixed(1)} / 5.0</p>
          </div>
        </div>

        <p className="teacher-detail__bio">{teacher.bio}</p>

        <h2>Bằng cấp & chứng chỉ</h2>
        <ul className="teacher-detail__credentials">
          {teacher.credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <h2>Khoá học phụ trách</h2>
        {taughtCourses.length === 0 ? (
          <p>Chưa có khoá học được gán.</p>
        ) : (
          <div className="teacher-courses">
            {taughtCourses.map((c) => (
              <div className="teacher-courses__item" key={c.course_id}>
                <Button to={`/khoa-hoc/${c.slug}`} variant="ghost">
                  {c.course_name}
                </Button>
                <span>{formatPrice(c.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
