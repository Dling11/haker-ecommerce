import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import getPostLoginPath from "../../utils/getPostLoginPath";

function PublicOnlyRoute() {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
