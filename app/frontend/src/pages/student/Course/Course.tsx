import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../General.css";
import "./Course.css";
import {
    useStudentApi,
    useStudentCourses,
    useStudentEnrollments,
    useStudentScheduleHistory,
    type StudentEnrollmentItem
} from "../../../services/student/useStudentApi";
import CourseMainFE from "./Components/CourseMain";
import MyCourses from "./Components/MyCourses";
import ClassPicker from "./Components/ClassPicker";
import CourseHistoryFE from "./Components/CourseHistory";
import { useLang } from "../../../i18n/LanguageContext";

import type { Course } from '../../../types/StudentTypes/MainTypes';

type TabKey = 'registered' | 'browse' | 'history';

export default function StudentCourse() {
    const { t } = useLang();
    const [params, setParams] = useSearchParams();

    // Danh sách khóa học (catalog), ghi danh của học viên và lịch sử khóa học từ BE
    const { data: courses } = useStudentCourses();
    const { data: enrollments, reload: reloadEnrollments } = useStudentEnrollments();
    const { data: history } = useStudentScheduleHistory();
    const api = useStudentApi();
    const [picking, setPicking] = useState<Course | null>(null);

    // Tab lấy từ URL (?tab=browse) để trang Đăng ký public chuyển thẳng sang bước chọn khóa
    const tabParam = params.get('tab');
    const tab: TabKey = tabParam === 'browse' || tabParam === 'history' ? tabParam : 'registered';
    const setTab = (key: TabKey) => setParams(key === 'registered' ? {} : { tab: key }, { replace: true });

    // "Khóa của tôi": ghi danh còn Active (chia Đang học / Sắp học / Đã học theo ngày lớp).
    // Lớp đã nghỉ / bảo lưu và lớp đã học xong cũng có trong tab Lịch sử.
    const activeEnrollments = enrollments.filter(e => e.status === 'Active');
    const lookup = Number(params.get('course'));
    useEffect(() => {
        if (tab === 'browse' && lookup && courses.length && !picking) {
            const found = courses.find(c => Number(c.id) === lookup);
            if (found) setPicking(found);
        }
    }, [tab, lookup, courses, picking]);

    // Hủy đăng ký: chỉ lớp chưa khai giảng và chưa đóng tiền (BE kiểm tra lại)
    const handleCancel = async (item: StudentEnrollmentItem) => {
        if (!window.confirm(t("sx.confirmCancel", { code: item.classCode }))) return;
        try {
            await api.send("DELETE", `enrollments/${item.enrollmentId}`);
            reloadEnrollments();
        } catch (err) {
            window.alert(err instanceof Error ? err.message : t("alerts.unregisterFailed"));
        }
    };

    const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
        { key: 'registered', label: t("courses.tabMine"), icon: 'fa-book-bookmark', count: activeEnrollments.length },
        { key: 'browse', label: t("sx.tabRegister"), icon: 'fa-circle-plus', count: courses.length },
        { key: 'history', label: t("courses.tabHistory"), icon: 'fa-folder-tree', count: history.length }
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
                            {tabs.map((item) => (
                                <button
                                    key={item.key}
                                    role="tab"
                                    aria-selected={tab === item.key}
                                    className={`course-tab ${tab === item.key ? 'active' : ''}`}
                                    onClick={() => setTab(item.key)}
                                >
                                    <i className={`fa-solid ${item.icon}`}></i>
                                    <span>{item.label}</span>
                                    {item.count > 0 && <span className="course-tab-count">{item.count}</span>}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="col-12">
                    <div className="course-panel" key={tab}>
                        {tab === 'registered' && (
                            <MyCourses items={activeEnrollments} onCancel={handleCancel} onBrowse={() => setTab('browse')} />
                        )}

                        {tab === 'browse' && (
                            <CourseMainFE courses={courses} onRegisterCourse={setPicking} />
                        )}

                        {tab === 'history' && (
                            <CourseHistoryFE items={history} />
                        )}
                    </div>
                </div>
            </div>

            {picking && (
                <ClassPicker
                    course={picking}
                    onClose={() => { setPicking(null); if (params.get('course')) setTab('browse'); }}
                    onDone={reloadEnrollments}
                />
            )}
        </div>
    );
}
