import Appbar from "./Appbar";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="auth-layout">
      <Appbar showNav={false} />
      <div className="auth-layout__body">
        <div className="auth-layout__card">
          <h1 className="auth-layout__title">{title}</h1>
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
          {children}
          {footer && <p className="auth-layout__footer">{footer}</p>}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
