import type { ReviewPeriod, StudentReviewBody } from "../../../types/teacherApi";

export const periodLabel: Record<ReviewPeriod, string> = { Monthly: "Hằng tháng", MidCourse: "Giữa khóa", EndCourse: "Cuối khóa" };

export const reviewFields: [keyof StudentReviewBody, string][] = [
  ["attitude", "Thái độ học tập"], ["attendanceComment", "Chuyên cần"], ["strengths", "Điểm mạnh"], ["improvements", "Cần cải thiện"],
  ["listeningComment", "Listening"], ["readingComment", "Reading"], ["writingComment", "Writing"], ["speakingComment", "Speaking"],
  ["overallComment", "Nhận xét chung"],
];

export function blankReview(classId: number): StudentReviewBody {
  const d = new Date();
  return { classId, period: "Monthly", periodLabel: `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` };
}
