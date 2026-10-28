import type { TeachingMaterial } from "../../types";

// Mock tài liệu giảng dạy — chưa có backend/lưu trữ file thật.
export const teacherMaterialsSeed: TeachingMaterial[] = [
    {
        material_id: 1,
        course_id: 1,
        teacher_id: 1,
        title: "Slide bài giảng Tuần 1 - Ngữ pháp nền tảng",
        description: "Tổng hợp ngữ pháp cơ bản cho học viên mất gốc.",
        file_name: "tuan-1-ngu-phap-nen-tang.pdf",
        uploaded_at: "2026-08-01",
    },
    {
        material_id: 2,
        course_id: 1,
        teacher_id: 1,
        title: "Đề luyện Writing Task 2 tổng hợp",
        description: "Bộ 20 đề Writing Task 2 theo chủ đề thường gặp.",
        file_name: "de-writing-task-2-tong-hop.docx",
        uploaded_at: "2026-08-08",
    },
];
