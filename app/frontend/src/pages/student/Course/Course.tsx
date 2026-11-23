import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../General.css";
import "./Course.css";
import {
    useStudentApi,
    useStudentCourses,
    useStudentEnrollments,
    useStudentScheduleHistory
} from "../../../services/student/useStudentApi";
import CourseMainFE from "./Components/CourseMain";
import CourseBottomFE from "./Components/CourseBottom";
import CourseHistoryFE from "./Components/CourseHistory";
import { useLang } from "../../../i18n/LanguageContext";

import type { Course } from '../../../types/StudentTypes/MainTypes';

type TabKey = 'registered' | 'browse' | 'history';

export default function StudentCourse() {
    const navigate = useNavigate();
    const { t } = useLang();

    // Danh sách khóa học (catalog), ghi danh của học viên và lịch sử khóa học từ BE
    const { data: courses } = useStudentCourses();
    const { data: enrollments, reload: reloadEnrollments } = useStudentEnrollments();
    const { data: history } = useStudentScheduleHistory();
    const api = useStudentApi();
    const [registering, setRegistering] = useState(false);
    const [tab, setTab] = useState<TabKey>('registered');

    // Tab "My Courses" chỉ gồm khóa đang học (Active); khóa đã qua (OnHold/Dropped) nằm ở tab Course History
    const activeEnrollments = enrollments.filter(e => e.status === 'Active');

    // Bấm Register trên thẻ khóa -> lưu thẳng ghi danh xuống DB (BE chặn đăng ký trùng)
    const handleRegisterCourse = async (course: Course) => {
        if (registering) return;
        setRegistering(true);
        try {
            await api.send("POST", `courses/${course.id}/register`);
            alert(t("alerts.registerOk", { name: course.name }));
            reloadEnrollments();
            setTab('registered');
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.registerFailed"));
        } finally {
            setRegistering(false);
        }
    };

    // Bấm nút xóa ở danh sách đã đăng ký -> xóa ghi danh trong DB
    const handleDeleteEnrollment = async (enrollmentId: number) => {
        try {
            await api.send("DELETE", `enrollments/${enrollmentId}`);
            reloadEnrollments();
        } catch (err) {
            alert(err instanceof Error ? err.message : t("alerts.unregisterFailed"));
        }
    };

    // Nút Payment Now -> sang trang học phí, kèm cờ tự tích tất cả khóa cần thanh toán
    const handleGoTuition = () => navigate("/student/tuition", { state: { payAll: true } });

    const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
        { key: 'registered', label: t("courses.tabMine"), icon: 'fa-book-bookmark', count: activeEnrollments.length },
        { key: 'browse', label: t("courses.tabBrowse"), icon: 'fa-compass', count: courses.length },
        { key: 'history', label: t("courses.tabHistory"), icon: 'fa-clock-rotate-left', count: history.length }
    ];

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-12">
                    {/* Hero: tiêu đề + 3 tab */}
                    <section className="course-hero">
                        <div className="course-hero-head">
                            <div className="course-hero-icon">
                                <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div>
                                <h1 className="course-hero-title">{t("courses.title")}</h1>
                                <p className="course-hero-sub">{t("courses.sub")}</p>
                            </div>
                        </div>

                        <div className="course-tabs" role="tablist" aria-label="Course sections">
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    role="tab"
                                    aria-selected={tab === t.key}
                                    className={`course-tab ${tab === t.key ? 'active' : ''}`}
                                    onClick={() => setTab(t.key)}
                                >
                                    <i className={`fa-solid ${t.icon}`}></i>
                                    <span>{t.label}</span>
                                    {t.count > 0 && <span className="course-tab-count">{t.count}</span>}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="col-12">
                    <div className="course-panel" key={tab}>
                        {tab === 'registered' && (
                            <CourseBottomFE
                                enrolledCourses={activeEnrollments}
                                onDelete={handleDeleteEnrollment}
                                onGoTuition={handleGoTuition}
                                onBrowse={() => setTab('browse')}
                            />
                        )}

                        {tab === 'browse' && (
                            <CourseMainFE
                                courses={courses}
                                onRegisterCourse={handleRegisterCourse}
                                registering={registering}
                            />
                        )}

                        {tab === 'history' && (
                            <CourseHistoryFE items={history} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
