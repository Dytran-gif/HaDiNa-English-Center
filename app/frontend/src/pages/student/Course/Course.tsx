import { useState } from "react";
import "../General.css";
import CourseMainFE from "./Components/CourseMain";
import CourseSidebarFE from "./Components/CourseSidebar";
import CourseBottomFE from "./Components/CourseBottom";

import type { Course } from '../../../types/StudentTypes/MainTypes';

export default function StudentCourse() {
    // 1. Tạo state để lưu danh sách các khóa học người dùng đã chọn
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

    // 2. Hàm xử lý khi bấm nút "View details" (hoặc "Register") ở Khu vực 1
    const handleSelectCourse = (course: Course) => {
        // Kiểm tra nếu khóa học đã có trong giỏ hàng thì không thêm lại
        if (!selectedCourses.some(c => c.id === course.id)) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    // 3. Hàm xử lý khi bấm nút Xóa ở Khu vực 2 (Bottom)
    const handleRemoveCourse = (courseId: string) => {
        setSelectedCourses(selectedCourses.filter(c => c.id !== courseId));
    };

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9"> 
                    {/* Truyền hàm xử lý chọn khóa học vào đây */}
                    <CourseMainFE onSelectCourse={handleSelectCourse} />
                </div>
                
                <div className="col-3"> 
                    <CourseSidebarFE />
                </div>
                
                <div className="col-12"> 
                    {/* Đưa CourseBottomFE vào đây và truyền state cùng hàm xóa */}
                    <CourseBottomFE 
                        selectedCourses={selectedCourses} 
                        onRemoveCourse={handleRemoveCourse} 
                    />
                </div>
            </div>
        </div>
    );
}