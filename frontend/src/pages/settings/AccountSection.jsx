function RowSep() {
  return <div className="settings__row-sep" />;
}

function AccountSection() {
  const firstName = localStorage.getItem("firstName") ?? "";
  const lastName = localStorage.getItem("lastName") ?? "";
  const email = localStorage.getItem("email") ?? "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  const fullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : "—";

  return (
    <div className="settings__page">
      <h1 className="settings__page-title">My Account</h1>
      <div className="settings__page-divider" />

      <div className="settings__row">
        <div className="settings__row-meta">
          <span className="settings__row-label">Photo</span>
        </div>
        <div className="settings__row-control">
          <div className="settings__avatar settings__avatar--lg">
            {initials}
          </div>
        </div>
      </div>
      <RowSep />

      <div className="settings__row">
        <div className="settings__row-meta">
          <span className="settings__row-label">Full name</span>
        </div>
        <div className="settings__row-control">
          <span className="settings__row-value">{fullName}</span>
        </div>
      </div>
      <RowSep />

      <div className="settings__row">
        <div className="settings__row-meta">
          <span className="settings__row-label">Email</span>
          <span className="settings__row-desc">
            Used to sign in to Applitracc.
          </span>
        </div>
        <div className="settings__row-control">
          <span className="settings__row-value">{email || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export default AccountSection;
