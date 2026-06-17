import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { login } from "../../api/api";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login | Applitrack";
  }, []);

  if (localStorage.getItem("refreshToken")) {
    return <Navigate to="/dashboard" replace />;
  }

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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </>
      }
    >
      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField id="email" label="Email">
          <input
            className="auth-input"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField id="password" label="Password">
          <input
            className="auth-input"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>

        <button className="auth-btn" type="submit">
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
