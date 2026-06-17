function RowSep() {
  return <div className="settings__row-sep" />;
}

function SecuritySection() {
  return (
    <div className="settings__page">
      <h1 className="settings__page-title">Security</h1>
      <div className="settings__page-divider" />

      <div className="settings__row settings__row--stacked">
        <div className="settings__row-meta">
          <span className="settings__row-label">Email address</span>
          <span className="settings__row-desc">
            Change the email you use to sign in.
          </span>
        </div>
        <div className="settings__row-form">
          <input
            className="settings__input"
            type="email"
            placeholder="you@example.com"
            disabled
          />
          <div className="settings__row-form-footer">
            <button className="settings__btn" disabled>
              Update email
            </button>
          </div>
        </div>
      </div>
      <RowSep />

      <div className="settings__row settings__row--stacked">
        <div className="settings__row-meta">
          <span className="settings__row-label">Password</span>
          <span className="settings__row-desc">
            Change your account password.
          </span>
        </div>
        <div className="settings__row-form">
          <input
            className="settings__input"
            type="password"
            placeholder="Current password"
            disabled
          />
          <input
            className="settings__input"
            type="password"
            placeholder="New password"
            disabled
          />
          <input
            className="settings__input"
            type="password"
            placeholder="Confirm new password"
            disabled
          />
          <div className="settings__row-form-footer">
            <button className="settings__btn" disabled>
              Update password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySection;
