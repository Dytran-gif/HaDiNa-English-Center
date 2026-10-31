import type { ClassScheduleItem } from "../../../types/StudentTypes/MainTypes";

export const mockClassSchedules: ClassScheduleItem[] = [
    // Lịch lớp GEN-A1-01 (T2, T4, T6)
    { id: "cs-01", classId: "GEN-A1-01", roomId: "rm-101", dayOfWeek: "Mon", startTime: "08:30", endTime: "12:30" },
    { id: "cs-02", classId: "GEN-A1-01", roomId: "rm-101", dayOfWeek: "Wed", startTime: "08:30", endTime: "12:30" },
    { id: "cs-03", classId: "GEN-A1-01", roomId: "rm-101", dayOfWeek: "Fri", startTime: "08:30", endTime: "12:30" },
    
    // Lịch lớp SPE-B1-01 (T3, T5)
    { id: "cs-04", classId: "SPE-B1-01", roomId: "rm-102", dayOfWeek: "Tue", startTime: "10:30", endTime: "12:30" },
    { id: "cs-05", classId: "SPE-B1-01", roomId: "rm-102", dayOfWeek: "Thu", startTime: "10:30", endTime: "12:30" },
    
    // Lịch lớp IEL-65-01 (T2, T4, T6)
    { id: "cs-06", classId: "IEL-65-01", roomId: "rm-201", dayOfWeek: "Mon", startTime: "18:00", endTime: "20:00" }
];