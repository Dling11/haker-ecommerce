import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthRoutePending from "./AuthRoutePending";

function AdminRoute() {
  const { user, token, isInitialized } = useSelector((state) => state.auth);

  if (token && !isInitialized) {
    return <AuthRoutePending />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/shop" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
