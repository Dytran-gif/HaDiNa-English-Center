import { useMemo, useState } from 'react';
import type { StudentScheduleHistoryItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './CourseHistory.css';
import "../../StudentExtra.css";

interface CourseHistoryProps {
    items: StudentScheduleHistoryItem[]; // Lớp đã học xong hoặc đã nghỉ / bảo lưu
}

// Lịch sử khóa học dạng thư mục: năm -> từng lớp; mở một lớp thấy chuyên cần, bài tập đã nộp, nhận xét của GV
export default function CourseHistoryFE({ items }: CourseHistoryProps) {
    const { t, date } = useLang();
    const years = useMemo(() => {
        const map = new Map<number, StudentScheduleHistoryItem[]>();
        for (const item of items) map.set(item.year, [...(map.get(item.year) ?? []), item]);
        return [...map.entries()].sort((a, b) => b[0] - a[0]);
    }, [items]);
    const [openYears, setOpenYears] = useState<Record<number, boolean>>({});
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = items.find(i => i.enrollmentId === selectedId) ?? items[0];

    if (items.length === 0) {
        return (
            <div className="ch-empty">
                <i className="fa-solid fa-folder-open"></i>
                <p>{t("history.empty")}</p>
                <span>{t("history.emptySub")}</span>
            </div>
        );
    }

    const isOpen = (year: number) => openYears[year] ?? true;
    const pct = (a: number, b: number) => (b > 0 ? Math.round((100 * a) / b) : 0);

    return (
        <section className="ch-section">
            <header className="ch-header">
                <div className="ch-header-left">
                    <div className="ch-header-icon"><i className="fa-solid fa-folder-tree"></i></div>
                    <div>
                        <h3 className="ch-title">{t("history.title")}</h3>
                        <p className="ch-subtitle">{t("sx.historySub")}</p>
                    </div>
                </div>
                <span className="ch-total">{t("history.count", { n: items.length })}</span>
            </header>

            <div className="sx-folder">
                <nav className="sx-tree" aria-label={t("history.title")}>
                    {years.map(([year, list]) => (
                        <div key={year}>
                            <button type="button" className="sx-tree-year" aria-expanded={isOpen(year)}
                                onClick={() => setOpenYears(o => ({ ...o, [year]: !isOpen(year) }))}>
                                <i className={`fa-solid ${isOpen(year) ? "fa-folder-open" : "fa-folder"}`} style={{ color: "#f0a020" }}></i>
                                {year} <span className="sx-muted">({list.length})</span>
                            </button>
                            {isOpen(year) && list.map(item => (
                                <button key={item.enrollmentId} type="button" className="sx-tree-item"
                                    aria-current={selected?.enrollmentId === item.enrollmentId}
                                    onClick={() => setSelectedId(item.enrollmentId)}>
                                    <span><i className="fa-regular fa-folder"></i> {item.courseName}</span>
                                    <span className="sx-muted">{item.className}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {selected && (
                    <article className="ch-card" style={{ margin: 0 }}>
                        <div className="ch-card-head">
                            <div className="ch-card-title">
                                <h4 className="ch-course">{selected.courseName}</h4>
                                <span className="ch-class">{selected.className}</span>
                            </div>
                            <span className={`sx-chip ${selected.status === "Active" ? "is-finished" : "is-danger"}`}>
                                {selected.status === "Active" ? t("sx.class.Finished") : t(`status.${selected.status.toLowerCase()}`)}
                            </span>
                        </div>
                        <div className="ch-rows">
                            <div className="ch-row"><i className="fa-solid fa-chalkboard-user"></i><span>{t("schedule.teacher")} <strong>{selected.teacherName}</strong></span></div>
                            <div className="ch-row"><i className="fa-regular fa-calendar-days"></i><span>{date(selected.startDate)} → {date(selected.endDate)}</span></div>
                            <div className="ch-row"><i className="fa-regular fa-pen-to-square"></i><span>{t("history.registered")} {date(selected.registeredAt)}</span></div>
                        </div>
                        <div className="sx-stats">
                            <div className="sx-stat">
                                <span>{t("sx.attendanceRate")}</span>
                                <b>{selected.markedSessions ? `${pct(selected.attendedSessions, selected.markedSessions)}%` : "—"}</b>
                                <div className="sx-muted">{t("sx.attendedOf", { a: selected.attendedSessions, b: selected.markedSessions })}</div>
                            </div>
                            <div className="sx-stat">
                                <span>{t("sx.submitted")}</span>
                                <b>{selected.submittedCount}/{selected.assignmentCount}</b>
                                <div className="sx-muted">{t("sx.submittedHint")}</div>
                            </div>
                            <div className="sx-stat">
                                <span>{t("sx.feedbacks")}</span>
                                <b>{selected.feedbackCount}</b>
                                <div className="sx-muted">{selected.lastFeedbackAt ? t("sx.lastFeedback", { date: date(selected.lastFeedbackAt) }) : t("sx.noFeedback")}</div>
                            </div>
                        </div>
                        <div className="ch-tags" style={{ marginTop: 12 }}>
                            {selected.band && <span className="ch-tag band">{selected.band}</span>}
                            <span className="ch-tag">{t("common.sessions", { n: selected.totalSessions })}</span>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}
