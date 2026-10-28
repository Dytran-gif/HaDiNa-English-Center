import SectionHeading from "../ui/SectionHeading";
import CertificateMock from "../ui/CertificateMock";
import Button from "../ui/Button";
import { getCourseBySlug } from "../../data/courses";
import "./CourseShowcase.css";

const panels = [
  {
    course: getCourseBySlug("ielts-tai-trung-tam"),
    tone: "pink",
    certLabel: "IELTS",
    certAccent: "#d94f6a",
  },
  {
    course: getCourseBySlug("kid-teenager"),
    tone: "blue",
    certLabel: "CAMBRIDGE",
    certAccent: "#2563eb",
  },
  {
    course: getCourseBySlug("sat-preparation"),
    tone: "beige",
    certLabel: "SAT",
    certAccent: "#0f7a44",
  },
] as const;

export default function CourseShowcase() {
  return (
    <section className="course-showcase">
      <div className="container">
        <SectionHeading
          kicker="Chương trình đào tạo"
          title="Các chương trình có thể phù hợp với bạn"
        />

        <div className="course-showcase__grid">
          {panels.map((panel, i) => {
            if (!panel.course) return null;
            return (
              <article
                className={`course-showcase__panel course-showcase__panel--${panel.tone} ${
                  i === 0 ? "course-showcase__panel--wide" : ""
                }`}
                key={panel.course.course_id}
              >
                <div className="course-showcase__copy">
                  <h3>{panel.course.course_name}</h3>
                  <p>{panel.course.description}</p>
                  <Button to={`/khoa-hoc/${panel.course.slug}`} variant="outline">
                    Tìm hiểu thêm →
                  </Button>
                  <span
                    className="course-showcase__wordmark"
                    style={{ color: panel.certAccent }}
                  >
                    {panel.certLabel}
                  </span>
                </div>
                <div className="course-showcase__visual">
                  <CertificateMock label={panel.certLabel} accent={panel.certAccent} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
