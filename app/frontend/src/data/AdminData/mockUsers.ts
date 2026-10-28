import type { User } from "../../types";

// LƯU Ý: src/data/users.ts chỉ có tài khoản demo dùng để đăng nhập, chưa có
// danh sách người dùng đầy đủ để hiển thị bảng quản lý. File này bổ sung thêm
// vài user mẫu CHỈ để trang Quản lý người dùng có dữ liệu hiển thị.
// TODO: khi có backend thật, thay bằng API lấy danh sách user thật.
export const adminMockUsers: User[] = [
    {
        user_id: 1,
        full_name: "Lê Văn Duy",
        email: "duy@example.com",
        phone: "0901234567",
        role: "student",
        created_at: "2026-07-01T08:00:00",
    },
    {
        user_id: 2,
        full_name: "Nguyễn Thị Lan",
        email: "teacher@demo.com",
        phone: "0902000002",
        role: "teacher",
        created_at: "2026-07-01T08:00:00",
    },
    {
        user_id: 3,
        full_name: "Trần Quản Trị",
        email: "admin@demo.com",
        phone: "0902000003",
        role: "admin",
        created_at: "2026-07-01T08:00:00",
    },
    {
        user_id: 4,
        full_name: "Phạm Minh Anh",
        email: "minhanh@example.com",
        phone: "0903111222",
        role: "student",
        created_at: "2026-07-15T09:00:00",
    },
];
