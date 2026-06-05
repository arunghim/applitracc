import { useEffect, useRef } from "react";
import "./AddFieldModal.css";

function AddFieldModal({
  show,
  newFieldName,
  setNewFieldName,
  onAdd,
  onClose,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="afm-overlay" onClick={onClose}>
      <div className="afm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="afm-modal__header">
          <h3 className="afm-modal__title">Add custom field</h3>
          <p className="afm-modal__desc">
            Give your new column a name to track additional information.
          </p>
        </div>
        <div className="afm-modal__body">
          <label className="afm-modal__label" htmlFor="afm-field-name">
            Field name
          </label>
          <input
            ref={inputRef}
            id="afm-field-name"
            className="afm-modal__input"
            type="text"
            placeholder="e.g. Recruiter, Location, Stage"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
              if (e.key === "Escape") onClose();
            }}
          />
        </div>
        <div className="afm-modal__footer">
          <button
            className="afm-modal__btn afm-modal__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="afm-modal__btn afm-modal__btn--save"
            onClick={onAdd}
          >
            Add field
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddFieldModal;
