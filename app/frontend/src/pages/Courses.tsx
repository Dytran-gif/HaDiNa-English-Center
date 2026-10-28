import { useMemo, useState } from "react";
import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import CourseCard from "../components/ui/CourseCard";
import MiniCta from "../components/ui/MiniCta";
import { courses } from "../data/courses";
import { categories } from "../data/categories";
import "./Courses.css";

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return courses;
    return courses.filter((c) => c.category_id === activeCategory);
  }, [activeCategory]);

  return (
    <PageShell>
      <PageBanner
        kicker="Chương trình đào tạo"
        title="Khoá học tại Happy IELTS"
        description="Từ nền tảng đến nâng cao, mỗi lộ trình đều được thiết kế riêng theo mục tiêu đầu ra của học viên."
      />

      <div className="container courses-list">
        <div className="pill-tabs courses-list__tabs">
          <button
            type="button"
            className={activeCategory === "all" ? "is-active" : ""}
            onClick={() => setActiveCategory("all")}
          >
            Tất cả khoá học
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              type="button"
              className={activeCategory === cat.category_id ? "is-active" : ""}
              onClick={() => setActiveCategory(cat.category_id)}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p>Chưa có khoá học nào trong danh mục này.</p>
        ) : (
          <div className="courses-list__grid">
            {filtered.map((course) => (
              <CourseCard course={course} key={course.course_id} />
            ))}
          </div>
        )}

        <MiniCta />
      </div>
    </PageShell>
  );
}
