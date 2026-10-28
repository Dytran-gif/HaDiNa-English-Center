// Danh sách học viên theo từng khóa học — dùng cho Điểm danh / Nhập điểm / Bài tập.
// LƯU Ý: project chưa có bảng enrollment đầy đủ nối user <-> course cho mọi
// giáo viên, nên file này bổ sung roster mock CHỈ để demo các tính năng mới.
// TODO: khi có backend thật, thay bằng API lấy danh sách học viên theo lớp.
export const classRoster: Record<number, number[]> = {
    1: [1, 4], // course_id 1 -> user_id 1, 4
    3: [1, 4],
    4: [4],
    5: [1],
    6: [4],
};

export function getStudentIdsByCourse(courseId: number): number[] {
    return classRoster[courseId] ?? [];
}
