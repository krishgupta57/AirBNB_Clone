import { Navigate } from "react-router-dom";
import { getUser, isLoggedIn } from "../utils/auth";

function HostRoute({ children }) {
  const user = getUser();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "host") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default HostRoute;