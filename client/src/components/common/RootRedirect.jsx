import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AuthRoutePending from "./AuthRoutePending";
import getPostLoginPath from "../../utils/getPostLoginPath";

function RootRedirect() {
  const { user, token, isInitialized } = useSelector((state) => state.auth);

  if (token && !isInitialized) {
    return <AuthRoutePending />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getPostLoginPath(user)} replace />;
}

export default RootRedirect;
