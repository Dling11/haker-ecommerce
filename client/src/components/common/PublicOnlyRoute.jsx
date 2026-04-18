import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import AuthRoutePending from "./AuthRoutePending";
import getPostLoginPath from "../../utils/getPostLoginPath";

function PublicOnlyRoute() {
  const { user, token, isInitialized } = useSelector((state) => state.auth);

  if (token && !isInitialized) {
    return <AuthRoutePending />;
  }

  if (user) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
