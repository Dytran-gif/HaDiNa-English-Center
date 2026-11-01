import React, { useState, useMemo } from 'react';
import { mockCourses } from "../../../../data/StudentData/MainData";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import './CourseMain.css';

// Component nhận vào hàm onSelectCourse để truyền dữ liệu xuống Khu vực 2 (Bottom)
interface CourseMainProps {
    onSelectCourse: (course: Course) => void;
}

export default function CourseMainFE({ onSelectCourse }: CourseMainProps) {
    // STATES CHO BỘ LỌC
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [selectedSkill, setSelectedSkill] = useState('All Skills');
    const [selectedType, setSelectedType] = useState('All Types');

    // LOGIC LỌC KHÓA HỌC (Kết hợp nhiều điều kiện dựa trên thuộc tính DB)
    const filteredCourses = useMemo(() => {
        return mockCourses.filter((course: Course) => {
            // 1. Lọc theo Search (Tên khóa học)
            const matchSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());

            // 2. Lọc theo Level (Dựa trên bandFrom / bandTo)
            let matchLevel = true;
            if (selectedLevel !== 'All Levels') {
                const bandStr = `${course.bandFrom}-${course.bandTo}`.toUpperCase();
                if (selectedLevel === 'Beginner') matchLevel = bandStr.includes('A1') || bandStr.includes('A2');
                if (selectedLevel === 'Intermediate') matchLevel = bandStr.includes('B1') || bandStr.includes('B2') || bandStr.includes('5.5');
                if (selectedLevel === 'Advanced') matchLevel = bandStr.includes('C1') || bandStr.includes('C2') || bandStr.includes('6.5');
            }

            // 3. Lọc theo Skill (Kiểm tra từ khóa trong Tên hoặc Mô tả)
            let matchSkill = true;
            if (selectedSkill !== 'All Skills') {
                const content = `${course.name} ${course.description}`.toLowerCase();
                matchSkill = content.includes(selectedSkill.toLowerCase());
            }

            // 4. Lọc theo Type (Kiểm tra từ khóa trong Tên khóa học)
            let matchType = true;
            if (selectedType !== 'All Types') {
                const name = course.name.toLowerCase();
                if (selectedType === 'General') matchType = name.includes('general') || name.includes('daily');
                if (selectedType === 'Academic') matchType = name.includes('academic') || name.includes('ielts');
                if (selectedType === 'Business') matchType = name.includes('business') || name.includes('practical');
            }

            return matchSearch && matchLevel && matchSkill && matchType;
        });
    }, [searchQuery, selectedLevel, selectedSkill, selectedType]);

    // Các mốc Level để render nút
    const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

    // Các tùy chọn cho Dropdown
    const skills = ['All Skills', 'Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Pronunciation'];
    const courseTypes = ['All Types', 'General', 'Academic', 'Business'];

    return (
        <div className="course-main-section">
            {/* TIÊU ĐỀ */}
            <header className="cm-header">
                <h1 className="cm-title">Find the Right Course for You</h1>
                <p className="cm-subtitle">Choose from a variety of English courses designed for your goals and level. Study offline at our center and build your future!</p>
            </header>

            {/* BỘ LỌC VÀ TÌM KIẾM */}
            <div className="cm-filters-container">
                {/* Hàng 1: Nút Level & Thanh tìm kiếm */}
                <div className="cm-filter-row-1">
                    <div className="cm-level-tabs">
                        {levels.map(level => (
                            <button
                                key={level}
                                className={`cm-level-btn ${selectedLevel === level ? 'active' : ''}`}
                                onClick={() => setSelectedLevel(level)}
                            >
                                {level === 'Beginner' ? 'Beginner (A1-A2)' :
                                    level === 'Intermediate' ? 'Intermediate (B1-B2)' :
                                        level === 'Advanced' ? 'Advanced (C1-C2)' : level}
                            </button>
                        ))}
                    </div>
                    <div className="cm-search-box">
                        <i className="fa-solid fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Hàng 2: Dropdowns */}
                <div className="cm-filter-row-2">
                    <div className="cm-dropdown">
                        <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
                            {skills.map(skill => <option key={skill} value={skill}>{skill === 'All Skills' ? 'Skill' : skill}</option>)}
                        </select>
                    </div>
                    <div className="cm-dropdown">
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                            {courseTypes.map(type => <option key={type} value={type}>{type === 'All Types' ? 'Course Type' : type}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* DANH SÁCH KHÓA HỌC */}
            <div className="cm-course-list-wrapper">
                <div className="cm-course-grid">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course: Course) => (
                            <div key={course.id} className="cm-course-card">
                                {/* Ảnh và Level Badge */}
                                <div className="cm-card-image">
                                    <img src={course.imageUrl || "/api/placeholder/400/200"} alt={course.name} />
                                    <span className="cm-badge badge-beginner">
                                        Band {course.bandFrom} - {course.bandTo}
                                    </span>
                                </div>

                                {/* Nội dung thẻ */}
                                <div className="cm-card-content">
                                    <h3 className="cm-card-title">{course.name}</h3>
                                    <p className="cm-card-desc">{course.description}</p>

                                    {/* Thông tin khóa học thực tế từ DB */}
                                    <div className="cm-card-meta">
                                        <span><i className="fa-regular fa-clock"></i> {course.totalSessions} sessions</span>
                                        <span><i className="fa-solid fa-calendar-days"></i> {course.sessionsPerWeek} sessions/wk</span>
                                    </div>

                                    {/* Tags Thông tin bổ sung */}
                                    <div className="cm-card-skills">
                                        <span className="cm-skill-tag">{course.totalSessions} Sessions</span>
                                        <span className="cm-skill-tag">Band {course.bandFrom}-{course.bandTo}</span>
                                        {course.discountPercent > 0 && (
                                            <span className="cm-skill-tag discount-tag">-{course.discountPercent}%</span>
                                        )}
                                    </div>
                                </div>

                                {/* Giá và Nút */}
                                <div className="cm-card-footer">
                                    <span className="cm-price">
                                        {course.tuition.toLocaleString('vi-VN')} VND
                                    </span>

                                    <div className="cm-card-actions">
                                        <button
                                            className="cm-register-btn"
                                            onClick={() => onSelectCourse(course)}
                                        >
                                            Register
                                        </button>

                                        <button
                                            className="cm-view-btn"
                                            onClick={() => {
                                                console.log("Sẽ mở popup cho khóa học:", course.name);
                                            }}
                                        >
                                            View details <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="cm-no-results">No courses match your criteria. Please adjust your filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
}