import React, { useState, useMemo } from 'react';
import type { Course, CourseLevel, SkillRange } from '../../../../types/StudentTypes/MainTypes';
import { coursesData } from '../../../../data/StudentData/MainData';
import './CourseMain.css';

// Component nhận vào hàm onSelectCourse để sau này truyền dữ liệu xuống Khu vực 2 (Bottom)
interface CourseMainProps {
    onSelectCourse: (course: Course) => void;
}

export default function CourseMainFE({ onSelectCourse }: CourseMainProps) {
    // STATES CHO BỘ LỌC
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<CourseLevel>('All Levels');
    const [selectedSkill, setSelectedSkill] = useState('All Skills');
    const [selectedType, setSelectedType] = useState('All Types');

    // LOGIC LỌC KHÓA HỌC (Kết hợp nhiều điều kiện cùng lúc)
    const filteredCourses = useMemo(() => {
        return coursesData.filter((course) => {
            // 1. Lọc theo Search (Tên khóa học)
            const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

            // 2. Lọc theo Level
            const matchLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;

            // 3. Lọc theo Skill
            const matchSkill = selectedSkill === 'All Skills' || course.skills.includes(selectedSkill as SkillRange);

            // 4. Lọc theo Type (Giả lập dựa vào tên khóa học)
            let matchType = true;
            if (selectedType !== 'All Types') {
                if (selectedType === 'General') matchType = course.title.includes('General') || course.title.includes('Daily');
                if (selectedType === 'Academic') matchType = course.title.includes('Academic');
                if (selectedType === 'Business') matchType = course.title.includes('Business') || course.title.includes('Practical');
            }

            return matchSearch && matchLevel && matchSkill && matchType;
        });
    }, [searchQuery, selectedLevel, selectedSkill, selectedType]);

    // Các mốc Level để render nút
    const levels: CourseLevel[] = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

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

                {/* Hàng 2: Dropdowns (Đã bỏ Time và Location) */}
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

            {/* DANH SÁCH KHÓA HỌC (Có thanh trượt dọc nếu vượt quá 6 thẻ) */}
            <div className="cm-course-list-wrapper">
                <div className="cm-course-grid">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map(course => (
                            <div key={course.id} className="cm-course-card">
                                {/* Ảnh và Level Badge */}
                                <div className="cm-card-image">
                                    <img src={course.imageUrl} alt={course.title} />
                                    <span className={`cm-badge badge-${course.level.toLowerCase()}`}>
                                        {course.level}
                                    </span>
                                </div>

                                {/* Nội dung thẻ */}
                                <div className="cm-card-content">
                                    <h3 className="cm-card-title">{course.title}</h3>
                                    <p className="cm-card-desc">{course.description}</p>

                                    {/* Thông tin khóa học (Đã bỏ location) */}
                                    <div className="cm-card-meta">
                                        <span><i className="fa-regular fa-clock"></i> {course.durationHours} hours</span>
                                        <span><i className="fa-solid fa-user-group"></i> {course.studentCapacity}</span>
                                    </div>

                                    {/* Tags Kỹ năng */}
                                    <div className="cm-card-skills">
                                        {course.skills.map(skill => (
                                            <span key={skill} className="cm-skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Giá và Nút */}
                                <div className="cm-card-footer">
                                    <span className="cm-price">
                                        {course.price.toLocaleString('vi-VN')} VND
                                    </span>

                                    {/* Nhóm 2 nút lại để dễ căn chỉnh */}
                                    <div className="cm-card-actions">
                                        {/* Nút Register: Vẫn giữ nguyên logic đẩy xuống Khu vực Bottom */}
                                        <button
                                            className="cm-register-btn"
                                            onClick={() => onSelectCourse(course)}
                                        >
                                            Register
                                        </button>

                                        {/* Nút View details: Tạm thời để trống, chờ ghép Modal/Popup sau */}
                                        <button
                                            className="cm-view-btn"
                                            onClick={() => {
                                                // TODO: Sau này gọi hàm mở Modal/Popup hiển thị chi tiết khóa học tại đây
                                                console.log("Sẽ mở popup cho khóa học:", course.title);
                                                // alert("Chức năng hiển thị popup chi tiết đang được phát triển!");
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