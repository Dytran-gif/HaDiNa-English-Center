import "../General.css";
import StudentCoursesFeedback from "./Components/StudentCoursesFeedback";
import TeacherReviews from "./Components/TeacherReviews";


export default function StudentFeedback() {
    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-12">
                    <StudentCoursesFeedback />
                </div>
                <div className="col-12">
                    <TeacherReviews />
                </div>
            </div>
        </div>
    );
}
