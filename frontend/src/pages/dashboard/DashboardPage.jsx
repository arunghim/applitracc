import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../../api/api";

const STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

const EMPTY_FORM = {
  company: "",
  role: "",
  status: "APPLIED",
  notes: "",
  salary: "",
  link: "",
  appliedDate: "",
};

function DashboardPage() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") ?? "";
  const lastName = localStorage.getItem("lastName") ?? "";

  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const res = await getAllApplications();
      setApplications(res.data?.content ?? res.data ?? []);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    navigate("/");
  }

  function handleEdit(app) {
    setEditingId(app.id);
    setForm({
      company: app.company ?? "",
      role: app.role ?? "",
      status: app.status ?? "APPLIED",
      notes: app.notes ?? "",
      salary: app.salary ?? "",
      link: app.link ?? "",
      appliedDate: app.appliedDate ?? "",
    });
  }

  function handleNewForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        appliedDate: form.appliedDate || null,
      };
      if (editingId != null) {
        await updateApplication(editingId, payload);
      } else {
        await createApplication(payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadApplications();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      await loadApplications();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleStatusChange(app, newStatus) {
    try {
      await updateApplication(app.id, {
        company: app.company,
        role: app.role,
        status: newStatus,
        notes: app.notes ?? "",
        salary: app.salary ?? "",
        link: app.link ?? "",
        appliedDate: app.appliedDate ?? null,
      });
      await loadApplications();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {" | "}
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <h1>
        Welcome, {firstName} {lastName}
      </h1>

      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}

      <h2>{editingId != null ? "Edit Application" : "Add Application"}</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Company: </label>
          <input
            name="company"
            value={form.company}
            onChange={handleFormChange}
            required
          />
        </div>
        <div>
          <label>Role: </label>
          <input
            name="role"
            value={form.role}
            onChange={handleFormChange}
            required
          />
        </div>
        <div>
          <label>Status: </label>
          <select name="status" value={form.status} onChange={handleFormChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date Applied: </label>
          <input
            type="date"
            name="appliedDate"
            value={form.appliedDate}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label>Salary: </label>
          <input
            name="salary"
            value={form.salary}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label>Link: </label>
          <input name="link" value={form.link} onChange={handleFormChange} />
        </div>
        <div>
          <label>Notes: </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            rows={3}
          />
        </div>
        <button type="submit">
          {editingId != null ? "Save Changes" : "Add Application"}
        </button>
        {editingId != null && (
          <button type="button" onClick={handleNewForm}>
            Cancel
          </button>
        )}
      </form>

      <h2>My Job Applications ({applications.length})</h2>
      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <table border="1" cellPadding="4">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Salary</th>
              <th>Link</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.company}</td>
                <td>{app.role}</td>
                <td>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{app.appliedDate ?? ""}</td>
                <td>{app.salary ?? ""}</td>
                <td>
                  {app.link ? (
                    <a href={app.link} target="_blank" rel="noreferrer">
                      link
                    </a>
                  ) : (
                    ""
                  )}
                </td>
                <td>{app.notes ?? ""}</td>
                <td>
                  <button onClick={() => handleEdit(app)}>Edit</button>{" "}
                  <button onClick={() => handleDelete(app.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DashboardPage;
