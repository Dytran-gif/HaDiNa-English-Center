import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Teachers from "./pages/Teachers";
import TeacherDetail from "./pages/TeacherDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./pages/student/Layout/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard/Dashboard";
import StudentCourse from "./pages/student/Course/Course";
import AdminLayout from "./pages/admin/Layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard/Dashboard";
import CoursesManagement from "./pages/admin/Courses/CoursesManagement";
import UsersManagement from "./pages/admin/Users/UsersManagement";
import BlogManagement from "./pages/admin/Blog/BlogManagement";
import PaymentsManagement from "./pages/admin/Payments/PaymentsManagement";
import Reports from "./pages/admin/Reports/Reports";
import RoomsManagement from "./pages/admin/Rooms/RoomsManagement";
import TeacherLayout from "./pages/teacher/Layout/TeacherLayout";
import TeacherDashboard from "./pages/teacher/Dashboard/Dashboard";
import TeacherClasses from "./pages/teacher/Classes/Classes";
import TeacherSchedule from "./pages/teacher/Schedule/Schedule";
import TeacherProfile from "./pages/teacher/Profile/Profile";
import TeacherAttendance from "./pages/teacher/Attendance/Attendance";
import TeacherGrades from "./pages/teacher/Grades/Grades";
import TeacherAssignments from "./pages/teacher/Assignments/Assignments";
import TeacherMaterials from "./pages/teacher/Materials/Materials";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ve-chung-toi" element={<About />} />
            <Route path="/khoa-hoc" element={<Courses />} />
            <Route path="/khoa-hoc/:slug" element={<CourseDetail />} />
            <Route path="/giao-vien" element={<Teachers />} />
            <Route path="/giao-vien/:slug" element={<TeacherDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/lien-he" element={<Contact />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/tai-khoan" element={<Profile />} />
            <Route
                path="/student"
                element={
                    <ProtectedRoute role="student">
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />

                {/* Sau này thêm các page */}

                
                <Route path="courses" element={<StudentCourse />} />
                {/* 
    <Route path="schedule" element={<StudentSchedule />} />
    
    <Route path="feedback" element={<StudentFeedback />} />
    <Route path="tuition" element={<StudentTuition />} /> */}

            </Route>
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="courses" element={<CoursesManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="payments" element={<PaymentsManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="rooms" element={<RoomsManagement />} />
            </Route>
            <Route
                path="/teacher"
                element={
                    <ProtectedRoute role="teacher">
                        <TeacherLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="classes" element={<TeacherClasses />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="grades" element={<TeacherGrades />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="materials" element={<TeacherMaterials />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route path="profile" element={<TeacherProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}