import type { Enrollment } from "../../../types/StudentTypes/MainTypes";

export const mockEnrollments: Enrollment[] = [
    // 2 Lớp đang học (Hiển thị trên Thời khóa biểu tuần)
    { id: "enr-01", studentId: "std-01", classId: "GEN-A1-01", tuitionFee: 2000000, discountPercent: 0, discountAmount: 0, finalTuitionFee: 2000000, status: "Active", createdAt: "2025-05-10" },
    { id: "enr-02", studentId: "std-01", classId: "SPE-B1-01", tuitionFee: 1800000, discountPercent: 10, discountAmount: 180000, finalTuitionFee: 1620000, status: "Active", createdAt: "2025-05-11" },

    // 6 Lớp quá khứ (Hiển thị bên bảng Term History - 5 ở Trang 1, 1 ở Trang 2)
    { id: "enr-03", studentId: "std-01", classId: "BUS-01", tuitionFee: 2500000, discountPercent: 0, discountAmount: 0, finalTuitionFee: 2500000, status: "Completed", createdAt: "2025-01-05" },
    { id: "enr-04", studentId: "std-01", classId: "GRA-01", tuitionFee: 1500000, discountPercent: 15, discountAmount: 225000, finalTuitionFee: 1275000, status: "Completed", createdAt: "2024-11-10" },
    { id: "enr-05", studentId: "std-01", classId: "PRO-01", tuitionFee: 1200000, discountPercent: 0, discountAmount: 0, finalTuitionFee: 1200000, status: "Completed", createdAt: "2024-08-25" },
    { id: "enr-06", studentId: "std-01", classId: "IEL-65-OLD", tuitionFee: 4500000, discountPercent: 5, discountAmount: 225000, finalTuitionFee: 4275000, status: "Cancelled", createdAt: "2024-05-20" },
    { id: "enr-07", studentId: "std-01", classId: "IEL-LR-01", tuitionFee: 2200000, discountPercent: 5, discountAmount: 110000, finalTuitionFee: 2090000, status: "Completed", createdAt: "2024-04-01" },
    { id: "enr-08", studentId: "std-01", classId: "GEN-A1-OLD", tuitionFee: 2000000, discountPercent: 0, discountAmount: 0, finalTuitionFee: 2000000, status: "Completed", createdAt: "2024-01-08" }
];