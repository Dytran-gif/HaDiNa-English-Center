import type { Course } from "../../types";
import { formatPrice } from "../../data/courses";
import { getCategoryById } from "../../data/categories";
import Tag from "./Tag";
import Button from "./Button";
import "./CourseCard.css";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const category = getCategoryById(course.category_id);

  return (
    <article className="course-card">
      <div className="course-card__top">
        {category && <Tag tone="red">{category.category_name}</Tag>}
        <span className="course-card__level">{course.level}</span>
      </div>
      <h3 className="course-card__title">{course.course_name}</h3>
      <p className="course-card__desc">{course.short_description}</p>
      <dl className="course-card__meta">
        <div>
          <dt>Thời lượng</dt>
          <dd>{course.duration_weeks} tuần</dd>
        </div>
        <div>
          <dt>Học phí</dt>
          <dd>{formatPrice(course.price)}</dd>
        </div>
      </dl>
      <Button to={`/khoa-hoc/${course.slug}`} variant="outline" className="course-card__cta">
        Xem chi tiết
      </Button>
    </article>
  );
}
