import type { Grade } from "../../types";

// Mock điểm số khởi tạo — chưa có backend thật.
export const teacherGradesSeed: Grade[] = [
    { grade_id: 1, course_id: 1, user_id: 1, skill: "Writing", score: 6.5, graded_at: "2026-08-05" },
    { grade_id: 2, course_id: 1, user_id: 1, skill: "Speaking", score: 7.0, graded_at: "2026-08-05" },
    { grade_id: 3, course_id: 1, user_id: 4, skill: "Writing", score: 5.5, graded_at: "2026-08-05" },
];
