import type { ClassSchedule } from "../../../types/StudentTypes/MainTypes";

// Gom nhóm lịch học theo ID của khóa học (c1, c2, c3,...)
export const schedulesByCourseId: Record<string, ClassSchedule[]> = {
    "c1": [
        { classId: "GEN-A1-01", scheduleTime: "Mon & Wed | 18:00 - 19:30", center: "Center A", maxCapacity: 15, currentEnrolled: 15 },
        { classId: "GEN-A1-02", scheduleTime: "Sat & Sun | 09:00 - 11:00", center: "Center A", maxCapacity: 15, currentEnrolled: 8 }
    ],
    "c2": [
        { classId: "SPE-B1-02", scheduleTime: "Tue & Thu | 18:00 - 19:30", center: "Center B", maxCapacity: 12, currentEnrolled: 10 },
        { classId: "SPE-B1-03", scheduleTime: "Mon & Wed | 19:30 - 21:00", center: "Center B", maxCapacity: 12, currentEnrolled: 12 }
    ],
    "c3": [
        { classId: "BUS-C1-01", scheduleTime: "Sat & Sun | 14:00 - 16:00", center: "Center A", maxCapacity: 15, currentEnrolled: 5 }
    ],
    "c4": [
        { classId: "LIS-B1-01", scheduleTime: "Tue & Thu | 19:30 - 21:00", center: "Center C", maxCapacity: 15, currentEnrolled: 14 }
    ],
    "c5": [
        { classId: "WRI-C1-01", scheduleTime: "Mon & Wed | 18:00 - 19:30", center: "Center B", maxCapacity: 12, currentEnrolled: 12 }
    ],
    "c6": [
        { classId: "ENG-A1-04", scheduleTime: "Sat & Sun | 18:00 - 19:30", center: "Center C", maxCapacity: 15, currentEnrolled: 7 }
    ]
};