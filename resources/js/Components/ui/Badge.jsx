/**
 * variants: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
 */
const COLORS = {
  default: { bg: '#f0f0f0', color: '#555' },
  primary: { bg: '#c00', color: '#fff' },
  success: { bg: '#28a745', color: '#fff' },
  warning: { bg: '#ffc107', color: '#333' },
  danger:  { bg: '#dc3545', color: '#fff' },
  info:    { bg: '#0055a5', color: '#fff' },
};

export default function Badge({ children, variant = 'default', style = {} }) {
  const { bg, color } = COLORS[variant] || COLORS.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: 11,
      fontWeight: 600,
      background: bg,
      color,
      ...style,
    }}>
      {children}
    </span>
  );
}
