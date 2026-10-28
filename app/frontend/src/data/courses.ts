import type { Course } from "../types";

export const courses: Course[] = [
  {
    course_id: 1,
    slug: "ielts-tai-trung-tam",
    course_name: "IELTS tại trung tâm",
    short_description:
      "Lộ trình IELTS toàn diện, xây nền tảng vững chắc & tư duy ngôn ngữ phù hợp mọi trình độ.",
    description:
      "Lộ trình học IELTS toàn diện, được nghiên cứu, thiết kế riêng biệt, xây nền tảng Tiếng Anh vững chắc & tư duy ngôn ngữ phù hợp với mọi lứa tuổi, trình độ khác nhau.",
    category_id: 2,
    teacher_id: 1,
    price: 5500000,
    duration_weeks: 12,
    level: "Mất gốc — 7.0+",
    schedule: "Thứ 2 - 4 - 6, 18h00 - 20h00",
    outline: [
      "Xây nền tảng ngữ pháp và từ vựng học thuật",
      "60 tiết University Lecture tự chọn miễn phí",
      "Luyện 4 kỹ năng theo format đề thi thật",
      "Online Courses bổ trợ không giới hạn",
    ],
  },
  {
    course_id: 2,
    slug: "ielts-online-4-2",
    course_name: "IELTS Online 4+2",
    short_description:
      "4 buổi học cố định kết hợp 2 buổi chữa bài chuyên sâu mỗi tuần, học từ xa vẫn sát sao.",
    description:
      "Mô hình 4 buổi học chính khoá kết hợp 2 buổi chữa đề chuyên sâu mỗi tuần, giữ được sự sát sao như học tại trung tâm dù học online hoàn toàn.",
    category_id: 2,
    teacher_id: 2,
    price: 4200000,
    duration_weeks: 10,
    level: "4.5 — 6.5+",
    schedule: "Thứ 3 - 5 - 7 - CN, 19h30 - 21h30",
    outline: [
      "Giáo trình học thuật thiết kế riêng cho hình thức online",
      "Chữa bài 1:1 hai buổi mỗi tuần",
      "Video bài giảng lưu trữ, học lại không giới hạn",
    ],
  },
  {
    course_id: 3,
    slug: "ielts-online-intensive",
    course_name: "IELTS Online Intensive",
    short_description:
      "Cấp tốc nâng band trong thời gian ngắn cho học viên cần mục tiêu gấp.",
    description:
      "Khoá học cấp tốc dành cho học viên đã có nền tảng, cần nâng band trong thời gian ngắn với cường độ luyện đề cao.",
    category_id: 2,
    teacher_id: 1,
    price: 4800000,
    duration_weeks: 8,
    level: "5.5 — 7.5+",
    schedule: "Linh hoạt, 3 buổi/tuần",
    outline: [
      "Luyện đề thật mỗi buổi học",
      "Chiến lược làm bài Writing Task 2 nâng cao",
      "Kỹ năng Skimming - Scanning tốc độ cao",
    ],
  },
  {
    course_id: 4,
    slug: "english-with-huy",
    course_name: "English with Huy",
    short_description:
      "Khoá tiếng Anh nền tảng do Thầy Hoàng Huy trực tiếp đứng lớp.",
    description:
      "Khoá học tiếng Anh tổng quát, xây phản xạ giao tiếp và tư duy ngôn ngữ, do Thầy Hoàng Huy trực tiếp giảng dạy toàn bộ chương trình.",
    category_id: 2,
    teacher_id: 1,
    price: 3800000,
    duration_weeks: 8,
    level: "Mọi trình độ",
    schedule: "Thứ 2 - 4 - 6, 20h00 - 21h30",
    outline: [
      "Phát âm chuẩn IPA và ngữ điệu tự nhiên",
      "Phản xạ giao tiếp thực chiến",
      "Tư duy phản biện & lập luận bằng tiếng Anh",
    ],
  },
  {
    course_id: 5,
    slug: "sat-preparation",
    course_name: "SAT Preparation",
    short_description:
      "Lộ trình luyện thi SAT khoa học, bám sát tiêu chí đánh giá thực tế của bài thi.",
    description:
      "Luyện thi SAT tại Happy IELTS với lộ trình học tập khoa học, giúp cải thiện và phát triển toàn diện kỹ năng cho học viên với trọng tâm sát nhất với các tiêu chí đánh giá của bài thi.",
    category_id: 5,
    teacher_id: 3,
    price: 6000000,
    duration_weeks: 14,
    level: "Target 1400+",
    schedule: "Thứ 3 - 5 - 7, 18h00 - 20h00",
    outline: [
      "Chiến lược Reading & Writing bám sát Digital SAT",
      "Toán SAT: rút gọn thời gian giải đề",
      "3 bài thi thử full-length có chấm chi tiết",
    ],
  },
  {
    course_id: 6,
    slug: "kid-teenager",
    course_name: "Kid & Teenager",
    short_description:
      "Xây nền tảng tiếng Anh toàn diện cho học viên nhỏ tuổi theo chuẩn Cambridge.",
    description:
      "Xây dựng nền tảng tiếng Anh toàn diện, phát triển khả năng tư duy logic, phản biện. Đào tạo theo chuẩn đầu ra của chứng chỉ Cambridge.",
    category_id: 4,
    teacher_id: 4,
    price: 3200000,
    duration_weeks: 16,
    level: "8 — 15 tuổi",
    schedule: "Thứ 7 - CN, 9h00 - 11h00",
    outline: [
      "Lộ trình bám chuẩn Cambridge (Starters/Movers/Flyers)",
      "Học qua dự án, trò chơi ngôn ngữ",
      "Rèn tư duy phản biện song song với ngôn ngữ",
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCoursesByCategory(categoryId: number): Course[] {
  return courses.filter((c) => c.category_id === categoryId);
}

export function getCoursesByTeacher(teacherId: number): Course[] {
  return courses.filter((c) => c.teacher_id === teacherId);
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("vi-VN")}đ`;
}
