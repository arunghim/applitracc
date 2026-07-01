import { useEffect } from "react";
import { Link, Navigate } from "react-router";
import Appbar from "../../components/Appbar";
import "./HomePage.css";

function HomePage() {
  useEffect(() => {
    document.title = "Applitracc";
  }, []);

  if (localStorage.getItem("refreshToken")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="hp">
      <Appbar />
      <div className="hp__body">
        <div className="hp__hero">
          <h1 className="hp__hero-title">
            Track every application,
            <br />
            land your next role.
          </h1>
          <p className="hp__hero-sub">
            Stop juggling spreadsheets. Track applications, interviews, notes,
            and deadlines in one streamlined workspace.
          </p>
          <div className="hp__hero-actions">
            <Link to="/signup" className="hp__btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <footer className="hp__footer">
        <p className="hp__footer-copy">
          &copy; {new Date().getFullYear()} Applitracc
          {" · "}
          <Link to="/terms" className="hp__footer-link">
            Terms &amp; Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
