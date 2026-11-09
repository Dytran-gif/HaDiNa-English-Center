import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Profile() {
  const { user, token } = useAuth();
  if (!user || !token) return <Navigate to="/dang-nhap" replace/>;
  const target = user.role === "admin" ? "/admin/profile" : user.role === "teacher" ? "/teacher/profile" : "/student/dashboard";
  return <Navigate to={target} replace/>;
}
