import { useEffect, useState } from "react";
import { getHealth } from "../../api/api";

function StatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealth()
      .then(setStatus)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Status</h1>
      <p>
        Backend:{" "}
        {error ? (
          <span style={{ color: "red" }}>unreachable — {error}</span>
        ) : status ? (
          <span style={{ color: "green" }}>{status}</span>
        ) : (
          <span>checking…</span>
        )}
      </p>
    </div>
  );
}

export default StatusPage;
