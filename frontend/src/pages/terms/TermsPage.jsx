import { useEffect } from "react";
import { Link } from "react-router";
import Appbar from "../../components/Appbar";
import "./TermsPage.css";

function TermsPage() {
  useEffect(() => {
    document.title = "Terms & Privacy — Applitracc";
  }, []);

  return (
    <div className="tp">
      <Appbar />
      <div className="tp__body">
        <div className="tp__content">
          <Link to="/" className="tp__back">
            ← Back
          </Link>

          <h1 className="tp__title">Terms &amp; Privacy</h1>

          <section className="tp__section">
            <h2 className="tp__section-title">Data Collection</h2>
            <p>
              Applitracc itself does not sell, share, or monetise your data. The
              only information stored is what you explicitly enter to track your
              job applications.
            </p>
          </section>

          <section className="tp__section">
            <h2 className="tp__section-title">Third-Party Services</h2>
            <p>
              This application relies on third-party services for
              authentication, hosting, and infrastructure. These providers may
              collect data such as IP addresses, usage logs, and device
              information independently, subject to their own privacy policies.
              By using Applitracc you acknowledge that such collection may
              occur.
            </p>
          </section>

          <section className="tp__section">
            <h2 className="tp__section-title">Sensitive Information</h2>
            <p>
              Please do not enter passwords, government ID numbers, financial
              details, or any other sensitive personal information. Applitracc
              is designed for job-search tracking only and is not a secure vault
              for sensitive data.
            </p>
          </section>

          <section className="tp__section">
            <h2 className="tp__section-title">Cookies</h2>
            <p>
              Applitracc uses only the cookies and local storage entries
              necessary to keep you signed in. No advertising or tracking
              cookies are used.
            </p>
          </section>

          <section className="tp__section">
            <h2 className="tp__section-title">Changes</h2>
            <p>
              These terms may be updated from time to time. Continued use of the
              service after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <p className="tp__updated">Last updated: June 2026</p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
