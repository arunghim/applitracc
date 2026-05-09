import { Link } from "react-router";

function LoginPage() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/signup">Sign Up</Link>
      </nav>
      <h1>Login</h1>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
