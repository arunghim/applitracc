import "./ContextMenu.css";

function ContextMenu({ contextMenu, onDeleteColumn, onDeleteRow, onClose }) {
  if (!contextMenu.visible) return null;

  return (
    <div
      className="ctx-menu"
      style={{
        position: "fixed",
        top: contextMenu.y,
        left: contextMenu.x,
        zIndex: 1001,
      }}
    >
      {contextMenu.columnId && (
        <button
          className="ctx-menu__item ctx-menu__item--danger"
          onClick={() => {
            onDeleteColumn(contextMenu.columnId);
            onClose();
          }}
        >
          Delete &ldquo;{contextMenu.columnName}&rdquo;
        </button>
      )}
      {contextMenu.row && (
        <button
          className="ctx-menu__item ctx-menu__item--danger"
          onClick={() => {
            onDeleteRow(contextMenu.row);
            onClose();
          }}
        >
          Delete row
        </button>
      )}
    </div>
  );
}

export default ContextMenu;
