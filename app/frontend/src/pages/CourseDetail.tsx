import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import TeacherCard from "../components/ui/TeacherCard";
import { getCourseBySlug, formatPrice } from "../data/courses";
import { getCategoryById } from "../data/categories";
import { getTeacherById } from "../data/teachers";
import NotFound from "./NotFound";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { slug = "" } = useParams();
  const course = getCourseBySlug(slug);

  if (!course) {
    return <NotFound />;
  }

  const category = getCategoryById(course.category_id);
  const teacher = getTeacherById(course.teacher_id);

  return (
    <PageShell>
      <div className="container course-detail">
        <Button to="/khoa-hoc" variant="ghost" className="course-detail__back">
          ← Tất cả khoá học
        </Button>

        <div className="course-detail__tags">
          {category && <Tag tone="red">{category.category_name}</Tag>}
          <Tag>{course.level}</Tag>
        </div>

        <h1>{course.course_name}</h1>
        <p className="course-detail__desc">{course.description}</p>

        <div className="course-summary">
          <span className="course-summary__price">{formatPrice(course.price)}</span>
          <dl>
            <div>
              <dt>Thời lượng</dt>
              <dd>{course.duration_weeks} tuần</dd>
            </div>
            <div>
              <dt>Lịch học</dt>
              <dd>{course.schedule}</dd>
            </div>
            <div>
              <dt>Trình độ</dt>
              <dd>{course.level}</dd>
            </div>
          </dl>
          <div className="course-summary__actions">
            <Button to="/dang-ky" variant="primary">
              Đăng ký khoá học
            </Button>
            <Button to="/lien-he" variant="ghost">
              Cần tư vấn thêm →
            </Button>
          </div>
        </div>

        <h2>Nội dung khoá học</h2>
        <ul className="course-detail__outline">
          {course.outline.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {teacher && (
          <>
            <h2>Giáo viên phụ trách</h2>
            <TeacherCard teacher={teacher} />
          </>
        )}
      </div>
    </PageShell>
  );
}
