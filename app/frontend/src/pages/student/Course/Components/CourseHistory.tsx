import { useState } from 'react';
import type { StudentScheduleHistoryItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './CourseHistory.css';

const ITEMS_PER_PAGE = 6; // Số khóa hiển thị trên 1 trang

interface CourseHistoryProps {
    items: StudentScheduleHistoryItem[]; // Các khóa đã qua (ghi danh không còn Active)
}

export default function CourseHistoryFE({ items }: CourseHistoryProps) {
    const { t, date } = useLang();
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
                        <h3 className="ch-title">{t("history.title")}</h3>
                        <p className="ch-subtitle">{t("history.sub")}</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <span className="ch-total">{t("history.count", { n: items.length })}</span>
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
                                        {t(`status.${item.status.toLowerCase()}`)}
                                    </span>
                                </div>

                                <div className="ch-rows">
                                    <div className="ch-row">
                                        <i className="fa-solid fa-chalkboard-user"></i>
                                        <span>{t("schedule.teacher")} <strong>{item.teacherName}</strong></span>
                                    </div>
                                    <div className="ch-row">
                                        <i className="fa-regular fa-calendar-days"></i>
                                        <span>{date(item.startDate)} → {date(item.endDate)}</span>
                                    </div>
                                    <div className="ch-row">
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        <span>{t("history.registered")} {date(item.registeredAt)}</span>
                                    </div>
                                </div>

                                <div className="ch-tags">
                                    {item.band && <span className="ch-tag band">{item.band}</span>}
                                    <span className="ch-tag">{t("common.sessions", { n: item.totalSessions })}</span>
                                </div>
                            </article>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="ch-pagination">
                            <span className="ch-page-info">
                                {t("history.page", { page, pages: totalPages })}
                            </span>
                            <div className="ch-pages">
                                <button
                                    className="ch-page-btn"
                                    disabled={page === 1}
                                    onClick={() => setCurrentPage(page - 1)}
                                    aria-label={t("attendance.prev")}
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button
                                    className="ch-page-btn"
                                    disabled={page === totalPages}
                                    onClick={() => setCurrentPage(page + 1)}
                                    aria-label={t("attendance.next")}
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
                    <p>{t("history.empty")}</p>
                    <span>{t("history.emptySub")}</span>
                </div>
            )}
        </section>
    );
}