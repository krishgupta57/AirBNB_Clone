import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

const AdminRoute = ({ children }) => {
  const user = getUser();
  
  if (!user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
