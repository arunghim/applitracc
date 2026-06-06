import { useEffect, useState } from "react";
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
import DashboardHeader from "./DashboardHeader";
import DashboardToolbar from "./DashboardToolbar";
import ApplicationsTable from "./ApplicationsTable";
import AddFieldModal from "./AddFieldModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ContextMenu from "./ContextMenu";
import "./DashboardPage.css";

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

  useEffect(() => {
    document.title = "Dashboard | Applitrack";
  }, []);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
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
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu.visible]);

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

  function handleDeleteColumn(colId) {
    setDeleteTarget({ type: "column", id: colId });
    setShowDeleteModal(true);
  }

  function handleDeleteRow(row) {
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
      row,
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
    }
  }

  useEffect(() => {
    if (rows.some((r) => r._isDirty)) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  function sortByStatus() {
    const order = [
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "ACCEPTED",
      "REJECTED",
    ];
    setActiveSort("status");
    setRows((prev) =>
      [...prev].sort(
        (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
      ),
    );
  }

  function sortBySalary() {
    setActiveSort("salary");
    setRows((prev) =>
      [...prev].sort((a, b) => {
        const numA = parseFloat(a.salary.replace(/[^0-9.]/g, "")) || 0;
        const numB = parseFloat(b.salary.replace(/[^0-9.]/g, "")) || 0;
        return numB - numA;
      }),
    );
  }

  function sortByDate() {
    setActiveSort("date");
    setRows((prev) =>
      [...prev].sort((a, b) => {
        if (!a.appliedDate && !b.appliedDate) return 0;
        if (!a.appliedDate) return 1;
        if (!b.appliedDate) return -1;
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      }),
    );
  }

  const dirtyCount = rows.filter((r) => r._isDirty).length;

  return (
    <div className="dp">
      <Appbar
        rightActions={
          <>
            <button onClick={handleSettings} className="dp__nav-btn">
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="dp__nav-btn dp__nav-btn--solid"
            >
              Log out
            </button>
          </>
        }
      />

      {savedAt && !error && dirtyCount === 0 && (
        <div className="dp__toast">All changes saved</div>
      )}

      <div className="dp__main">
        {error && <div className="dp__error">{error}</div>}

        <DashboardHeader rowCount={rows.length} />

        <DashboardToolbar
          activeSort={activeSort}
          onAddField={() => setShowAddFieldModal(true)}
          onSortStatus={sortByStatus}
          onSortSalary={sortBySalary}
          onSortDate={sortByDate}
        />

        <ApplicationsTable
          rows={rows}
          columns={columns}
          onCellChange={handleCellChange}
          onCustomValueChange={handleCustomValueChange}
          onAddRow={handleAddRow}
          onContextMenuColumn={handleColumnContextMenu}
          onContextMenuRow={handleRowContextMenu}
        />
      </div>

      <ContextMenu
        contextMenu={contextMenu}
        onDeleteColumn={handleDeleteColumn}
        onDeleteRow={handleDeleteRow}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
      />

      <AddFieldModal
        show={showAddFieldModal}
        newFieldName={newFieldName}
        setNewFieldName={setNewFieldName}
        onAdd={handleAddField}
        onClose={() => {
          setShowAddFieldModal(false);
          setNewFieldName("");
        }}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        deleteTarget={deleteTarget}
        onConfirm={confirmDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default DashboardPage;
