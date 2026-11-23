import { useState } from "react";
import "../General.css";
import { useStudentDashboard } from "../../../services/student/useStudentApi";
import PresentLessonFE from "./Components/PresentLesson";
import CourseDetailModal from "./Components/CourseDetailModal";
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import type { Course } from "../../../types/StudentTypes/MainTypes";

export default function StudentDashboard() {
    const { data } = useStudentDashboard();
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

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card">
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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-3">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card">
                                <QuickActionFE />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="CourseCard">
                        <CourseFE courses={data?.courses} />
                    </div>
                </div>
            </div>

            {openCourse && (
                <CourseDetailModal course={openCourse} onClose={() => setOpenCourse(null)} />
            )}
        </div>
    );
}
