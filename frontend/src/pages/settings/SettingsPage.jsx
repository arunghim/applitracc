import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./SettingsPage.css";

function IconPerson() {
  return (
    <svg className="sp__nav-icon" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 13.5c0-2.761 2.462-4.5 5.5-4.5s5.5 1.739 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="sp__nav-icon" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2L3 4.5v3.75C3 11.25 5.5 13.5 8 14c2.5-.5 5-2.75 5-5.75V4.5L8 2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg className="sp__nav-icon" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1.25M8 13.25V14.5M1.5 8h1.25M13.25 8H14.5M3.4 3.4l.88.88M11.72 11.72l.88.88M3.4 12.6l.88-.88M11.72 4.28l.88-.88"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
      <path
        d="M9 11L5 7l4-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5l2.5 2.5 3.5-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_GROUPS = [
  {
    label: "Account",
    items: [
      { id: "account", label: "My Account", icon: <IconPerson /> },
      { id: "security", label: "Security", icon: <IconShield /> },
    ],
  },
  {
    label: "Preferences",
    items: [{ id: "appearance", label: "Appearance", icon: <IconSun /> }],
  },
];

function RowSep() {
  return <div className="sp__row-sep" />;
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
    <div className="sp__page">
      <h1 className="sp__page-title">My Account</h1>
      <div className="sp__page-divider" />

      <div className="sp__row">
        <div className="sp__row-meta">
          <span className="sp__row-label">Photo</span>
        </div>
        <div className="sp__row-control">
          <div className="sp__avatar sp__avatar--row">{initials}</div>
        </div>
      </div>
      <RowSep />

      <div className="sp__row">
        <div className="sp__row-meta">
          <span className="sp__row-label">Full name</span>
        </div>
        <div className="sp__row-control">
          <span className="sp__row-value">{fullName}</span>
        </div>
      </div>
      <RowSep />

      <div className="sp__row">
        <div className="sp__row-meta">
          <span className="sp__row-label">Email</span>
          <span className="sp__row-desc">Used to sign in to Applitrack.</span>
        </div>
        <div className="sp__row-control">
          <span className="sp__row-value">{email || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="sp__page">
      <h1 className="sp__page-title">Security</h1>
      <div className="sp__page-divider" />

      <div className="sp__row sp__row--stacked">
        <div className="sp__row-meta">
          <span className="sp__row-label">Email address</span>
          <span className="sp__row-desc">
            Change the email you use to sign in.
          </span>
        </div>
        <div className="sp__row-form">
          <input
            className="sp__input"
            type="email"
            placeholder="you@example.com"
            disabled
          />
          <div className="sp__row-form-footer">
            <button className="sp__btn" disabled>
              Update email
            </button>
            <span className="sp__badge">Coming soon</span>
          </div>
        </div>
      </div>
      <RowSep />

      <div className="sp__row sp__row--stacked">
        <div className="sp__row-meta">
          <span className="sp__row-label">Password</span>
          <span className="sp__row-desc">Change your account password.</span>
        </div>
        <div className="sp__row-form">
          <input
            className="sp__input"
            type="password"
            placeholder="Current password"
            disabled
          />
          <input
            className="sp__input"
            type="password"
            placeholder="New password"
            disabled
          />
          <input
            className="sp__input"
            type="password"
            placeholder="Confirm new password"
            disabled
          />
          <div className="sp__row-form-footer">
            <button className="sp__btn" disabled>
              Update password
            </button>
            <span className="sp__badge">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSection({ theme, setTheme }) {
  return (
    <div className="sp__page">
      <h1 className="sp__page-title">Appearance</h1>
      <div className="sp__page-divider" />

      <div className="sp__row sp__row--stacked">
        <div className="sp__row-meta">
          <span className="sp__row-label">Interface theme</span>
          <span className="sp__row-desc">
            Customise how Applitrack looks on this device.
          </span>
        </div>
        <div className="sp__theme-grid">
          {[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ].map(({ value, label }) => (
            <button
              key={value}
              className={`sp__theme-btn${theme === value ? " sp__theme-btn--active" : ""}`}
              onClick={() => setTheme(value)}
            >
              <div className={`sp__theme-preview sp__theme-preview--${value}`}>
                <div className="sp__theme-preview-bar" />
                <div className="sp__theme-preview-body">
                  <div className="sp__theme-preview-line" />
                  <div className="sp__theme-preview-line sp__theme-preview-line--short" />
                  <div className="sp__theme-preview-line sp__theme-preview-line--shorter" />
                </div>
              </div>
              <div className={`sp__theme-footer sp__theme-footer--${value}`}>
                <span className="sp__theme-label">{label}</span>
                {theme === value && (
                  <span className="sp__theme-check">
                    <CheckIcon />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("account");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") ?? "system",
  );

  const firstName = localStorage.getItem("firstName") ?? "";
  const lastName = localStorage.getItem("lastName") ?? "";
  const email = localStorage.getItem("email") ?? "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  const displayName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : "Unnamed";

  useEffect(() => {
    document.title = "Settings | Applitrack";
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    if (theme === "light") root.classList.add("theme-light");
    if (theme === "dark") root.classList.add("theme-dark");
  }, [theme]);

  return (
    <div className="sp">
      <aside className="sp__sidebar">
        <div className="sp__sidebar-profile">
          <div className="sp__avatar">{initials}</div>
          <div className="sp__sidebar-profile-info">
            <p className="sp__sidebar-profile-name">{displayName}</p>
            <p className="sp__sidebar-profile-email">{email || "No email"}</p>
          </div>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sp__nav-group">
            <span className="sp__nav-group-label">{group.label}</span>
            {group.items.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`sp__nav-item${activeSection === id ? " sp__nav-item--active" : ""}`}
                onClick={() => setActiveSection(id)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        ))}

        <div className="sp__sidebar-footer">
          <button
            className="sp__back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <IconArrow />
            Back to dashboard
          </button>
        </div>
      </aside>

      <main className="sp__content">
        {activeSection === "account" && <AccountSection />}
        {activeSection === "security" && <SecuritySection />}
        {activeSection === "appearance" && (
          <AppearanceSection theme={theme} setTheme={setTheme} />
        )}
      </main>
    </div>
  );
}

export default SettingsPage;
