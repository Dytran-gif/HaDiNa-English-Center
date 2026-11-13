import type { Teacher } from "../types";
import teacher1 from "../assets/images/teacher1.png";
import teacher2 from "../assets/images/teacher2.png";
import teacher3 from "../assets/images/teacher3.jpg";
import teacher4 from "../assets/images/teacher4.png";
import teacher5 from "../assets/images/teacher5.png";

export const teachers: Teacher[] = [
  {
    teacher_id: 1,
    slug: "hoang-huy",
    full_name: "Thầy Hoàng Huy",
    title: "Thạc sĩ — FHNW University, Switzerland",
    initials: "HH",
    rating_avg: 4.9,
    credentials: ["FHNW University", "IELTS 8.5", "8 năm giảng dạy"],
    bio: "Tốt nghiệp thạc sĩ tại FHNW University, Thụy Sĩ. Người xây dựng mô hình học University Lecture của Hadi IELTS, chuyên luyện Writing và Speaking cho học viên target band 7.0+.",
    avatar: teacher1,
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
      avatar: teacher2,
  },
  {
    teacher_id: 3,
    slug: "duy-quoc-tran",
    full_name: "Duy Quốc Trần",
    title: "Cử nhân Đại học Việt Đức — SAT 1500",
    initials: "VN",
    rating_avg: 4.9,
    credentials: ["Đại học Việt Đức", "SAT 1500"],
    bio: "Cử nhân Đại học Việt Đức, đạt SAT 1500. Phụ trách lộ trình luyện thi SAT tại Hadi IELTS với phương pháp bám sát tiêu chí chấm điểm thực tế.",
    avatar: teacher3,
  },
  {
    teacher_id: 4,
    slug: "nguyen-ngoc-hoang",
    full_name: "Nguyễn Ngọc Hoàng",
    title: "Cử nhân Kỹ thuật phần mềm — ĐH Quốc tế Miền Đông",
    initials: "AV",
    rating_avg: 4.7,
    credentials: ["Đại học EIU", "Chuyên đào tạo Kid & Teenager"],
    bio: "Tốt nghiệp cử nhân ngành kỹ thuật phần mềm, Đại học Quốc tế Miền Đông. Phụ trách chương trình Kid & Teenager, xây nền tảng tiếng Anh và tư duy phản biện cho học viên nhỏ tuổi.",
    avatar: teacher4,
  },
  {
    teacher_id: 5,
    slug: "tran-quoc-duy",
    full_name: "Trần Quốc Duy",
    title: "Cử nhân Kỹ thuật AI — Tiểu học mầm non",
    initials: "AV",
    rating_avg: 4.7,
    credentials: ["Tiểu học mầm non", "Chuyên đào tạo Kid & Teenager"],
    bio: "Tốt nghiệp mỗi trường tiểu học. Phụ trách chương trình quản trị AI, dạy cách làm project bằng Ctrl+C, Ctrl+V cho học viên nhỏ tuổi.",
    avatar: teacher5,
  },
];

export function getTeacherBySlug(slug: string): Teacher | undefined {
  return teachers.find((t) => t.slug === slug);
}

export function getTeacherById(id: number): Teacher | undefined {
  return teachers.find((t) => t.teacher_id === id);
}
