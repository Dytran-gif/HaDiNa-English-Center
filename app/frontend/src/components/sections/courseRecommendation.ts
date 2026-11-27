import type { PublicCourse } from "../../services/usePublicCourse";
import type { SurveyResult } from "./surveyConfig";

export function recommendCourse(answers: Record<string, string>, courses: PublicCourse[]): SurveyResult {
  const pattern = { kids: /kid|teen|cambridge|thieu nhi/, communication: /communication|conversation|giao tiep/, academic: /\bsat\b|academic/, ielts: /ielts/ }[answers.goal] ?? /ielts/;
  const band = { beginner: 0, intermediate: 4, advanced: 6 }[answers.level] ?? 0;
  const matches = courses.filter(course => pattern.test(`${course.course_name} ${course.description}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
  matches.sort((a, b) => Math.abs(a.band_from - band) - Math.abs(b.band_from - band) || (answers.pace === "intensive" ? b.sessions_per_week - a.sessions_per_week : a.sessions_per_week - b.sessions_per_week) || a.course_id - b.course_id);
  const course = matches[0];
  return course ? { courseName: course.course_name, slug: course.slug, reason: `Band ${course.band_from} → ${course.band_to}, ${course.total_sessions} buổi, ${course.sessions_per_week} buổi/tuần. Trung tâm sẽ tư vấn thêm để xác định trình độ phù hợp.` }
    : { courseName: "Khám phá các khóa học đang có", slug: "", reason: "Chưa tìm được khóa học phù hợp với lựa chọn này. Bạn có thể xem danh sách hoặc đăng ký để trung tâm tư vấn thêm." };
}
