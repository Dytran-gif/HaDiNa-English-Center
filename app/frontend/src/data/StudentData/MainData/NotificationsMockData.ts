import type { AppNotification } from "../../../types/StudentTypes/MainTypes";

export const mockNotifications: AppNotification[] = [
    { id: "not-01", classId: "SPE-B1-01", title: "Thông báo nghỉ học", message: "Lớp học tạm nghỉ do giáo viên nghỉ phép đột xuất.", noticeDate: "2025-05-22", type: "Cancellation", createdAt: "2025-05-18 09:30" },
    { id: "not-02", classId: "GEN-A1-01", title: "Thông báo đổi phòng", message: "Lớp chuyển sang học tại Room 102.", noticeDate: "2025-05-25", type: "ScheduleChange", createdAt: "2025-05-19 14:00" },
    { id: "not-03", title: "Lịch nghỉ lễ Quốc khánh", message: "Toàn bộ trung tâm nghỉ từ ngày 02/09 đến hết 03/09.", type: "General", createdAt: "2025-08-25 08:00" },
    { id: "not-04", classId: "IEL-65-01", title: "Thông báo học bù", message: "Lớp sẽ học bù vào Chủ Nhật tuần này lúc 14:00.", noticeDate: "2025-06-01", type: "ScheduleChange", createdAt: "2025-05-28 10:15" },
    { id: "not-05", classId: "BUS-01", title: "Nhắc nhở kiểm tra cuối khóa", message: "Bài kiểm tra sẽ diễn ra vào buổi học tiếp theo.", noticeDate: "2025-06-10", type: "General", createdAt: "2025-06-05 16:30" }
];