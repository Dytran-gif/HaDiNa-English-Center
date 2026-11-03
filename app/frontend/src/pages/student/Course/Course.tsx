import { useState } from "react";
import "../General.css";
import { useStudentApi, useStudentCourses } from "../../../services/student/useStudentApi";
import CourseMainFE from "./Components/CourseMain";
import CourseSidebarFE from "./Components/CourseSidebar";
import CourseBottomFE from "./Components/CourseBottom";

import type { Course } from '../../../types/StudentTypes/MainTypes';

export default function StudentCourse() {
    // 1. State lưu danh sách các khóa học người dùng đã chọn
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [registering, setRegistering] = useState(false);

    // 2. Danh sách khóa học từ BE + API client
    const { data: courses } = useStudentCourses();
    const api = useStudentApi();

    // 3. Hàm xử lý khi bấm nút "View details" (hoặc "Register") ở Khu vực 1
    const handleSelectCourse = (course: Course) => {
        // Kiểm tra nếu khóa học đã có trong giỏ hàng thì không thêm lại
        if (!selectedCourses.some(c => c.id === course.id)) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    // 4. Hàm xử lý khi bấm nút Xóa ở Khu vực 2 (Bottom)
    const handleRemoveCourse = (courseId: string) => {
        setSelectedCourses(selectedCourses.filter(c => c.id !== courseId));
    };

    // 5. Đăng ký tất cả khóa đang chọn: gọi BE từng khóa, báo thành công/thất bại
    const handleRegisterAll = async () => {
        if (selectedCourses.length === 0 || registering) return;
        setRegistering(true);

        const okIds: string[] = [];
        const failed: string[] = [];

        for (const course of selectedCourses) {
            try {
                await api.send("POST", `courses/${course.id}/register`);
                okIds.push(course.id);
            } catch (err) {
                failed.push(`${course.name}: ${err instanceof Error ? err.message : "Lỗi không xác định"}`);
            }
        }

        setRegistering(false);
        if (okIds.length > 0) alert(`Đăng ký thành công ${okIds.length} khóa học!`);
        if (failed.length > 0) alert(`Đăng ký thất bại:\n${failed.join("\n")}`);

        // Bỏ các khóa đã đăng ký thành công khỏi giỏ hàng
        setSelectedCourses(prev => prev.filter(c => !okIds.includes(c.id)));
    };

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9"> 
                    {/* Truyền hàm xử lý chọn khóa học vào đây */}
                    <CourseMainFE courses={courses} onSelectCourse={handleSelectCourse} />
                </div>
                
                <div className="col-3"> 
                    <CourseSidebarFE />
                </div>
                
                <div className="col-12"> 
                    {/* Đưa CourseBottomFE vào đây và truyền state cùng hàm xóa */}
                    <CourseBottomFE 
                        selectedCourses={selectedCourses} 
                        onRemoveCourse={handleRemoveCourse} 
                        onRegister={handleRegisterAll}
                    />
                </div>
            </div>
        </div>
    );
}