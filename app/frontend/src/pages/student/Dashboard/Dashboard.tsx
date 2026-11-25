import { useState } from "react";
import "../General.css";
import "./Dashboard.css";
import { useStudentDashboard, useStudentTuition } from "../../../services/student/useStudentApi";
import PresentLessonFE from "./Components/PresentLesson";
import CourseDetailModal from "./Components/CourseDetailModal";
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import { useLang } from "../../../i18n/LanguageContext";
import type { Course } from "../../../types/StudentTypes/MainTypes";

export default function StudentDashboard() {
    const { data } = useStudentDashboard();
    const { data: tuition } = useStudentTuition();
    const { t, money, date } = useLang();
    const [openCourse, setOpenCourse] = useState<Course | null>(null);

    const nextLesson = data?.nextLesson;

    // Popup chi tiết khóa cần Course (có id); ưu tiên lấy từ danh sách khóa đang học, không có thì dựng tối thiểu
    const nextCourse: Course | undefined = nextLesson?.courseId != null
        ? data?.courses.find(c => c.id === String(nextLesson.courseId)) ?? {
            id: String(nextLesson.courseId),
            name: nextLesson.courseName,
            description: nextLesson.description ?? "",
            bandFrom: nextLesson.bandFrom,
            bandTo: nextLesson.bandTo,
            totalSessions: nextLesson.totalSessions ?? 0,
            sessionsPerWeek: 0,
            tuition: 0,
            discountPercent: 0,
            imageUrl: nextLesson.imageUrl
        }
        : undefined;

    const totalSessions = (data?.courses ?? []).reduce((sum, c) => sum + c.totalSessions, 0);
    const unpaidTotal = (tuition ?? []).filter(i => !i.isPaid).reduce((sum, i) => sum + i.finalTuitionFee, 0);

    const kpis = [
        {
            icon: "fa-solid fa-book-open",
            tone: "blue",
            label: t("dash.kpiCourses"),
            value: String(data?.courses.length ?? 0)
        },
        {
            icon: "fa-solid fa-layer-group",
            tone: "violet",
            label: t("dash.kpiSessions"),
            value: String(totalSessions)
        },
        {
            icon: "fa-solid fa-calendar-day",
            tone: "green",
            label: t("dash.kpiNext"),
            value: nextLesson?.nextDate ? date(nextLesson.nextDate) : t("dash.noUpcoming"),
            hint: nextLesson?.startTime ? `${nextLesson.startTime.slice(0, 5)} - ${nextLesson.endTime?.slice(0, 5) ?? ""}` : undefined
        },
        {
            icon: "fa-solid fa-wallet",
            tone: "amber",
            label: t("dash.kpiUnpaid"),
            value: money(unpaidTotal)
        }
    ];

    return (
        <div className="container dash">
            <section className="dash-top">
                <PresentLessonFE
                    lesson={nextLesson ? {
                        courseName: nextLesson.courseName,
                        bandFrom: nextLesson.bandFrom,
                        bandTo: nextLesson.bandTo,
                        description: nextLesson.description,
                        totalSessions: nextLesson.totalSessions,
                        imageUrl: nextLesson.imageUrl,
                        nextDate: nextLesson.nextDate,
                        startTime: nextLesson.startTime,
                        endTime: nextLesson.endTime
                    } : undefined}
                    onOpen={nextCourse ? () => setOpenCourse(nextCourse) : undefined}
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

            {openCourse && (
                <CourseDetailModal course={openCourse} onClose={() => setOpenCourse(null)} />
            )}
        </div>
    );
}
