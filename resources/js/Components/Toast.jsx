export default function Toast({ message, visible }) {
  return (
    <div
      id="toast"
      className={visible ? 'show' : ''}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
