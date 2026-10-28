import type { Teacher } from "../types";

export const teachers: Teacher[] = [
  {
    teacher_id: 1,
    slug: "hoang-huy",
    full_name: "Thầy Hoàng Huy",
    title: "Thạc sĩ — FHNW University, Switzerland",
    initials: "HH",
    rating_avg: 4.9,
    credentials: ["FHNW University", "IELTS 8.5", "8 năm giảng dạy"],
    bio: "Tốt nghiệp thạc sĩ tại FHNW University, Thụy Sĩ. Người xây dựng mô hình học University Lecture của Happy IELTS, chuyên luyện Writing và Speaking cho học viên target band 7.0+.",
  },
  {
    teacher_id: 2,
    slug: "le-khanh-hoang",
    full_name: "Lê Khánh Hoàng",
    title: "Thạc sĩ Ngôn ngữ học",
    initials: "LH",
    rating_avg: 4.8,
    credentials: [
      "Thạc sĩ Ngôn ngữ học",
      "Giảng viên ĐH Kinh tế Tài chính TP.HCM",
    ],
    bio: "Giảng viên chính thức tại Đại học Kinh tế Tài chính TP.HCM, chuyên đào tạo nền tảng ngữ pháp và tư duy ngôn ngữ cho học viên mọi trình độ.",
  },
  {
    teacher_id: 3,
    slug: "vu-dinh-nam",
    full_name: "Vũ Đình Nam",
    title: "Cử nhân Đại học Việt Đức — SAT 1500",
    initials: "VN",
    rating_avg: 4.9,
    credentials: ["Đại học Việt Đức", "SAT 1500"],
    bio: "Cử nhân Đại học Việt Đức, đạt SAT 1500. Phụ trách lộ trình luyện thi SAT tại Happy IELTS với phương pháp bám sát tiêu chí chấm điểm thực tế.",
  },
  {
    teacher_id: 4,
    slug: "hoang-anh-vu",
    full_name: "Hoàng Anh Vũ",
    title: "Cử nhân Kinh tế đối ngoại — ĐH Ngoại Thương",
    initials: "AV",
    rating_avg: 4.7,
    credentials: ["Đại học Ngoại Thương", "Chuyên đào tạo Kid & Teenager"],
    bio: "Tốt nghiệp cử nhân ngành Kinh tế đối ngoại, Đại học Ngoại Thương. Phụ trách chương trình Kid & Teenager, xây nền tảng tiếng Anh và tư duy phản biện cho học viên nhỏ tuổi.",
  },
];

export function getTeacherBySlug(slug: string): Teacher | undefined {
  return teachers.find((t) => t.slug === slug);
}

export function getTeacherById(id: number): Teacher | undefined {
  return teachers.find((t) => t.teacher_id === id);
}
