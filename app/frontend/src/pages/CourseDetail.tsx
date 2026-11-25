import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import TeacherCard from "../components/ui/TeacherCard";
import { getCourseBySlug, formatPrice } from "../data/courses";
import { getCategoryById } from "../data/categories";
import usePublicTeachers from "../services/usePublicTeachers";
import usePublicCourse from "../services/usePublicCourse";
import NotFound from "./NotFound";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { slug = "" } = useParams();
  const course = getCourseBySlug(slug);
  const { teachers } = usePublicTeachers();
  const { course: live } = usePublicCourse(slug);

  if (!course) {
    return <NotFound />;
  }

  const category = getCategoryById(course.category_id);
  const teacher = teachers.find(t => t.teacher_id === course.teacher_id);

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
          <span className="course-summary__price">{formatPrice(live?.final_price ?? course.price)}</span>
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

        {/* Lớp thật đang mở của khóa (DB, Admin quản lý); khóa chưa gắn slug thì không hiện mục này */}
        {live && (
          <section className="course-classes" aria-labelledby="open-classes">
            <h2 id="open-classes">Lớp đang mở</h2>
            {live.open_classes.length === 0 ? (
              <p>Hiện chưa có lớp mới. Để lại thông tin để trung tâm báo khi mở lớp.</p>
            ) : (
              <div className="course-classes__list">
                {live.open_classes.map(c => (
                  <article key={c.code} className="course-classes__item">
                    <div>
                      <span className="course-classes__code">{c.code}</span>
                      <h3>{c.name}</h3>
                      <p>{c.schedule}</p>
                    </div>
                    <dl>
                      <div><dt>Khai giảng</dt><dd>{new Date(c.start_date).toLocaleDateString("vi-VN")}</dd></div>
                      <div><dt>Giáo viên</dt><dd>{c.teacher_slug ? <Button to={`/giao-vien/${c.teacher_slug}`} variant="ghost">{c.teacher_name}</Button> : c.teacher_name}</dd></div>
                      <div><dt>Còn chỗ</dt><dd>{c.seats_left > 0 ? `${c.seats_left} chỗ` : "Đã đủ"}</dd></div>
                    </dl>
                    <Button to={c.seats_left > 0 ? "/dang-ky" : undefined} variant={c.seats_left > 0 ? "primary" : "outline"} disabled={c.seats_left === 0}>
                      {c.seats_left > 0 ? "Đăng ký lớp này" : "Hết chỗ"}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

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
