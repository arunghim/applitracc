import { useEffect, useRef, useState } from "react";
import "./ApplicationsTable.css";

const STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

const STATUS_CLASS = {
  SAVED: "status--saved",
  APPLIED: "status--applied",
  INTERVIEW: "status--interview",
  OFFER: "status--offer",
  ACCEPTED: "status--accepted",
  REJECTED: "status--rejected",
};

function ApplicationsTable({
  rows,
  columns,
  onCellChange,
  onCustomValueChange,
  onAddRow,
  onContextMenuColumn,
  onContextMenuRow,
}) {
  const tableContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startScrollLeftRef = useRef(0);
  const startMouseXRef = useRef(0);

  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const getColumnWidth = (colId, defaultWidth = 150) =>
    columnWidths[colId] || defaultWidth;

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

  const handleMouseDown = (e) => {
    if (
      e.target.classList?.contains("at-resizer") ||
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
    if (!container) return;
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const totalCols = 7 + columns.length;

  return (
    <div
      ref={tableContainerRef}
      className="at-container"
      style={{ cursor: "grab" }}
    >
      <table className="at-table">
        <thead>
          <tr>
            {[
              { id: "company", label: "Company", defaultWidth: 120 },
              { id: "role", label: "Role", defaultWidth: 120 },
              { id: "status", label: "Status", defaultWidth: 110 },
              { id: "appliedDate", label: "Date Applied", defaultWidth: 120 },
              { id: "salary", label: "Salary", defaultWidth: 100 },
              { id: "link", label: "Link", defaultWidth: 130 },
              { id: "notes", label: "Notes", defaultWidth: 150 },
            ].map(({ id, label, defaultWidth }) => (
              <th
                key={id}
                style={{ width: getColumnWidth(id, defaultWidth) }}
                onContextMenu={(e) => onContextMenuColumn(e, id, label)}
              >
                <div className="at-resizable-header">
                  {label}
                  <div
                    className={`at-resizer${resizingColumn === id ? " at-resizer--active" : ""}`}
                    onMouseDown={(e) =>
                      startResize(id, getColumnWidth(id, defaultWidth), e)
                    }
                  />
                </div>
              </th>
            ))}
            {columns.map((col) => (
              <th
                key={col.id}
                style={{ width: getColumnWidth(col.id, 120) }}
                onContextMenu={(e) => onContextMenuColumn(e, col.id, col.name)}
              >
                <div className="at-resizable-header">
                  {col.name}
                  <div
                    className={`at-resizer${resizingColumn === col.id ? " at-resizer--active" : ""}`}
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
              onContextMenu={(e) => onContextMenuRow(e, row)}
            >
              <td>
                <input
                  value={row.company}
                  placeholder="Company"
                  onChange={(e) =>
                    onCellChange(row._tempId, "company", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={row.role}
                  placeholder="Role"
                  onChange={(e) =>
                    onCellChange(row._tempId, "role", e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  className={STATUS_CLASS[row.status] ?? ""}
                  value={row.status}
                  onChange={(e) =>
                    onCellChange(row._tempId, "status", e.target.value)
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="date"
                  value={row.appliedDate}
                  onChange={(e) =>
                    onCellChange(row._tempId, "appliedDate", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={row.salary}
                  placeholder="$"
                  onChange={(e) =>
                    onCellChange(row._tempId, "salary", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={row.link}
                  placeholder="https://"
                  onChange={(e) =>
                    onCellChange(row._tempId, "link", e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  value={row.notes}
                  placeholder="Notes"
                  rows={1}
                  onChange={(e) =>
                    onCellChange(row._tempId, "notes", e.target.value)
                  }
                />
              </td>
              {columns.map((col) => (
                <td key={col.id}>
                  <input
                    value={row.customValues?.[col.id] ?? ""}
                    placeholder={col.name}
                    onChange={(e) =>
                      onCustomValueChange(row._tempId, col.id, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="at-add-row-cell" colSpan={totalCols}>
              <button className="at-add-row-btn" onClick={onAddRow}>
                + Add row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationsTable;
