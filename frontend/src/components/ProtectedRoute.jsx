import { Navigate } from "react-router";

function ProtectedRoute({ children }) {
  const email = localStorage.getItem("email");
  if (!email) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
