import { useState, useMemo } from 'react';
import type { StudentScheduleHistoryItem } from "../../../../services/student/useStudentApi";
import './ScheduleHistory.css';

const ITEMS_PER_PAGE = 3; // Số khóa học tối đa hiển thị trên 1 trang

interface ScheduleHistoryProps {
    items: StudentScheduleHistoryItem[]; // Các khóa đã qua (từ BE)
}

export default function ScheduleHistoryFE({ items }: ScheduleHistoryProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const historyList = items;

    // 2. LOGIC PHÂN TRANG
    const totalPages = Math.ceil(historyList.length / ITEMS_PER_PAGE) || 1;
    
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return historyList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [historyList, currentPage]);

    return (
        <aside className="term-history-container">
            {/* Tiêu đề góc phải */}
            <header className="th-header">
                <div className="th-header-icon">
                    <i className="fa-regular fa-clock-rotate-left"></i>
                </div>
                <div>
                    <h3 className="th-title">Term History</h3>
                    <p className="th-subtitle">Your completed & past courses</p>
                </div>
            </header>

            {/* Danh sách các khóa học đã qua */}
            <div className="th-list">
                {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                        <div key={item.enrollmentId} className="th-item-card">
                            <div className="th-card-top">
                                <span className="th-course-name">{item.courseName}</span>
                                <span className={`th-status-badge status-${item.status.toLowerCase()}`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="th-card-details">
                                <div className="th-detail-row">
                                    <i className="fa-solid fa-hashtag"></i>
                                    <span>Class: <strong>{item.classId}</strong> ({item.className})</span>
                                </div>
                                <div className="th-detail-row">
                                    <i className="fa-solid fa-chalkboard-user"></i>
                                    <span>Teacher: <strong>{item.teacherName}</strong></span>
                                </div>
                                <div className="th-detail-row">
                                    <i className="fa-regular fa-calendar-days"></i>
                                    <span>Duration: {item.startDate} {item.endDate !== 'N/A' ? `→ ${item.endDate}` : ''}</span>
                                </div>
                                {item.band && (
                                    <div className="th-detail-row">
                                        <i className="fa-solid fa-layer-group"></i>
                                        <span>Level: {item.band} ({item.totalSessions} sessions)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="th-empty">No past courses found.</div>
                )}
            </div>

            {/* BỘ PHÂN TRANG (PAGINATION) */}
            {totalPages > 1 && (
                <div className="th-pagination">
                    <button 
                        className="th-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    <span className="th-page-info">
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>

                    <button 
                        className="th-page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </aside>
    );
}