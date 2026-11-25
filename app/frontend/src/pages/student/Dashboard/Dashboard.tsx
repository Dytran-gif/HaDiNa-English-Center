import { useEffect, useMemo, useState } from "react";
import "../General.css";
import "./Dashboard.css";
import { useStudentDashboard, useStudentTuition } from "../../../services/student/useStudentApi";
import PresentLessonFE from "./Components/PresentLesson";
import CourseDetailModal from "./Components/CourseDetailModal";
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import { useLang } from "../../../i18n/LanguageContext";
import type { Course } from "../../../types/StudentTypes/MainTypes";

interface LessonSlotView {
    courseId: number;
    courseName: string;
    bandFrom: string;
    bandTo: string;
    description?: string;
    totalSessions?: number;
    imageUrl?: string;
    nextDate: string;
    startTime: string;
    endTime: string;
}

interface RawLessonSlot {
    courseId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// Buổi kế tiếp tính theo đồng hồ máy học viên (đúng cả khi trang mở qua giờ học)
function computeNearestLesson(slots: RawLessonSlot[]) {
    const now = new Date();
    const todayNo = now.getDay() === 0 ? 7 : now.getDay();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let best: { slot: RawLessonSlot; date: Date } | null = null;
    for (const slot of slots) {
        let diff = slot.dayOfWeek - todayNo;
        const startMinutes = Number(slot.startTime.slice(0, 2)) * 60 + Number(slot.startTime.slice(3, 5));
        if (diff < 0 || (diff === 0 && startMinutes <= nowMinutes)) diff += 7;
        const at = new Date(todayStart.getTime() + diff * 86400000);
        if (!best || at < best.date || (at.getTime() === best.date.getTime() && slot.startTime < best.slot.startTime)) {
            best = { slot, date: at };
        }
    }
    return best;
}

export default function StudentDashboard() {
    const { data } = useStudentDashboard();
    const { data: tuition } = useStudentTuition();
    const { t, money, date } = useLang();
    const [openCourse, setOpenCourse] = useState<Course | null>(null);

    // Tự cập nhật "buổi kế tiếp" mỗi 20 giây, không cần tải lại trang
    const [lessonTick, setLessonTick] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setLessonTick(Date.now()), 20000);
        return () => window.clearInterval(timer);
    }, []);

    const courseById = useMemo(() => {
        const map = new Map<number, Course>();
        (data?.courses ?? []).forEach((c) => {
            const id = Number(c.id);
            if (!Number.isNaN(id)) map.set(id, c);
        });
        return map;
    }, [data]);

    const liveLesson = useMemo(() => {
        const slots = data?.lessonSlots ?? [];
        if (slots.length === 0) return null;
        const nearest = computeNearestLesson(slots);
        if (!nearest) return null;
        const course = courseById.get(nearest.slot.courseId);
        const y = nearest.date.getFullYear();
        const m = String(nearest.date.getMonth() + 1).padStart(2, "0");
        const d = String(nearest.date.getDate()).padStart(2, "0");
        return {
            courseId: nearest.slot.courseId,
            courseName: course?.name ?? "",
            bandFrom: course?.bandFrom ?? "",
            bandTo: course?.bandTo ?? "",
            description: course?.description,
            totalSessions: course?.totalSessions,
            imageUrl: course?.imageUrl,
            nextDate: `${y}-${m}-${d}`,
            startTime: nearest.slot.startTime,
            endTime: nearest.slot.endTime,
        } satisfies LessonSlotView;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, courseById, lessonTick]);

    const beLesson = data?.nextLesson;
    const beIsFresh = Boolean(
        beLesson?.nextDate &&
        new Date(`${beLesson.nextDate}T${beLesson.startTime ?? "23:59:59"}`).getTime() > lessonTick,
    );
    const nextLesson = liveLesson ?? (beIsFresh ? beLesson : undefined);

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
