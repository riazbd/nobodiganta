import { usePermission } from '../../hooks/usePermission';

export function ActionButton({ permission, children, className = '', ...props }) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return null;
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
