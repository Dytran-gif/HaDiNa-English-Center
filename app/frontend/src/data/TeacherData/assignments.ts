import type { Assignment, Submission } from "../../types";

// Mock bài tập/kiểm tra + bài nộp — chưa có backend thật.
export const teacherAssignmentsSeed: Assignment[] = [
    {
        assignment_id: 1,
        course_id: 1,
        title: "Writing Task 2 - Chủ đề Giáo dục",
        description: "Viết bài luận 250 từ trở lên theo đề Writing Task 2 chủ đề giáo dục.",
        due_date: "2026-08-25",
        created_at: "2026-08-11",
    },
    {
        assignment_id: 2,
        course_id: 1,
        title: "Luyện đề Reading Test 3",
        description: "Hoàn thành đề Reading Test 3 trong sách giáo trình, nộp ảnh chụp bài làm.",
        due_date: "2026-08-22",
        created_at: "2026-08-09",
    },
];

export const teacherSubmissionsSeed: Submission[] = [
    { submission_id: 1, assignment_id: 1, user_id: 1, status: "submitted", submitted_at: "2026-08-20" },
    { submission_id: 2, assignment_id: 1, user_id: 4, status: "not_submitted" },
    { submission_id: 3, assignment_id: 2, user_id: 1, status: "graded", submitted_at: "2026-08-15", score: 8, feedback: "Làm tốt, chú ý quản lý thời gian." },
    { submission_id: 4, assignment_id: 2, user_id: 4, status: "submitted", submitted_at: "2026-08-16" },
];
