import type { ClassItem } from "../../../types/StudentTypes/MainTypes";

export const mockClasses: ClassItem[] = [
    // Các lớp đang diễn ra (Active)
    { id: "GEN-A1-01", courseId: "c1", teacherId: "tch-01", name: "Lớp General English A1 K01", startDate: "2025-05-19", endDate: "2025-07-28", maxStudents: 15, meetingUrl: "https://zoom.us/j/123456789", schedules: [] },
    { id: "SPE-B1-01", courseId: "c2", teacherId: "tch-01", name: "Lớp Speaking B1 K01", startDate: "2025-05-20", endDate: "2025-08-05", maxStudents: 12, meetingUrl: "https://zoom.us/j/234567890", schedules: [] },
    
    // Các lớp quá khứ (Completed / Cancelled)
    { id: "BUS-01", courseId: "c4", teacherId: "tch-04", name: "Lớp Business English K01", startDate: "2025-01-10", endDate: "2025-03-20", maxStudents: 15, meetingUrl: "", schedules: [] },
    { id: "GRA-01", courseId: "c5", teacherId: "tch-03", name: "Lớp Grammar Master K02", startDate: "2024-11-15", endDate: "2025-01-20", maxStudents: 15, meetingUrl: "", schedules: [] },
    { id: "PRO-01", courseId: "c6", teacherId: "tch-05", name: "Lớp Phát âm IPA K01", startDate: "2024-09-01", endDate: "2024-10-15", maxStudents: 10, meetingUrl: "", schedules: [] },
    { id: "IEL-65-OLD", courseId: "c3", teacherId: "tch-02", name: "Lớp IELTS Intensive 2024", startDate: "2024-06-01", endDate: "2024-08-30", maxStudents: 10, meetingUrl: "", schedules: [] },
    { id: "IEL-LR-01", courseId: "c7", teacherId: "tch-02", name: "Lớp IELTS LR Booster K01", startDate: "2024-04-10", endDate: "2024-06-10", maxStudents: 12, meetingUrl: "", schedules: [] },
    { id: "GEN-A1-OLD", courseId: "c1", teacherId: "tch-01", name: "Lớp General English Khóa 2024", startDate: "2024-01-15", endDate: "2024-03-30", maxStudents: 15, meetingUrl: "", schedules: [] }
];