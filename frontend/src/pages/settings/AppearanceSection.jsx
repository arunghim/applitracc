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

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function AppearanceSection({ theme, setTheme }) {
  return (
    <div className="settings__page">
      <h1 className="settings__page-title">Appearance</h1>
      <div className="settings__page-divider" />

      <div className="settings__row settings__row--stacked">
        <div className="settings__row-meta">
          <span className="settings__row-label">Interface theme</span>
          <span className="settings__row-desc">
            Customise how Applitrack looks on this device.
          </span>
        </div>
        <div className="settings__theme-grid">
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              className={`settings__theme-btn${theme === value ? " settings__theme-btn--active" : ""}`}
              onClick={() => setTheme(value)}
            >
              <div
                className={`settings__theme-preview settings__theme-preview--${value}`}
              >
                <div className="settings__theme-preview-bar" />
                <div className="settings__theme-preview-body">
                  <div className="settings__theme-preview-line" />
                  <div className="settings__theme-preview-line settings__theme-preview-line--short" />
                  <div className="settings__theme-preview-line settings__theme-preview-line--shorter" />
                </div>
              </div>
              <div
                className={`settings__theme-footer settings__theme-footer--${value}`}
              >
                <span className="settings__theme-label">{label}</span>
                {theme === value && (
                  <span className="settings__theme-check">
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

export default AppearanceSection;
