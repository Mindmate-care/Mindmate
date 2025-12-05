import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, type }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  // ✅ Already logged in → redirect based on role
  if (token && userType) {
    if (userType === "caretaker") return <Navigate to="/caretaker/home" replace />;
    if (userType === "user") return <Navigate to="/home" replace />;
  }

  // ✅ Not logged in → allow access to public route
  return children;
};

export default PublicRoute;
