import "./DeleteConfirmModal.css";

function DeleteConfirmModal({ show, deleteTarget, onConfirm, onClose }) {
  if (!show) return null;

  const isColumn = deleteTarget?.type === "column";

  return (
    <div className="dcm-overlay" onClick={onClose}>
      <div className="dcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dcm-modal__header">
          <h3 className="dcm-modal__title">
            Delete {isColumn ? "column" : "row"}
          </h3>
          <p className="dcm-modal__desc">This action cannot be undone.</p>
        </div>
        <div className="dcm-modal__body">
          <p className="dcm-modal__message">
            Are you sure you want to delete this {deleteTarget?.type}?
          </p>
          {isColumn && (
            <p className="dcm-modal__warning">
              All values stored in this column will be permanently removed.
            </p>
          )}
        </div>
        <div className="dcm-modal__footer">
          <button
            className="dcm-modal__btn dcm-modal__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="dcm-modal__btn dcm-modal__btn--delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
