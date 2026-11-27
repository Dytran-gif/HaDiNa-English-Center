import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import TeacherCard from "../components/ui/TeacherCard";
import { courseBand, formatCoursePrice } from "../services/usePublicCourses";
import usePublicTeachers from "../services/usePublicTeachers";
import usePublicCourse from "../services/usePublicCourse";
import NotFound from "./NotFound";
import ConsultationDialog from "../components/ui/ConsultationDialog";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { slug = "" } = useParams();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const { teachers } = usePublicTeachers();
  const { course, loading, error, reload } = usePublicCourse(slug);

  if (loading && !course) return <PageShell><div className="container course-detail" role="status">Đang tải khóa học…</div></PageShell>;
  if (error) return <PageShell><div className="container course-detail" role="alert"><p>{error}</p><Button onClick={() => void reload()}>Thử lại</Button></div></PageShell>;

  if (!course) {
    return <NotFound />;
  }

  const live = course;
  const courseTeachers = teachers.filter(t => course.open_classes.some(c => c.teacher_slug === t.slug));

  return (
    <PageShell>
      <div className="container course-detail">
        <Button to="/khoa-hoc" variant="ghost" className="course-detail__back">
          ← Tất cả khoá học
        </Button>

        <div className="course-detail__tags">
          <Tag>{courseBand(course)}</Tag>
        </div>

        <h1>{course.course_name}</h1>
        <p className="course-detail__desc">{course.description}</p>

        <div className="course-summary">
          <span className="course-summary__price">{formatCoursePrice(course.final_price)}</span>
          <dl>
            <div>
              <dt>Thời lượng</dt>
              <dd>{course.total_sessions} buổi</dd>
            </div>
            <div>
              <dt>Lịch học</dt>
              <dd>{course.sessions_per_week} buổi/tuần</dd>
            </div>
            <div>
              <dt>Trình độ</dt>
              <dd>{courseBand(course)}</dd>
            </div>
          </dl>
          <div className="course-summary__actions">
            <Button type="button" onClick={() => setRegistrationOpen(true)} variant="primary">
              Đăng ký khóa học
            </Button>
            <Button type="button" onClick={() => setRegistrationOpen(true)} variant="ghost">
              Cần tư vấn thêm →
            </Button>
          </div>
        </div>

        {/* Classes belong to this course; teacher and schedule are displayed per class. */}
        {live && (
          <section className="course-classes" aria-labelledby="open-classes">
            <h2 id="open-classes">Lớp đang mở</h2>
            <p className="course-classes__help">Trung tâm sẽ xếp lớp và giáo viên phù hợp sau khi học viên đăng ký khóa học.</p>
            {live.open_classes.length === 0 ? (
              <p>Hiện chưa có lớp mới. Để lại thông tin để trung tâm báo khi mở lớp.</p>
            ) : (
              <div className="course-classes__list">
                {live.open_classes.map(c => (
                  <article key={c.id} className="course-classes__item">
                    <div className="course-classes__intro">
                      <h3>{c.name}</h3>
                      <p>{c.schedule}</p>
                    </div>
                    <dl>
                      <div><dt>Khai giảng</dt><dd>{new Date(c.start_date).toLocaleDateString("vi-VN")}</dd></div>
                      <div><dt>Giáo viên</dt><dd>{c.teacher_slug ? <Link className="course-classes__teacher" to={`/giao-vien/${c.teacher_slug}`}>{c.teacher_name}</Link> : c.teacher_name}</dd></div>
                      <div><dt>Còn chỗ</dt><dd>{c.seats_left > 0 ? `${c.seats_left} chỗ` : "Đã đủ"}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {courseTeachers.length > 0 && (
          <>
            <h2>Giáo viên giảng dạy</h2>
            <div className="course-detail__teachers">{courseTeachers.map(teacher => <TeacherCard key={teacher.teacher_id} teacher={teacher} />)}</div>
          </>
        )}
      </div>
      {registrationOpen && <ConsultationDialog key={course.course_id} course={course} onClose={() => setRegistrationOpen(false)} />}
    </PageShell>
  );
}
