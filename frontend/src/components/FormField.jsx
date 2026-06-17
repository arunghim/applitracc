import "./FormField.css";

function FormField({ id, label, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default FormField;
