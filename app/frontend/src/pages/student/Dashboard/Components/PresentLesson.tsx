import React from 'react';
import { mockCourses } from "../../../../data/StudentData/MainData";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import bannerImage from "../../../../assets/images/Banner-dashboard.png";
import bannerArrowImage from "../../../../assets/images/Banner-arrow-dashboard.png";
import "./PresentLesson.css";

export default function PresentLessonFE() {
    // Lấy khóa học đầu tiên làm bài học hiển thị (Demo)
    const currentCourse: Course | undefined = mockCourses[0];

    // Kiểm tra an toàn, nếu không có dữ liệu thì không render thẻ để tránh lỗi
    if (!currentCourse) return null;

    return (
        <section className="next-lesson-section">
            {/* Lớp nền gradient mờ */}
            <div className="bg-gradient-overlay"></div>

            {/* Cột trái: Thông tin kêu gọi hành động */}
            <div className="left-column">
                <span className="badge">
                    Continue Learning
                </span>

                <h2 className="title">
                    Your next lesson is ready!
                </h2>

                <p className="description">
                    Continue where you left off and make progress towards your goals.
                </p>

                <button className="continue-btn">
                    <svg className="icon-play" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Continue Lesson</span>
                </button>
            </div>

            {/* Cột giữa: Thẻ bài học */}
            <div className="middle-column card">
                <img
                    src={currentCourse.imageUrl || "/api/placeholder/400/200"}
                    alt={currentCourse.name}
                    className="card-image"
                />
                <h3 className="card-title">
                    Band {currentCourse.bandFrom} - {currentCourse.bandTo}: {currentCourse.name}
                </h3>
                <p className="card-subtitle">
                    {currentCourse.description || `${currentCourse.totalSessions} Sessions`}
                </p>
            </div>

            {/* Cột phải: Hình ảnh minh họa */}
            <div className="right-column">
                <div className="decorative-text">
                    Better English <br /> Brighter Future
                </div>
                <img
                    src={bannerArrowImage}
                    className="arrow-image"
                    alt="Arrow styling"
                />
                <img
                    src={bannerImage}
                    alt={currentCourse.name}
                    className="illustration-image"
                />
            </div>
        </section>
    );
}