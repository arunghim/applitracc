import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "../../api/api";
import Appbar from "../../components/Appbar";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login | Applitrack";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="lp">
      <Appbar showNav={false} />

      {/* Centred form */}
      <div className="lp__body">
        <div className="lp__card">
          <h1 className="lp__heading">Welcome back</h1>
          <p className="lp__sub">Sign in to your account to continue.</p>

          {error && <p className="lp__error">{error}</p>}

          <form className="lp__form" onSubmit={handleSubmit}>
            <div className="lp__field">
              <label className="lp__label" htmlFor="email">
                Email
              </label>
              <input
                className="lp__input"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lp__field">
              <label className="lp__label" htmlFor="password">
                Password
              </label>
              <input
                className="lp__input"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="lp__submit" type="submit">
              Sign in
            </button>
          </form>

          <p className="lp__footer">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
