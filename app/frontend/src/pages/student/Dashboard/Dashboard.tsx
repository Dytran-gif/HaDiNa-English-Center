import { useEffect, useState } from "react";
import "../General.css";
import "./Dashboard.css";
import { useStudentDashboard, useStudentTuition } from "../../../services/student/useStudentApi";
import PresentLessonFE from "./Components/PresentLesson";
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import SessionDetail from "../Components/Session/SessionDetail";
import { useLang } from "../../../i18n/LanguageContext";

export default function StudentDashboard() {
    const { data, reload } = useStudentDashboard();
    const { data: tuition } = useStudentTuition();
    const { t, money, date } = useLang();
    const [openLesson, setOpenLesson] = useState(false);

    // "Buổi học tiếp theo" do BE tính theo đúng khoảng ngày của lớp (không còn tự tính ở FE nên không hiện buổi của lớp đã xong).
    // Khi buổi đó kết thúc thì tải lại để lấy buổi kế tiếp.
    const nextLesson = data?.nextLesson;
    useEffect(() => {
        if (!nextLesson?.nextDate || !nextLesson.endTime) return;
        const end = new Date(`${nextLesson.nextDate}T${nextLesson.endTime}`).getTime();
        const wait = end - Date.now();
        if (wait <= 0) return;
        const timer = window.setTimeout(reload, Math.min(wait + 1000, 2147483647));
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextLesson?.nextDate, nextLesson?.endTime]);

    const totalSessions = (data?.courses ?? []).reduce((sum, c) => sum + (c.classTotalSessions ?? c.totalSessions), 0);
    const unpaidTotal = (tuition ?? []).filter(i => i.enrollmentStatus !== "Dropped").reduce((sum, i) => sum + (i.remainingAmount ?? 0), 0);

    const kpis = [
        { icon: "fa-solid fa-book-open", tone: "blue", label: t("dash.kpiCourses"), value: String(data?.courses.length ?? 0) },
        { icon: "fa-solid fa-layer-group", tone: "violet", label: t("dash.kpiSessions"), value: String(totalSessions) },
        {
            icon: "fa-solid fa-calendar-day", tone: "green", label: t("dash.kpiNext"),
            value: nextLesson?.nextDate ? date(nextLesson.nextDate) : t("dash.noUpcoming"),
            hint: nextLesson?.startTime ? `${nextLesson.startTime.slice(0, 5)} - ${nextLesson.endTime?.slice(0, 5) ?? ""}` : undefined
        },
        { icon: "fa-solid fa-wallet", tone: "amber", label: t("dash.kpiUnpaid"), value: money(unpaidTotal) }
    ];

    return (
        <div className="container dash">
            <section className="dash-top">
                <PresentLessonFE
                    lesson={nextLesson ? {
                        courseName: nextLesson.courseName,
                        className: nextLesson.className,
                        bandFrom: nextLesson.bandFrom,
                        bandTo: nextLesson.bandTo,
                        description: nextLesson.description,
                        totalSessions: nextLesson.totalSessions,
                        imageUrl: nextLesson.imageUrl,
                        nextDate: nextLesson.nextDate,
                        startTime: nextLesson.startTime,
                        endTime: nextLesson.endTime
                    } : undefined}
                    onOpen={nextLesson ? () => setOpenLesson(true) : undefined}
                />

                <QuickActionFE />
            </section>

            <section className="dash-kpis">
                {kpis.map((k) => (
                    <article key={k.label} className={`dash-kpi ${k.tone}`}>
                        <span className="dash-kpi-icon">
                            <i className={k.icon}></i>
                        </span>
                        <div className="dash-kpi-text">
                            <span className="dash-kpi-label">{k.label}</span>
                            <strong className="dash-kpi-value">{k.value}</strong>
                            {k.hint && <em className="dash-kpi-hint">{k.hint}</em>}
                        </div>
                    </article>
                ))}
            </section>

            <section>
                <CourseFE courses={data?.courses} />
            </section>

            {openLesson && nextLesson && (
                <SessionDetail
                    session={{
                        courseName: nextLesson.courseName,
                        className: nextLesson.className,
                        dateStr: nextLesson.nextDate,
                        startTime: nextLesson.startTime,
                        endTime: nextLesson.endTime,
                        sessionNo: nextLesson.sessionNo,
                        totalSessions: nextLesson.classTotalSessions,
                        teacherName: nextLesson.teacherName,
                        roomName: nextLesson.roomName,
                    }}
                    onClose={() => setOpenLesson(false)}
                />
            )}
        </div>
    );
}
