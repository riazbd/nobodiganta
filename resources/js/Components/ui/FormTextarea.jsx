export default function FormTextarea({
  label,
  id,
  error,
  required = false,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        className={`form-input${error ? ' form-input-error' : ''}`}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <div id={`${id}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
