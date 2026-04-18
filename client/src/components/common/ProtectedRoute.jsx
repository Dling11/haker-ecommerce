import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthRoutePending from "./AuthRoutePending";

function ProtectedRoute() {
  const location = useLocation();
  const { user, token, isInitialized } = useSelector((state) => state.auth);

  if (token && !isInitialized) {
    return <AuthRoutePending />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
