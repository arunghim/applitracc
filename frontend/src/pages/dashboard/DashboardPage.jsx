import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getColumns,
  addColumn,
  deleteColumn,
} from "../../api/api";
import Appbar from "../../components/Appbar";
import "./DashboardPage.css";

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

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    appliedDate: getTodayDate(),
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
    appliedDate: app.appliedDate ?? getTodayDate(),
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

  useEffect(() => {
    document.title = "Dashboard | Applitrack";
  }, []);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  const newFieldInputRef = useRef(null);

  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const tableContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startScrollLeftRef = useRef(0);
  const startMouseXRef = useRef(0);

  const [activeSort, setActiveSort] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    columnId: null,
    columnName: null,
    row: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showAddFieldModal && newFieldInputRef.current) {
      setTimeout(() => newFieldInputRef.current?.focus(), 100);
    }
  }, [showAddFieldModal]);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu]);

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

  function handleSettings() {
    navigate("/settings");
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

  async function handleAddField() {
    const name = newFieldName.trim();
    if (!name) return;
    try {
      await addColumn(name);
      setNewFieldName("");
      setShowAddFieldModal(false);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteColumn(colId) {
    setDeleteTarget({ type: "column", id: colId });
    setShowDeleteModal(true);
  }

  async function handleDeleteRow(row) {
    setDeleteTarget({ type: "row", row });
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "column") {
        await deleteColumn(deleteTarget.id);
      } else if (deleteTarget.type === "row") {
        if (deleteTarget.row._isNew) {
          setRows((prev) =>
            prev.filter((r) => r._tempId !== deleteTarget.row._tempId),
          );
        } else {
          await deleteApplication(deleteTarget.row.id);
        }
      }
      await loadData();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleColumnContextMenu(e, colId, colName) {
    e.preventDefault();
    e.stopPropagation();
    const isCustomColumn = columns.some((c) => c.id === colId);
    if (!isCustomColumn) return;

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      columnId: colId,
      columnName: colName,
      row: null,
    });
  }

  function handleRowContextMenu(e, row) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      columnId: null,
      columnName: null,
      row: row,
    });
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

  useEffect(() => {
    if (rows.some((r) => r._isDirty)) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rows]);

  const handleMouseDown = (e) => {
    if (
      e.target.classList?.contains("resizer") ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "SELECT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }

    isDraggingRef.current = true;
    startMouseXRef.current = e.pageX;
    startScrollLeftRef.current = tableContainerRef.current?.scrollLeft || 0;
    tableContainerRef.current.style.cursor = "grabbing";
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const dx = e.pageX - startMouseXRef.current;
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = startScrollLeftRef.current - dx;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = "grab";
    }
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        container.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []);

  const startResize = (colId, startWidth, e) => {
    e.stopPropagation();
    setResizingColumn(colId);
    startXRef.current = e.clientX;
    startWidthRef.current = startWidth;

    const handleResizeMove = (moveEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(80, startWidthRef.current + delta);
      setColumnWidths((prev) => ({ ...prev, [colId]: newWidth }));
    };

    const handleResizeUp = () => {
      setResizingColumn(null);
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeUp);
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeUp);
  };

  const getColumnWidth = (colId, defaultWidth = 150) => {
    return columnWidths[colId] || defaultWidth;
  };

  const sortByStatus = () => {
    setActiveSort("status");
  };

  const sortBySalary = () => {
    setActiveSort("salary");
  };

  const sortByDate = () => {
    setActiveSort("date");
    const sorted = [...rows].sort((a, b) => {
      if (!a.appliedDate && !b.appliedDate) return 0;
      if (!a.appliedDate) return 1;
      if (!b.appliedDate) return -1;
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    });
    setRows(sorted);
  };

  const dirtyCount = rows.filter((r) => r._isDirty).length;
  const totalCols = 7 + columns.length;

  return (
    <div className="dashboard">
      <Appbar
        showNav={true}
        rightActions={
          <>
            <button onClick={handleSettings} className="appbar-button">
              Settings
            </button>
            <button onClick={handleLogout} className="appbar-button">
              Logout
            </button>
          </>
        }
      />

      <div className="dashboard__main">
        {error && <div className="dashboard__error">{error}</div>}

        {savedAt && !error && dirtyCount === 0 && (
          <div className="dashboard__success">All changes saved</div>
        )}

        <div className="dashboard-header">
          <div>
            <h1>Applications</h1>
            <p>{rows.length} applications tracked</p>
          </div>
        </div>

        <div className="dashboard__toolbar">
          <button
            className="toolbar-button toolbar-button--icon"
            onClick={() => setShowAddFieldModal(true)}
            title="Add custom field"
          >
            +
          </button>
          <div className="toolbar-divider" />
          <button
            className={`toolbar-button ${activeSort === "status" ? "toolbar-button--active" : ""}`}
            onClick={sortByStatus}
          >
            By Status
            <span className="sort-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </span>
          </button>
          <button
            className={`toolbar-button ${activeSort === "salary" ? "toolbar-button--active" : ""}`}
            onClick={sortBySalary}
          >
            By Salary
            <span className="sort-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </span>
          </button>
          <button
            className={`toolbar-button ${activeSort === "date" ? "toolbar-button--active" : ""}`}
            onClick={sortByDate}
          >
            By Date
            <span className="sort-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </span>
          </button>
        </div>

        <div
          ref={tableContainerRef}
          className="table-container"
          style={{ cursor: "grab" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th
                  style={{ width: getColumnWidth("company", 120) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "company", "Company")
                  }
                >
                  <div className="resizable-header">
                    Company
                    <div
                      className={`resizer ${resizingColumn === "company" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize(
                          "company",
                          getColumnWidth("company", 120),
                          e,
                        )
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("role", 120) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "role", "Role")
                  }
                >
                  <div className="resizable-header">
                    Role
                    <div
                      className={`resizer ${resizingColumn === "role" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize("role", getColumnWidth("role", 120), e)
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("status", 100) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "status", "Status")
                  }
                >
                  <div className="resizable-header">
                    Status
                    <div
                      className={`resizer ${resizingColumn === "status" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize("status", getColumnWidth("status", 100), e)
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("appliedDate", 110) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "appliedDate", "Date Applied")
                  }
                >
                  <div className="resizable-header">
                    Date Applied
                    <div
                      className={`resizer ${resizingColumn === "appliedDate" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize(
                          "appliedDate",
                          getColumnWidth("appliedDate", 110),
                          e,
                        )
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("salary", 100) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "salary", "Salary")
                  }
                >
                  <div className="resizable-header">
                    Salary
                    <div
                      className={`resizer ${resizingColumn === "salary" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize("salary", getColumnWidth("salary", 100), e)
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("link", 120) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "link", "Link")
                  }
                >
                  <div className="resizable-header">
                    Link
                    <div
                      className={`resizer ${resizingColumn === "link" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize("link", getColumnWidth("link", 120), e)
                      }
                    />
                  </div>
                </th>
                <th
                  style={{ width: getColumnWidth("notes", 150) }}
                  onContextMenu={(e) =>
                    handleColumnContextMenu(e, "notes", "Notes")
                  }
                >
                  <div className="resizable-header">
                    Notes
                    <div
                      className={`resizer ${resizingColumn === "notes" ? "resizing" : ""}`}
                      onMouseDown={(e) =>
                        startResize("notes", getColumnWidth("notes", 150), e)
                      }
                    />
                  </div>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ width: getColumnWidth(col.id, 120) }}
                    onContextMenu={(e) =>
                      handleColumnContextMenu(e, col.id, col.name)
                    }
                  >
                    <div className="resizable-header">
                      {col.name}
                      <div
                        className={`resizer ${resizingColumn === col.id ? "resizing" : ""}`}
                        onMouseDown={(e) =>
                          startResize(col.id, getColumnWidth(col.id, 120), e)
                        }
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._tempId}
                  onContextMenu={(e) => handleRowContextMenu(e, row)}
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
                      placeholder="$"
                      onChange={(e) =>
                        handleCellChange(row._tempId, "salary", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.link}
                      placeholder="Link"
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
                        placeholder={col.name}
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
                </tr>
              ))}
              <tr>
                <td className="add-row-cell" colSpan={totalCols}>
                  <button className="add-row-button" onClick={handleAddRow}>
                    +
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1001,
          }}
        >
          {contextMenu.columnId && (
            <div
              className="context-menu-item"
              onClick={() => {
                handleDeleteColumn(contextMenu.columnId);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete column "{contextMenu.columnName}"
            </div>
          )}
          {contextMenu.row && (
            <div
              className="context-menu-item"
              onClick={() => {
                handleDeleteRow(contextMenu.row);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete row
            </div>
          )}
        </div>
      )}

      {showAddFieldModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFieldModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Add custom field</h3>
            </div>
            <div className="modal__body">
              <input
                ref={newFieldInputRef}
                type="text"
                placeholder="Field name (e.g., 'Recruiter', 'Location')"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddField();
                  }
                }}
              />
            </div>
            <div className="modal__footer">
              <button
                className="modal__button modal__button--cancel"
                onClick={() => {
                  setShowAddFieldModal(false);
                  setNewFieldName("");
                }}
              >
                Cancel
              </button>
              <button
                className="modal__button modal__button--save"
                onClick={handleAddField}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal__body">
              <p>Are you sure you want to delete this {deleteTarget?.type}?</p>
              {deleteTarget?.type === "column" && (
                <p style={{ color: "#e03e3e", marginTop: "0.5rem" }}>
                  This will permanently delete the column and all its values.
                </p>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="modal__button modal__button--cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </button>
              <button
                className="modal__button modal__button--save"
                onClick={confirmDelete}
                style={{ background: "#e03e3e", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
