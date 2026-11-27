import type { PublicCourse } from "../../services/usePublicCourse";
import { courseBand, formatCoursePrice } from "../../services/usePublicCourses";
import { assetUrl } from "../../services/apiClient";
import Button from "./Button";
import "./CourseCard.css";

export default function CourseCard({ course }: { course: PublicCourse }) {
  const image = assetUrl(course.image);
  return <article className="course-card">
    {image && <img className="course-card__image" src={image} alt={course.course_name} loading="lazy" />}
    <span className="course-card__level">{courseBand(course)}</span>
    <h3 className="course-card__title">{course.course_name}</h3>
    <p className="course-card__desc">{course.description || "Liên hệ trung tâm để được tư vấn lộ trình phù hợp."}</p>
    <dl className="course-card__meta">
      <div><dt>Thời lượng</dt><dd>{course.total_sessions} buổi</dd></div>
      <div><dt>Học phí</dt><dd>{course.discount_percent > 0 && <del>{formatCoursePrice(course.price)}</del>} {formatCoursePrice(course.final_price)}</dd></div>
    </dl>
    <Button to={`/khoa-hoc/${course.slug}`} variant="outline" className="course-card__cta">Xem chi tiết</Button>
  </article>;
}
