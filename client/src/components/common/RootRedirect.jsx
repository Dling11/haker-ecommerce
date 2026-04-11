import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import getPostLoginPath from "../../utils/getPostLoginPath";

function RootRedirect() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getPostLoginPath(user)} replace />;
}

export default RootRedirect;
