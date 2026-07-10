import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { register } from "../../api/api";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
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
    document.title = "Sign Up | Applitracc";
  }, []);

  if (localStorage.getItem("refreshToken")) {
    return <Navigate to="/dashboard" replace />;
  }

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
      if (err.status === 409) {
        setError("An account with this email already exists.");
      } else if (err.status === 400) {
        setError("Please check your details and try again.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start tracking your job applications."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="signup__name-row">
          <FormField id="firstName" label="First name">
            <input
              className="auth-input"
              id="firstName"
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </FormField>
          <FormField id="lastName" label="Last name">
            <input
              className="auth-input"
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </FormField>
        </div>

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

        <FormField id="confirmPassword" label="Confirm password">
          <input
            className="auth-input"
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </FormField>

        <button className="auth-btn" type="submit">
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
