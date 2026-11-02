import { mockStudents, mockUsers } from "../MainData";

// ID học viên đang làm việc hiện tại (đồng bộ với các component khác)
const currentStudentId = "std-01";

// Tìm thông tin học viên từ bảng Students
const currentStudent = mockStudents.find(s => s.id === currentStudentId) || mockStudents[0];

// Tìm thông tin tài khoản tương ứng từ bảng Users thông qua userId
const currentUser = currentStudent 
    ? mockUsers.find(u => u.id === currentStudent.userId) 
    : mockUsers[0];

export const studentUser = {
    name: currentStudent ? currentStudent.fullName : "User",
    email: currentUser ? currentUser.email : "User@gmail.com",
    avatar: currentUser?.avatarUrl || "👨‍💻",
};