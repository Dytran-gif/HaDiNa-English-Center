import PageShell from "../components/layout/PageShell";
import useBrandName from "../services/useBrandName";
import PageBanner from "../components/ui/PageBanner";
import CourseCard from "../components/ui/CourseCard";
import MiniCta from "../components/ui/MiniCta";
import Button from "../components/ui/Button";
import usePublicCourses from "../services/usePublicCourses";
import "./Courses.css";

export default function Courses() {
  const brand = useBrandName();
  const { courses, loading, error, reload } = usePublicCourses();
  return <PageShell>
    <PageBanner kicker="Chương trình đào tạo" title={`Khoá học tại ${brand}`} description="Khám phá lộ trình, học phí và các lớp đang mở tại trung tâm." />
    <div className="container courses-list">
      {loading && <p role="status">Đang tải khóa học…</p>}
      {error ? <div role="alert"><p>{error}</p><Button onClick={() => void reload()}>Thử lại</Button></div> : !loading && courses.length === 0 ? <p>Hiện chưa có khóa học được công bố.</p> : <div className="courses-list__grid">{courses.map(course => <CourseCard course={course} key={course.course_id} />)}</div>}
      <MiniCta />
    </div>
  </PageShell>;
}
