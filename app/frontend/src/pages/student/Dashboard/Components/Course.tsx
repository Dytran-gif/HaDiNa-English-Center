import React, { useRef, useState } from 'react';
import { mockCourses } from "../../../../data/StudentData/MainData";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import "./Course.css";

export default function CourseFE() {
    // Các state và ref để xử lý kéo cuộn ngang
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Khi nhấn chuột xuống
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    // Khi thả chuột ra
    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Khi di chuyển chuột (đang nhấn giữ)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 0.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <section className="continue-learning-section">
            <header className="section-header">
                <div className="header-left">
                    <div className="header-icon">
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="header-text">
                        <h2 className="section-title">Present Lessons</h2>
                        <p className="section-subtitle">Pick up where you left off</p>
                    </div>
                </div>
                <a href="#courses" className="view-all-link">
                    View all courses <span>→</span>
                </a>
            </header>

            {/* Gắn ref và các sự kiện chuột vào div cuộn */}
            <div
                className={`cards-grid horizontal-scroll-wrapper ${isDragging ? 'active-drag' : ''}`}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUpOrLeave}
                onMouseUp={handleMouseUpOrLeave}
                onMouseMove={handleMouseMove}
            >
                {mockCourses.slice(0, 10).map((course: Course) => (
                    <div
                        key={course.id}
                        className="course-card scroll-item"
                        style={{
                            backgroundImage: course.imageUrl ? `url("${course.imageUrl}")` : undefined
                        }}
                    >
                        <div className="course-content">
                            <h3 className="course-title">
                                {course.name}
                            </h3>
                            <div className="course-info">
                                {/* Dòng 1: Trình độ Band và Số buổi / tuần */}
                                <div className="course-meta">
                                    <span className="info-level">Band {course.bandFrom} - {course.bandTo}</span>
                                    <span className="meta-divider">•</span>
                                    <span className="info-time">{course.sessionsPerWeek} sessions/wk</span>
                                </div>

                                {/* Dòng 2: Tổng số buổi, Học phí & Giảm giá */}
                                <div className="info-skills">
                                    <span className="skill-tag">{course.totalSessions} Sessions</span>
                                    <span className="skill-tag">{course.tuition.toLocaleString('vi-VN')} VND</span>
                                    {course.discountPercent > 0 && (
                                        <span className="skill-tag discount-tag">-{course.discountPercent}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}