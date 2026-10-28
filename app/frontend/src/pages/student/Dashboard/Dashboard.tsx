//import { useAuth } from "../../../context/AuthContext";
import "../General.css"
// Components
import PresentLessonFE from "./Components/PresentLesson"; 
import CourseFE from "./Components/Course";
import QuickActionFE from "./Components/QuickAction";
import NotificationItemFE from "./Components/NotificationItem";

export default function StudentDashboard() {
    //const { logout } = useAuth();
    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-9">
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card">
                                <PresentLessonFE />
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="CourseCard">
                                <CourseFE />
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
                                <NotificationItemFE />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
