import { useState } from "react";
import "../General.css";
import StudentCoursesFeedback from "./Components/StudentCoursesFeedback";


export default function StudentFeedback() {
    return (
        <div className="container">
            <div className="row g-3">
                <div className="col-12">
                    <StudentCoursesFeedback />
                </div>
            </div>
        </div>
    );
}