import "./DashboardToolbar.css";

function SortIcon({ direction = "desc" }) {
  const points = direction === "asc" ? "6 9 12 15 18 9" : "6 15 12 9 18 15";
  return (
    <span className="db-toolbar__sort-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points={points} />
      </svg>
    </span>
  );
}

function DashboardToolbar({
  activeSort,
  sortDirs = {},
  onAddField,
  onSortStatus,
  onSortSalary,
  onSortDate,
}) {
  return (
    <div className="db-toolbar">
      <button
        className="db-toolbar__btn db-toolbar__btn--icon"
        onClick={onAddField}
        title="Add custom field"
      >
        +
      </button>
      <div className="db-toolbar__divider" />
      <button
        className={`db-toolbar__btn${activeSort === "status" ? " db-toolbar__btn--active" : ""}`}
        onClick={onSortStatus}
      >
        By Status
        <SortIcon
          direction={activeSort === "status" ? sortDirs.status : "asc"}
        />
      </button>
      <button
        className={`db-toolbar__btn${activeSort === "salary" ? " db-toolbar__btn--active" : ""}`}
        onClick={onSortSalary}
      >
        By Salary
        <SortIcon
          direction={activeSort === "salary" ? sortDirs.salary : "desc"}
        />
      </button>
      <button
        className={`db-toolbar__btn${activeSort === "date" ? " db-toolbar__btn--active" : ""}`}
        onClick={onSortDate}
      >
        By Date
        <SortIcon direction={activeSort === "date" ? sortDirs.date : "desc"} />
      </button>
    </div>
  );
}

export default DashboardToolbar;
