import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import InitialsBlock from "../components/ui/InitialsBlock";
import usePublicTeachers from "../services/usePublicTeachers";
import TeacherLoadState from "../components/ui/TeacherLoadState";
import TestimonialCard from "../components/ui/TestimonialCard";
import usePublicReviews from "../services/usePublicReviews";
import NotFound from "./NotFound";
import "./TeacherDetail.css";

export default function TeacherDetail() {
  const { slug = "" } = useParams();
  const { teachers, loading, error, reload } = usePublicTeachers();
  const teacher = teachers.find(t => t.slug === slug);
  const { reviews } = usePublicReviews(slug, 20);
  if (loading || error) return <PageShell><div className="container teacher-detail"><TeacherLoadState loading={loading} error={error} empty={false} reload={reload}/></div></PageShell>;

  if (!teacher) {
    return <NotFound />;
  }

  // Khóa phụ trách lấy từ lớp thật của giáo viên (cùng dữ liệu với cổng Giáo viên), không còn danh sách cứng
  const taughtCourses = teacher.courses ?? [];

  return (
    <PageShell>
      <div className="container teacher-detail">
        <Button to="/giao-vien" variant="ghost" className="teacher-detail__back">
          ← Đội ngũ giáo viên
        </Button>

        <div className="teacher-detail__head">
          {teacher.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.full_name}
              className="teacher-detail__avatar"
            />
          ) : (
            <InitialsBlock initials={teacher.initials} size="lg" tone="green" />
          )}

          <div>
            <h1>{teacher.full_name}</h1>
            <p className="teacher-detail__title">{teacher.title}</p>
            {teacher.rating != null && (
              <p className="teacher-detail__rating" aria-label={`Điểm đánh giá ${teacher.rating} trên 5`}>
                <span aria-hidden="true">★</span> {teacher.rating.toFixed(1)} · {teacher.review_count} đánh giá của học viên
              </p>
            )}
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
                  {c.name}
                </Button>
                <span>{c.has_open_class ? "Đang mở lớp" : "Chưa có lớp mới"}</span>
              </div>
            ))}
          </div>
        )}

        <h2>Học viên đánh giá</h2>
        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào được duyệt.</p>
        ) : (
          <div className="teacher-detail__reviews">
            {reviews.map(r => <TestimonialCard key={r.review_id} review={r} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}