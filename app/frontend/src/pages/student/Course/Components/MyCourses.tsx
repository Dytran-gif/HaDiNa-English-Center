import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ClassStatus, StudentEnrollmentItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "../../StudentExtra.css";

interface MyCoursesProps {
    items: StudentEnrollmentItem[];     // ghi danh còn Active
    onCancel: (item: StudentEnrollmentItem) => void;
    onBrowse: () => void;
}

const ORDER: ClassStatus[] = ["Ongoing", "Upcoming", "Finished"];
const ICON: Record<ClassStatus, string> = { Ongoing: "fa-circle-play", Upcoming: "fa-hourglass-half", Finished: "fa-circle-check" };

// "Khóa của tôi": lọc Đang học / Sắp học / Đã học theo ngày của lớp (không theo trạng thái ghi danh)
export default function MyCourses({ items, onCancel, onBrowse }: MyCoursesProps) {
    const { t, money, date } = useLang();
    const navigate = useNavigate();
    const counts = Object.fromEntries(ORDER.map(s => [s, items.filter(i => i.classStatus === s).length])) as Record<ClassStatus, number>;
    const [filter, setFilter] = useState<ClassStatus>(() => ORDER.find(s => counts[s] > 0) ?? "Ongoing");
    const list = items.filter(i => i.classStatus === filter);
    const owing = items.filter(i => i.remainingAmount > 0);
    const owingTotal = owing.reduce((sum, i) => sum + i.remainingAmount, 0);

    if (items.length === 0) {
        return (
            <div className="sx-empty">
                <p style={{ fontWeight: 700, color: "#111827" }}>{t("my.emptyTitle")}</p>
                <p>{t("my.emptyDesc")}</p>
                <button type="button" className="sx-btn is-primary" onClick={onBrowse}>
                    <i className="fa-solid fa-compass"></i> {t("my.browse")}
                </button>
            </div>
        );
    }

    return (
        <section style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div className="sx-seg" role="group" aria-label={t("sx.filterLabel")}>
                    {ORDER.map(s => (
                        <button key={s} type="button" className={`is-${s.toLowerCase()}`} aria-pressed={filter === s} onClick={() => setFilter(s)}>
                            <i className={`fa-solid ${ICON[s]}`}></i> {t(`sx.class.${s}`)} <span className="sx-count">{counts[s]}</span>
                        </button>
                    ))}
                </div>
                {owing.length > 0 && (
                    <button type="button" className="sx-btn" onClick={() => navigate("/student/tuition")}>
                        <i className="fa-solid fa-wallet"></i> {t("sx.owing", { amount: money(owingTotal) })}
                    </button>
                )}
            </div>

            {list.length === 0 ? (
                <div className="sx-empty">{t(`sx.empty.${filter}`)}</div>
            ) : (
                <div className="sx-grid">
                    {list.map(item => {
                        const pct = item.classTotalSessions ? Math.min(100, Math.round(100 * item.sessionsDone / item.classTotalSessions)) : 0;
                        const daysLeft = Math.ceil((new Date(`${item.startDate}T00:00:00`).getTime() - Date.now()) / 86400000);
                        return (
                            <article key={item.enrollmentId} className={`sx-card is-${item.classStatus.toLowerCase()}`}>
                                <div className="sx-card-head">
                                    <span className="sx-code">{item.classCode}</span>
                                    <span className={`sx-chip is-${item.classStatus.toLowerCase()}`}>{t(`sx.class.${item.classStatus}`)}</span>
                                </div>
                                <h4>{item.course.name}</h4>
                                <div className="sx-muted">
                                    {t("common.teacher")} {item.teacherName}
                                    {item.scheduleText ? ` · ${item.scheduleText}` : ""}
                                </div>
                                {item.classStatus === "Upcoming" ? (
                                    <div className="sx-muted">{t("sx.startsOn", { date: date(item.startDate), days: Math.max(daysLeft, 0) })}</div>
                                ) : (
                                    <div>
                                        <span className="sx-muted">{t("sx.progress", { done: item.sessionsDone, total: item.classTotalSessions })}</span>
                                        <div className="sx-progress"><i style={{ width: `${pct}%` }} /></div>
                                    </div>
                                )}
                                <div className="sx-muted">
                                    <span className={`sx-chip is-${item.paymentStatus.toLowerCase()}`}>{t(`sx.pay.${item.paymentStatus}`)}</span>
                                    {item.remainingAmount > 0 && <> · {t("sx.remaining", { amount: money(item.remainingAmount) })}</>}
                                    {item.pendingAmount > 0 && <> · {t("sx.pendingShort", { amount: money(item.pendingAmount) })}</>}
                                </div>
                                <div className="sx-card-actions">
                                    {item.classStatus !== "Upcoming" && (
                                        <button type="button" className="sx-btn" onClick={() => navigate("/student/schedule")}>
                                            <i className="fa-regular fa-calendar"></i> {t("sx.schedule")}
                                        </button>
                                    )}
                                    {item.remainingAmount > 0 && (
                                        <button type="button" className="sx-btn" onClick={() => navigate("/student/tuition")}>
                                            <i className="fa-solid fa-wallet"></i> {t("sx.payNow")}
                                        </button>
                                    )}
                                    {item.canCancel && (
                                        <button type="button" className="sx-btn is-danger" onClick={() => onCancel(item)}>
                                            {t("sx.cancelEnrollment")}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
