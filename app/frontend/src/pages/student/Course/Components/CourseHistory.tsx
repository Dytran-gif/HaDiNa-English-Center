import { useState } from 'react';
import type { StudentScheduleHistoryItem } from "../../../../services/student/useStudentApi";
import './CourseHistory.css';

const ITEMS_PER_PAGE = 6; // Số khóa hiển thị trên 1 trang

const STATUS_LABEL: Record<string, string> = {
    Active: 'Active',
    OnHold: 'On Hold',
    Dropped: 'Dropped',
    Completed: 'Completed',
    Cancelled: 'Cancelled'
};

// "2026-10-05" -> "05/10/2026"
function formatDate(d?: string) {
    if (!d || d === 'N/A') return '—';
    const parts = d.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
}

interface CourseHistoryProps {
    items: StudentScheduleHistoryItem[]; // Các khóa đã qua (ghi danh không còn Active)
}

export default function CourseHistoryFE({ items }: CourseHistoryProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <section className="ch-section">
            <header className="ch-header">
                <div className="ch-header-left">
                    <div className="ch-header-icon">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div>
                        <h3 className="ch-title">Course History</h3>
                        <p className="ch-subtitle">Các khóa bạn đã hoàn thành hoặc không còn theo học</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <span className="ch-total">{items.length} khóa</span>
                )}
            </header>

            {paginatedItems.length > 0 ? (
                <>
                    <div className="ch-grid">
                        {paginatedItems.map((item) => (
                            <article key={item.enrollmentId} className="ch-card">
                                <div className="ch-card-head">
                                    <div className="ch-card-title">
                                        <h4 className="ch-course">{item.courseName}</h4>
                                        <span className="ch-class">{item.className} · Class #{item.classId}</span>
                                    </div>
                                    <span className={`ch-status status-${item.status.toLowerCase()}`}>
                                        {STATUS_LABEL[item.status] ?? item.status}
                                    </span>
                                </div>

                                <div className="ch-rows">
                                    <div className="ch-row">
                                        <i className="fa-solid fa-chalkboard-user"></i>
                                        <span>GV: <strong>{item.teacherName}</strong></span>
                                    </div>
                                    <div className="ch-row">
                                        <i className="fa-regular fa-calendar-days"></i>
                                        <span>{formatDate(item.startDate)} → {formatDate(item.endDate)}</span>
                                    </div>
                                    <div className="ch-row">
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span>Đăng ký: {formatDate(item.registeredAt)}</span>
                                    </div>
                                </div>

                                <div className="ch-tags">
                                    {item.band && <span className="ch-tag band">{item.band}</span>}
                                    <span className="ch-tag">{item.totalSessions} sessions</span>
                                </div>
                            </article>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="ch-pagination">
                            <span className="ch-page-info">
                                Trang <strong>{page}</strong> / {totalPages}
                            </span>
                            <div className="ch-pages">
                                <button
                                    className="ch-page-btn"
                                    disabled={page === 1}
                                    onClick={() => setCurrentPage(page - 1)}
                                    aria-label="Trang trước"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button
                                    className="ch-page-btn"
                                    disabled={page === totalPages}
                                    onClick={() => setCurrentPage(page + 1)}
                                    aria-label="Trang sau"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="ch-empty">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <p>Chưa có khóa học nào đã qua.</p>
                    <span>Các khóa bạn hoàn thành hoặc nghỉ học sẽ được lưu tại đây.</span>
                </div>
            )}
        </section>
    );
}