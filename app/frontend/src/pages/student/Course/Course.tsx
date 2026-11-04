import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../General.css";
import { useStudentApi, useStudentCourses, useStudentEnrollments } from "../../../services/student/useStudentApi";
import CourseMainFE from "./Components/CourseMain";
import CourseSidebarFE from "./Components/CourseSidebar";
import CourseBottomFE from "./Components/CourseBottom";

import type { Course } from '../../../types/StudentTypes/MainTypes';

export default function StudentCourse() {
    const navigate = useNavigate();

    // 1. Danh sách khóa học (catalog) + danh sách ghi danh của học viên từ BE
    const { data: courses } = useStudentCourses();
    const { data: enrollments, reload: reloadEnrollments } = useStudentEnrollments();
    const api = useStudentApi();
    const [registering, setRegistering] = useState(false);

    // 2. Bấm Register trên thẻ khóa -> lưu thẳng ghi danh xuống DB (BE chặn đăng ký trùng)
    const handleRegisterCourse = async (course: Course) => {
        if (registering) return;
        setRegistering(true);
        try {
            await api.send("POST", `courses/${course.id}/register`);
            alert(`Đăng ký thành công khóa ${course.name}!`);
            reloadEnrollments();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Đăng ký thất bại.");
        } finally {
            setRegistering(false);
        }
    };

    // 3. Bấm nút xóa ở khối dưới -> xóa ghi danh trong DB
    const handleDeleteEnrollment = async (enrollmentId: number) => {
        try {
            await api.send("DELETE", `enrollments/${enrollmentId}`);
            reloadEnrollments();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Không thể hủy đăng ký.");
        }
    };

    // 4. Nút Payment Now -> sang trang học phí
    const handleGoTuition = () => navigate("/student/tuition");

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9"> 
                    {/* Truyền hàm xử lý đăng ký khóa học vào đây */}
                    <CourseMainFE courses={courses} onRegisterCourse={handleRegisterCourse} />
                </div>
                
                <div className="col-3"> 
                    <CourseSidebarFE />
                </div>
                
                <div className="col-12"> 
                    {/* Khối khóa đã đăng ký: đọc từ DB, xóa gọi API, thanh toán sang trang tuition */}
                    <CourseBottomFE 
                        enrolledCourses={enrollments} 
                        onDelete={handleDeleteEnrollment} 
                        onGoTuition={handleGoTuition}
                    />
                </div>
            </div>
        </div>
    );
}
