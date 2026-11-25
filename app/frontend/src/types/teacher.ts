export interface TeacherCourseLink {
  course_id: number;
  name: string;
  slug: string;
  has_open_class: boolean;
}

export interface Teacher {
  teacher_id: number;
  account_teacher_id?: number | null; // gắn tài khoản giáo viên thật (cổng Giáo viên); null = hồ sơ giới thiệu cũ
  slug: string;
  full_name: string;
  title: string;
  bio: string;
  credentials: string[];
  initials: string;
  avatar?: string;
  courses?: TeacherCourseLink[];      // khóa phụ trách lấy từ lớp thật
  rating?: number | null;             // trung bình đánh giá đã duyệt
  review_count?: number;
}
