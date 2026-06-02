import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { register } from "../../api/api";
import Appbar from "../../components/Appbar";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Sign Up";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await register(firstName, lastName, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    }
  }

  return (
    <div className="sp">
      <Appbar showNav={false} />

      <div className="sp__body">
        <div className="sp__card">
          <div className="sp__card-header">
            <h1 className="sp__card-title">Create an account</h1>
            <p className="sp__card-desc">
              Start tracking your job applications.
            </p>
          </div>

          <div className="sp__card-content">
            {error && <p className="sp__error">{error}</p>}

            <form className="sp__form" onSubmit={handleSubmit}>
              <div className="sp__field">
                <label className="sp__label" htmlFor="firstName">
                  First name
                </label>
                <input
                  className="sp__input"
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="sp__field">
                <label className="sp__label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  className="sp__input"
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="sp__field">
                <label className="sp__label" htmlFor="email">
                  Email
                </label>
                <input
                  className="sp__input"
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="sp__field">
                <label className="sp__label" htmlFor="password">
                  Password
                </label>
                <input
                  className="sp__input"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="sp__field">
                <label className="sp__label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  className="sp__input"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="sp__field">
                <button className="sp__submit" type="submit">
                  Create account
                </button>
                <p className="sp__field-desc">
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
