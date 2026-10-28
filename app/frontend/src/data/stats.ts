export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "8+", label: "Năm hoạt động" },
  { value: "10+", label: "Cơ sở trên toàn quốc" },
  { value: "200+", label: "Học viên đạt IELTS 8.0+" },
  { value: "100%", label: "Giáo viên chuyên môn chất lượng cao" },
  { value: "5.000+", label: "Học viên cán đích" },
  { value: "10+", label: "Đối tác bạch kim IDP & British Council" },
];

export interface WhyDifferentItem {
  title: string;
  bullets: string[];
}

export const whyDifferentItems: WhyDifferentItem[] = [
  {
    title: "Mô hình học độc quyền University Lecture",
    bullets: [
      "Mô hình học nâng band hiệu quả, vận dụng kiến thức một cách “thực chiến”",
      "60 tiết Lecture tự chọn khác nhau bên cạnh các buổi học cố định",
      "Đa dạng chủ đề, hỗ trợ định hướng và phát triển khả năng ngôn ngữ của bản thân",
      "Miễn phí 100% và không giới hạn cho toàn bộ học viên",
    ],
  },
  {
    title: "Khoá học trực tuyến bổ trợ chất lượng cao",
    bullets: [
      "Tất cả khoá học đều đi kèm Online Courses bổ trợ miễn phí 100%",
      "Video bài giảng học thuật biên soạn bởi đội ngũ chuyên gia Happy IELTS",
      "Bổ trợ kiến thức, giúp học viên rèn luyện mọi lúc mọi nơi",
    ],
  },
  {
    title: "Giáo trình học thuật chuyên sâu thiết kế riêng biệt",
    bullets: [
      "Giáo trình giảng dạy được thiết kế riêng biệt theo đúng lộ trình",
      "Kết hợp các chương trình đào tạo được nghiên cứu chuyên sâu từ các nhà xuất bản hàng đầu về ngôn ngữ",
      "Đa dạng chủ đề, dạng bài có độ khó nâng dần, phù hợp với trình độ học viên",
    ],
  },
];

export const heroUsps: string[] = [
  "Mô hình học tiên phong University Lecture",
  "Nâng band cấp tốc chỉ sau 90 giờ học",
  "Chuyên đào tạo IELTS / SAT / Tiếng Anh Trẻ Em",
  "Cam kết chất lượng đầu ra",
];
