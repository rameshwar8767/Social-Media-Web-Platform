import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/feed/home" replace />; // Or "/" based on your index redirect
  }

  return children;
};

export default PublicRoute;
