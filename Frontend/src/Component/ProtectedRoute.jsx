import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, type }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  // ❌ No token — redirect to proper login
  if (!token) {
    return (
      <Navigate
        to={type === "caretaker" ? "/caretaker-login" : "/login"}
        replace
      />
    );
  }

  // ❌ Wrong user type trying to access this route
  if (userType !== type) {
    return (
      <Navigate
        to={userType === "caretaker" ? "/caretaker/home" : "/home"}
        replace
      />
    );
  }

  // ✅ All good — allow access
  return children;
};

export default ProtectedRoute;
