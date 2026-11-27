import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import CourseCard from "../ui/CourseCard";
import usePublicCourses from "../../services/usePublicCourses";
import "./CourseShowcase.css";

export default function CourseShowcase() {
  const { courses, loading, error, reload } = usePublicCourses();
  return <section className="course-showcase"><div className="container">
    <SectionHeading kicker="Chương trình đào tạo" title="Khám phá các khóa học tại trung tâm" />
    {loading && <p role="status">Đang tải khóa học…</p>}
    {error ? <div role="alert"><p>{error}</p><Button onClick={() => void reload()}>Thử lại</Button></div> : !loading && courses.length === 0 ? <p>Hiện chưa có khóa học được công bố.</p> : <div className="course-showcase__catalog">{courses.slice(0, 6).map(course => <CourseCard key={course.course_id} course={course} />)}</div>}
    <Button to="/khoa-hoc" variant="ghost">Xem tất cả khóa học{courses.length ? ` (${courses.length})` : ""} →</Button>
  </div></section>;
}
