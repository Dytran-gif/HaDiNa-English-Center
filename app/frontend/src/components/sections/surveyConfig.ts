// Dữ liệu + logic cho khối khảo sát chọn khoá học trên trang chủ.
// Đặt cạnh CourseSurvey.tsx (thuộc phần trang chủ của Hoàng) để tránh
// đụng thư mục dùng chung src/data/. Slug khoá học khớp với src/data/courses.ts.

export interface SurveyOption {
  label: string;
  value: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: SurveyOption[];
}

export interface SurveyResult {
  courseName: string;
  reason: string;
  slug: string;
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "goal",
    question: "Bạn học tiếng Anh với mục tiêu nào?",
    options: [
      { label: "Thi lấy chứng chỉ IELTS", value: "ielts" },
      { label: "Giao tiếp cho công việc / cuộc sống", value: "communication" },
      { label: "Du học / mục tiêu học thuật (SAT)", value: "academic" },
      { label: "Cho con em (thiếu nhi)", value: "kids" },
    ],
  },
  {
    id: "level",
    question: "Trình độ tiếng Anh hiện tại của bạn?",
    options: [
      { label: "Mới bắt đầu / mất gốc", value: "beginner" },
      { label: "Đã có nền tảng cơ bản", value: "intermediate" },
      { label: "Khá vững, muốn nâng cao", value: "advanced" },
    ],
  },
  {
    id: "pace",
    question: "Bạn muốn học theo nhịp độ nào?",
    options: [
      { label: "Cấp tốc — cần kết quả gấp", value: "intensive" },
      { label: "Vừa phải — chắc chắn từng bước", value: "relaxed" },
    ],
  },
];

/** Suy ra khoá học gợi ý từ câu trả lời. Trả về tên + lý do + slug thật. */
export function recommendCourse(answers: Record<string, string>): SurveyResult {
  const { goal, level, pace } = answers;

  if (goal === "kids") {
    return {
      courseName: "Kid & Teenager",
      reason:
        "Lộ trình chuẩn Cambridge cho học viên nhỏ tuổi, học qua trò chơi và dự án.",
      slug: "kid-teenager",
    };
  }

  if (goal === "communication") {
    return {
      courseName: "English with Huy",
      reason:
        "Tập trung phản xạ giao tiếp thực chiến, dùng được ngay trong công việc và cuộc sống.",
      slug: "english-with-huy",
    };
  }

  if (goal === "academic") {
    return {
      courseName: "SAT Preparation",
      reason:
        "Lộ trình học thuật bám sát Digital SAT, phù hợp với mục tiêu du học.",
      slug: "sat-preparation",
    };
  }

  // Còn lại là mục tiêu IELTS
  if (pace === "intensive") {
    return {
      courseName: "IELTS Online Intensive",
      reason: "Cường độ luyện đề cao, giúp nâng band trong thời gian ngắn.",
      slug: "ielts-online-intensive",
    };
  }

  if (level === "beginner") {
    return {
      courseName: "IELTS tại trung tâm",
      reason:
        "Xây nền tảng vững chắc từ mất gốc, học trực tiếp tại trung tâm sát sao từng buổi.",
      slug: "ielts-tai-trung-tam",
    };
  }

  return {
    courseName: "IELTS Online 4+2",
    reason:
      "Cân bằng giữa buổi học chính và buổi chữa đề chuyên sâu, học online vẫn sát sao.",
    slug: "ielts-online-4-2",
  };
}
