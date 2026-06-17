import { useEffect } from "react";
import { Navigate } from "react-router";
import Appbar from "../../components/Appbar";
import "./HomePage.css";

function HomePage() {
  useEffect(() => {
    document.title = "Applitrack";
  }, []);

  if (localStorage.getItem("refreshToken")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="hp">
      <Appbar />
    </div>
  );
}

export default HomePage;
