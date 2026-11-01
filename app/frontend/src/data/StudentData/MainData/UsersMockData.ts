import type { User } from "../../../types/StudentTypes/MainTypes";

export const mockUsers: User[] = [
    { id: "usr-01", email: "student.a@gmail.com", role: "Student", avatarUrl: "/avatars/std1.png", isLocked: false, createdAt: "2025-01-01" },
    { id: "usr-02", email: "student.b@gmail.com", role: "Student", avatarUrl: "/avatars/std2.png", isLocked: false, createdAt: "2025-01-05" },
    { id: "usr-03", email: "student.c@gmail.com", role: "Student", avatarUrl: "/avatars/std3.png", isLocked: false, createdAt: "2025-01-10" },
    { id: "usr-04", email: "john.smith@center.edu.vn", role: "Teacher", avatarUrl: "/avatars/tch1.png", isLocked: false, createdAt: "2024-08-15" },
    { id: "usr-05", email: "mary.johnson@center.edu.vn", role: "Teacher", avatarUrl: "/avatars/tch2.png", isLocked: false, createdAt: "2024-09-01" },
    { id: "usr-06", email: "admin@center.edu.vn", role: "Admin", avatarUrl: "/avatars/admin.png", isLocked: false, createdAt: "2024-01-01" }
];