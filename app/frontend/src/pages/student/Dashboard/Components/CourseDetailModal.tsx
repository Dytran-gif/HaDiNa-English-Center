import { useEffect, useState } from "react";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import {
    useStudentApi,
    useStudentCourseDetail,
    useStudentAssignments,
    useStudentAttendance,
    type StudentAssignmentItem
} from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "./CourseDetailModal.css";

interface Props {
    course: Course;
    onClose: () => void;
}

const DAY_KEYS: Record<string, string> = {
    Mon: "day.mon", Tue: "day.tue", Wed: "day.wed", Thu: "day.thu",
    Fri: "day.fri", Sat: "day.sat", Sun: "day.sun"
};

// getDay(): 0 = Chủ nhật .. 6 = Thứ 7
const DOW_KEYS = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

const ATT_ICON: Record<string, string> = {
    Present: "fa-circle-check", Late: "fa-clock", Absent: "fa-circle-xmark", Excused: "fa-circle-info"
};

export default function CourseDetailModal({ course, onClose }: Props) {
    const { t, money, date } = useLang();
    const [tab, setTab] = useState<'info' | 'assignments' | 'attendance'>('info');
    const [attPage, setAttPage] = useState(1);
    const { data: detail, loading: detailLoading } = useStudentCourseDetail(course.id);
    const { data: assignments, loading, reload } = useStudentAssignments(course.id);
    const { data: attendance, loading: attLoading, error: attError } = useStudentAttendance(course.id, attPage);
    const api = useStudentApi();
    const [busyId, setBusyId] = useState<number | null>(null);

    // Khoá cuộn trang nền khi popup mở: lăn hết nội dung popup sẽ không lăn lan ra dashboard.
    // Bù khoảng trống thanh cuộn để layout không bị giật khi ẩn scrollbar.
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
        };
    }, []);

    const weekdayLabel = (d: string) => {
        const dt = new Date(`${d}T00:00:00`);
        return isNaN(dt.getTime()) ? "" : t(DOW_KEYS[dt.getDay()]);
    };

    const handleDownload = async (a: StudentAssignmentItem) => {
        try {
            await api.download(`assignments/${a.id}/download`, a.fileName);
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.downloadFailed"));
        }
    };

    const handleDownloadMy = async (a: StudentAssignmentItem) => {
        try {
            await api.download(`assignments/${a.id}/my-submission/download`, a.mySubmission?.fileName);
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.downloadFailed"));
        }
    };

    const handleSubmit = async (a: StudentAssignmentItem, file: File) => {
        setBusyId(a.id);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await api.upload<{ message?: string }>(`assignments/${a.id}/submit`, form);
            alert(res.message ?? t("alerts.submitOk"));
            reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.submitFailed"));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="cdm-overlay" onClick={onClose}>
            <div className="cdm-content" onClick={(e) => e.stopPropagation()}>
                <header className="cdm-header">
                    <div className="cdm-title-box">
                        <h2>{detail?.name ?? course.name}</h2>
                        {detail && (
                            <span className="cdm-band">Band {detail.bandFrom} - {detail.bandTo}</span>
                        )}
                    </div>
                    <button className="cdm-close" onClick={onClose}>×</button>
                </header>

                <div className="cdm-tabs">
                    <button
                        className={`cdm-tab ${tab === 'info' ? 'active' : ''}`}
                        onClick={() => setTab('info')}
                    >
                        {t("modal.tabInfo")}
                    </button>
                    <button
                        className={`cdm-tab ${tab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setTab('assignments')}
                    >
                        {t("modal.tabAssignments")}{assignments.length > 0 ? ` (${assignments.length})` : ""}
                    </button>
                    <button
                        className={`cdm-tab ${tab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setTab('attendance')}
                    >
                        {t("modal.tabAttendance")}{attendance && attendance.totalItems > 0 ? ` (${attendance.totalItems})` : ""}
                    </button>
                </div>

                <div className="cdm-body">
                    {tab === 'info' && (
                        <div className="cdm-info">
                            {detailLoading && <p className="cdm-muted">{t("modal.loadingInfo")}</p>}
                            {detail && (
                                <>
                                    <p className="cdm-desc">{detail.description || t("modal.noDesc")}</p>

                                    <div className="cdm-meta">
                                        <div><span>Band</span><strong>{detail.bandFrom} - {detail.bandTo}</strong></div>
                                        <div><span>{t("modal.totalSessions")}</span><strong>{detail.totalSessions}</strong></div>
                                        <div><span>{t("modal.perWeek")}</span><strong>{detail.sessionsPerWeek}</strong></div>
                                        <div><span>{t("modal.tuition")}</span><strong>{money(detail.tuition)}</strong></div>
                                        {detail.discountPercent > 0 && (
                                            <>
                                                <div><span>{t("modal.discount")}</span><strong>-{detail.discountPercent}%</strong></div>
                                                <div className="cdm-meta-total">
                                                    <span>{t("modal.finalPrice")}</span>
                                                    <strong>
                                                        {money(Math.round((detail.tuition - detail.tuition * detail.discountPercent / 100) * 100) / 100)}
                                                    </strong>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <section className="cdm-section">
                                        <h3><i className="fa-solid fa-chalkboard-user"></i> {t("modal.teachers")}</h3>
                                        {detail.teachers.length > 0 ? (
                                            detail.teachers.map((t, i) => (
                                                <div key={i} className="cdm-teacher">
                                                    <strong>{t.fullName}</strong>
                                                    {(t.specialty || t.degree) && (
                                                        <span className="cdm-teacher-extra">
                                                            {[t.specialty, t.degree].filter(Boolean).join(" · ")}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="cdm-muted">{t("modal.noTeachers")}</p>
                                        )}
                                    </section>

                                    <section className="cdm-section">
                                        <h3><i className="fa-solid fa-users"></i> {t("modal.classes")}</h3>
                                        {detail.classes.length > 0 ? (
                                            detail.classes.map((c) => (
                                                <div key={c.id} className="cdm-class">
                                                    <div className="cdm-class-head">
                                                        <strong>{c.name}</strong>
                                                        <span>{t("modal.teacherPrefix")} {c.teacherName}</span>
                                                    </div>
                                                    <div className="cdm-class-meta">
                                                        <span>{date(c.startDate)} → {date(c.endDate)}</span>
                                                        <span>{t("modal.maxStudents", { n: c.maxStudents })}</span>
                                                    </div>
                                                    {c.schedules.length > 0 ? (
                                                        <table className="cdm-schedules">
                                                            <thead>
                                                                <tr><th>{t("modal.colDay")}</th><th>{t("modal.colTime")}</th><th>{t("modal.colRoom")}</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {c.schedules.map((s, i) => (
                                                                    <tr key={i}>
                                                                        <td>{t(DAY_KEYS[s.dayOfWeek] ?? "day.mon")}</td>
                                                                        <td>{s.startTime} - {s.endTime}</td>
                                                                        <td>{s.roomName ?? "—"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p className="cdm-muted">{t("modal.noSchedules")}</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="cdm-muted">{t("modal.noClasses")}</p>
                                        )}
                                    </section>
                                </>
                            )}
                        </div>
                    )}

                    {tab === 'assignments' && (
                        <div className="cdm-assignments">
                            {loading && <p className="cdm-muted">{t("assignment.loading")}</p>}
                            {!loading && assignments.length === 0 && (
                                <p className="cdm-muted">{t("assignment.empty")}</p>
                            )}
                            {assignments.map((a) => (
                                <div key={a.id} className="cdm-assignment">
                                    <div className="cdm-assignment-head">
                                        <h3>{a.title}</h3>
                                        <span className="cdm-date">
                                            {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {a.description && <p className="cdm-assignment-desc">{a.description}</p>}

                                    <div className="cdm-file-row">
                                        {a.hasFile ? (
                                            <button className="cdm-link" onClick={() => handleDownload(a)}>
                                                <i className="fa-solid fa-download"></i> {a.fileName}
                                            </button>
                                        ) : (
                                            <span className="cdm-muted">{t("assignment.noFile")}</span>
                                        )}
                                    </div>

                                    <div className="cdm-submit">
                                        {a.mySubmission ? (
                                            <div className="cdm-submitted">
                                                <span className="cdm-ok">
                                                    <i className="fa-solid fa-circle-check"></i> {t("assignment.submitted")} {a.mySubmission.fileName}
                                                </span>
                                                <button className="cdm-link" onClick={() => handleDownloadMy(a)}>
                                                    <i className="fa-solid fa-download"></i> {t("assignment.downloadMine")}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="cdm-upload-row">
                                                <label className="cdm-upload-btn">
                                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                                    {busyId === a.id ? ` ${t("assignment.submitting")}` : ` ${t("assignment.submit")}`}
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        disabled={busyId === a.id}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0];
                                                            e.target.value = '';
                                                            if (f) handleSubmit(a, f);
                                                        }}
                                                    />
                                                </label>
                                                <span className="cdm-muted">{t("assignment.hint")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'attendance' && (
                        <div className="cdm-attendance">
                            {attLoading && <p className="cdm-muted">{t("attendance.loading")}</p>}
                            {!attLoading && attError && <p className="cdm-error">{attError}</p>}
                            {!attLoading && !attError && attendance && attendance.totalItems === 0 && (
                                <div className="cdm-att-empty">
                                    <i className="fa-solid fa-calendar-check"></i>
                                    <p>{t("attendance.empty")}</p>
                                </div>
                            )}
                            {!attLoading && !attError && attendance && attendance.totalItems > 0 && (
                                <>
                                    <div className="cdm-att-summary">
                                        <div className="cdm-att-chip total">
                                            <span>{t("attendance.total")}</span><strong>{attendance.totalItems}</strong>
                                        </div>
                                        <div className="cdm-att-chip present">
                                            <span>{t("status.present")}</span><strong>{attendance.summary.present}</strong>
                                        </div>
                                        <div className="cdm-att-chip late">
                                            <span>{t("status.late")}</span><strong>{attendance.summary.late}</strong>
                                        </div>
                                        <div className="cdm-att-chip absent">
                                            <span>{t("status.absent")}</span><strong>{attendance.summary.absent}</strong>
                                        </div>
                                        <div className="cdm-att-chip excused">
                                            <span>{t("status.excused")}</span><strong>{attendance.summary.excused}</strong>
                                        </div>
                                    </div>

                                    <table className="cdm-att-table">
                                        <thead>
                                            <tr><th>{t("attendance.colNo")}</th><th>{t("attendance.colDate")}</th><th>{t("attendance.colStatus")}</th></tr>
                                        </thead>
                                        <tbody>
                                            {attendance.items.map((a) => (
                                                <tr key={a.id}>
                                                    <td className="cdm-att-no">{t("attendance.session", { n: a.sessionNumber })}</td>
                                                    <td>
                                                        {date(a.date)}
                                                        <span className="cdm-att-dow">{weekdayLabel(a.date)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`cdm-att-badge ${a.status.toLowerCase()}`}>
                                                            <i className={`fa-solid ${ATT_ICON[a.status] ?? 'fa-circle-info'}`}></i>
                                                            {t(`status.${a.status.toLowerCase()}`)}
                                                        </span>
                                                        {a.note && <span className="cdm-att-note">{a.note}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="cdm-att-pager">
                                        <span className="cdm-att-range">
                                            {t("attendance.range", {
                                                shown: attendance.items.length,
                                                total: attendance.totalItems,
                                                page: attendance.page,
                                                pages: Math.max(1, Math.ceil(attendance.totalItems / attendance.pageSize))
                                            })}
                                        </span>
                                        <div className="cdm-att-pages">
                                            <button
                                                className="cdm-page-btn"
                                                disabled={attendance.page <= 1}
                                                onClick={() => setAttPage(p => p - 1)}
                                                aria-label={t("attendance.prev")}
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>
                                            {Array.from({ length: Math.max(1, Math.ceil(attendance.totalItems / attendance.pageSize)) }, (_, i) => i + 1).map((p) => (
                                                <button
                                                    key={p}
                                                    className={`cdm-page-btn ${p === attendance.page ? 'active' : ''}`}
                                                    onClick={() => setAttPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                className="cdm-page-btn"
                                                disabled={attendance.page >= Math.ceil(attendance.totalItems / attendance.pageSize)}
                                                onClick={() => setAttPage(p => p + 1)}
                                                aria-label={t("attendance.next")}
                                            >
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
