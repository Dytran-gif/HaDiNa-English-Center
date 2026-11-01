import type { Student } from "../../../types/StudentTypes/MainTypes";

export const mockStudents: Student[] = [
    { id: "std-01", userId: "usr-01", code: "SV2025001", fullName: "Nguyễn Văn A", dateOfBirth: "2003-05-12", phone: "0901234567", address: "TP. Hồ Chí Minh", parentName: "Nguyễn Văn X", parentPhone: "0909999888", status: "Active", createdAt: "2025-01-01" },
    { id: "std-02", userId: "usr-02", code: "SV2025002", fullName: "Trần Thị B", dateOfBirth: "2004-08-20", phone: "0912345678", address: "Bình Dương", parentName: "Trần Văn Y", parentPhone: "0919999777", status: "Active", createdAt: "2025-01-05" },
    { id: "std-03", userId: "usr-03", code: "SV2025003", fullName: "Lê Văn C", dateOfBirth: "2002-11-03", phone: "0923456789", address: "Đồng Nai", parentName: "Lê Văn Z", parentPhone: "0929999666", status: "Active", createdAt: "2025-01-10" },
    { id: "std-04", userId: "usr-07", code: "SV2025004", fullName: "Phạm Minh D", dateOfBirth: "2003-01-15", phone: "0934567890", address: "TP. Hồ Chí Minh", status: "Active", createdAt: "2025-01-12" },
    { id: "std-05", userId: "usr-08", code: "SV2025005", fullName: "Hoàng Thị E", dateOfBirth: "2004-04-25", phone: "0945678901", address: "Long An", status: "Inactive", createdAt: "2025-01-15" }
];