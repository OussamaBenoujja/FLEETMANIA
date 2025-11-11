import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
const ProtectedRoute = ({ allowedRoles }) => {
  const { auth, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!auth?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
