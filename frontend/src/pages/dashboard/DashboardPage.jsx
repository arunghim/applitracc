import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getColumns,
  addColumn,
  deleteColumn,
} from "../../api/api";

const STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

let _tempCounter = 0;
function nextTempId() {
  return `new-${++_tempCounter}`;
}

function emptyRow(cols) {
  const customValues = {};
  cols.forEach((c) => {
    customValues[c.id] = "";
  });
  return {
    _tempId: nextTempId(),
    _isNew: true,
    _isDirty: true,
    id: null,
    company: "",
    role: "",
    status: "APPLIED",
    appliedDate: "",
    salary: "",
    link: "",
    notes: "",
    customValues,
  };
}

function appToRow(app) {
  return {
    _tempId: String(app.id),
    _isNew: false,
    _isDirty: false,
    id: app.id,
    company: app.company ?? "",
    role: app.role ?? "",
    status: app.status ?? "APPLIED",
    appliedDate: app.appliedDate ?? "",
    salary: app.salary ?? "",
    link: app.link ?? "",
    notes: app.notes ?? "",
    customValues: app.customValues ?? {},
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") ?? "";
  const lastName = localStorage.getItem("lastName") ?? "";

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const newFieldInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showAddField) newFieldInputRef.current?.focus();
  }, [showAddField]);

  async function loadData() {
    try {
      const [appsRes, colsRes] = await Promise.all([
        getAllApplications(),
        getColumns().catch(() => ({ data: [] })),
      ]);
      const apps = appsRes.data?.content ?? appsRes.data ?? [];
      const cols = colsRes.data ?? [];
      setColumns(cols);
      setRows(apps.map(appToRow));
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

  function handleCellChange(tempId, field, value) {
    setRows((prev) =>
      prev.map((r) =>
        r._tempId === tempId ? { ...r, [field]: value, _isDirty: true } : r,
      ),
    );
  }

  function handleCustomValueChange(tempId, colId, value) {
    setRows((prev) =>
      prev.map((r) =>
        r._tempId === tempId
          ? {
              ...r,
              customValues: { ...r.customValues, [colId]: value },
              _isDirty: true,
            }
          : r,
      ),
    );
  }

  function handleAddRow() {
    setRows((prev) => [...prev, emptyRow(columns)]);
  }

  async function handleAddField(e) {
    e.preventDefault();
    const name = newFieldName.trim();
    if (!name) return;
    try {
      await addColumn(name);
      setNewFieldName("");
      setShowAddField(false);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteColumn(colId) {
    if (!confirm("Delete this column and all its values?")) return;
    try {
      await deleteColumn(colId);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteRow(row) {
    if (row._isNew) {
      setRows((prev) => prev.filter((r) => r._tempId !== row._tempId));
      return;
    }
    if (!confirm("Delete this application?")) return;
    try {
      await deleteApplication(row.id);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSave() {
    const dirty = rows.filter((r) => r._isDirty);
    if (dirty.length === 0) return;

    const invalid = dirty.filter((r) => !r.company.trim() || !r.role.trim());
    if (invalid.length > 0) {
      setError(
        `${invalid.length} row(s) are missing a required Company or Role.`,
      );
      return;
    }

    setSaving(true);
    setError("");
    setSavedAt(null);
    try {
      await Promise.all(
        dirty.map((row) => {
          const payload = {
            company: row.company.trim(),
            role: row.role.trim(),
            status: row.status,
            notes: row.notes.trim(),
            salary: row.salary.trim(),
            link: row.link.trim(),
            appliedDate: row.appliedDate || null,
            customValues: Object.fromEntries(
              Object.entries(row.customValues).map(([k, v]) => [k, v ?? ""]),
            ),
          };
          return row._isNew
            ? createApplication(payload)
            : updateApplication(row.id, payload);
        }),
      );
      setSavedAt(Date.now());
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const dirtyCount = rows.filter((r) => r._isDirty).length;
  const totalCols = 7 + columns.length + 1; // fixed cols + custom + actions

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
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {savedAt && !error && (
        <p style={{ color: "green" }}>Saved successfully.</p>
      )}

      <div
        style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}
      >
        <button onClick={handleAddRow}>+ Add Row</button>
        <button onClick={() => setShowAddField((v) => !v)}>+ Add Field</button>
        <button onClick={handleSave} disabled={saving || dirtyCount === 0}>
          {saving
            ? "Saving…"
            : dirtyCount > 0
              ? `Save (${dirtyCount} unsaved)`
              : "Save"}
        </button>
      </div>

      {showAddField && (
        <form
          onSubmit={handleAddField}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <input
            ref={newFieldInputRef}
            placeholder="Field name"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          <button type="submit">Add</button>
          <button type="button" onClick={() => setShowAddField(false)}>
            Cancel
          </button>
        </form>
      )}

      {columns.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong>Custom fields: </strong>
          {columns.map((col) => (
            <span
              key={col.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginRight: 8,
                padding: "2px 6px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.name}
              <button
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  color: "red",
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
                title={`Delete field "${col.name}"`}
                onClick={() => handleDeleteColumn(col.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
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
              {columns.map((col) => (
                <th key={col.id}>{col.name}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  style={{ textAlign: "center", padding: 16 }}
                >
                  No applications yet — click <strong>+ Add Row</strong> to
                  start.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row._tempId}
                  style={row._isDirty ? { background: "#fffbe6" } : undefined}
                >
                  <td>
                    <input
                      value={row.company}
                      placeholder="Company"
                      onChange={(e) =>
                        handleCellChange(row._tempId, "company", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.role}
                      placeholder="Role"
                      onChange={(e) =>
                        handleCellChange(row._tempId, "role", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={row.status}
                      onChange={(e) =>
                        handleCellChange(row._tempId, "status", e.target.value)
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.appliedDate}
                      onChange={(e) =>
                        handleCellChange(
                          row._tempId,
                          "appliedDate",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.salary}
                      placeholder="Salary"
                      onChange={(e) =>
                        handleCellChange(row._tempId, "salary", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.link}
                      placeholder="https://…"
                      onChange={(e) =>
                        handleCellChange(row._tempId, "link", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      value={row.notes}
                      placeholder="Notes"
                      rows={1}
                      onChange={(e) =>
                        handleCellChange(row._tempId, "notes", e.target.value)
                      }
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.id}>
                      <input
                        value={row.customValues?.[col.id] ?? ""}
                        onChange={(e) =>
                          handleCustomValueChange(
                            row._tempId,
                            col.id,
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleDeleteRow(row)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;
