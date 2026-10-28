import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserRole } from "../types";
import { useAuth } from "../context/AuthContext";

interface Props {
  role?: UserRole;
  children: ReactNode;
}

export default function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}