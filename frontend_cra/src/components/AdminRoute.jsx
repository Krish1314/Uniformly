import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Defense-in-depth: Only this exact email is allowed into the admin portal
const ADMIN_EMAIL = "krish09755650065@gmail.com";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Primary check: role must be ADMIN
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Secondary check: email must match the authorised admin email
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

