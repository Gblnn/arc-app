import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If we detect invalid user data, force a logout
    if (currentUser === undefined) {
      logout?.();
    }
  }, [currentUser, logout]);

  // Show loading or redirect while we check the auth state
  if (currentUser === undefined) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
