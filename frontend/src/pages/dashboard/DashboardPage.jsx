import { Link, useNavigate } from "react-router";

function DashboardPage() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") ?? "";
  const lastName = localStorage.getItem("lastName") ?? "";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    navigate("/");
  }

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <h1>Welcome, {firstName} {lastName}</h1>
      <h2>My Job Applications</h2>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Status</th>
            <th>Date Applied</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}

export default DashboardPage;
