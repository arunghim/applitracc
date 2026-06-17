import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AccountSection from "./AccountSection";
import SecuritySection from "./SecuritySection";
import AppearanceSection from "./AppearanceSection";
import "./SettingsPage.css";

function IconPerson() {
  return (
    <svg className="settings__nav-icon" viewBox="0 0 16 16" fill="none">
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
    <svg className="settings__nav-icon" viewBox="0 0 16 16" fill="none">
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
    <svg className="settings__nav-icon" viewBox="0 0 16 16" fill="none">
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
    document.title = "Settings | Applitracc";
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    if (theme === "light") root.classList.add("theme-light");
    if (theme === "dark") root.classList.add("theme-dark");
  }, [theme]);

  return (
    <div className="settings">
      <aside className="settings__sidebar">
        <div className="settings__sidebar-profile">
          <div className="settings__avatar">{initials}</div>
          <div className="settings__sidebar-profile-info">
            <p className="settings__sidebar-profile-name">{displayName}</p>
            <p className="settings__sidebar-profile-email">
              {email || "No email"}
            </p>
          </div>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="settings__nav-group">
            <span className="settings__nav-group-label">{group.label}</span>
            {group.items.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`settings__nav-item${activeSection === id ? " settings__nav-item--active" : ""}`}
                onClick={() => setActiveSection(id)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        ))}

        <div className="settings__sidebar-footer">
          <button
            className="settings__back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <IconArrow />
            Back to dashboard
          </button>
        </div>
      </aside>

      <main className="settings__content">
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
