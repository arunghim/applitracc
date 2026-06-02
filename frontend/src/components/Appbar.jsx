import { Link } from "react-router";
import "./Appbar.css";

function Appbar({ showNav = true }) {
  return (
    <div className="ab">
      <Link to="/" className="ab__brand">
        <img src="/favicon.svg" alt="" className="ab__brand-icon" />
        Applitrack
      </Link>
      <nav className={`ab__nav${showNav ? "" : " ab__nav--hidden"}`}>
        <Link to="/login" className="ab__nav-link ab__nav-link--ghost">
          Sign in
        </Link>
        <Link to="/signup" className="ab__nav-link ab__nav-link--solid">
          Get started
        </Link>
      </nav>
    </div>
  );
}

export default Appbar;
