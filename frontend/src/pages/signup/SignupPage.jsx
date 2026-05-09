import { Link } from "react-router";

function SignupPage() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
      </nav>
      <h1>Sign Up</h1>
      <form>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;
