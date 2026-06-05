import "./DashboardHeader.css";

function DashboardHeader({ rowCount }) {
  return (
    <div className="db-header">
      <h1 className="db-header__title">Applications</h1>
      <p className="db-header__count">
        {rowCount} application{rowCount !== 1 ? "s" : ""} tracked
      </p>
    </div>
  );
}

export default DashboardHeader;
