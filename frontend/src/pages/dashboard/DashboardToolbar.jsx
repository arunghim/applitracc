import "./DashboardToolbar.css";

function SortIcon() {
  return (
    <span className="db-toolbar__sort-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </span>
  );
}

function DashboardToolbar({
  activeSort,
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
        <SortIcon />
      </button>
      <button
        className={`db-toolbar__btn${activeSort === "salary" ? " db-toolbar__btn--active" : ""}`}
        onClick={onSortSalary}
      >
        By Salary
        <SortIcon />
      </button>
      <button
        className={`db-toolbar__btn${activeSort === "date" ? " db-toolbar__btn--active" : ""}`}
        onClick={onSortDate}
      >
        By Date
        <SortIcon />
      </button>
    </div>
  );
}

export default DashboardToolbar;
