import type { ScheduleRequest } from "../../types";

// Mock yêu cầu xin nghỉ / đổi lịch dạy — chưa có backend thật.
export const teacherScheduleRequestsSeed: ScheduleRequest[] = [
    {
        request_id: 1,
        teacher_id: 1,
        course_id: 1,
        type: "swap",
        original_date: "2026-08-24",
        proposed_date: "2026-08-26",
        reason: "Trùng lịch cá nhân, xin đổi sang buổi khác trong tuần.",
        status: "approved",
        created_at: "2026-08-15",
    },
];
