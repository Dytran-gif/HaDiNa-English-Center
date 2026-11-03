import "../General.css";
import { useStudentDashboard } from "../../../services/student/useStudentApi";
import PresentLessonFE from "./Components/PresentLesson"; 
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import NotificationItemFE from "./Components/NotificationItem";

export default function StudentDashboard() {
    const { data } = useStudentDashboard();

    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card">
                                <PresentLessonFE lesson={data?.nextLesson ? {
                                    courseName: data.nextLesson.courseName,
                                    bandFrom: data.nextLesson.bandFrom,
                                    bandTo: data.nextLesson.bandTo,
                                    description: data.nextLesson.description,
                                    totalSessions: data.nextLesson.totalSessions,
                                    imageUrl: data.nextLesson.imageUrl
                                } : undefined} />
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="CourseCard">
                                <CourseFE courses={data?.courses} />
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
                        <div className="col-12">
                            <div className="card">
                                <NotificationItemFE notifications={data?.notifications} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
