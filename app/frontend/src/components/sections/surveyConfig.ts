// Survey questions only. Recommendations resolve actual API courses in courseRecommendation.ts.

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
