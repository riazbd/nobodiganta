export default function FormSelect({
  label,
  id,
  error,
  required = false,
  options = [],
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        id={id}
        className={`form-input${error ? ' form-input-error' : ''}`}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={`${id}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
