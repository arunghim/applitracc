import { Link } from "react-router";

function DashboardPage() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <h1>Dashboard</h1>
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
