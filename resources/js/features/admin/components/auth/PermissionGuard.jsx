import { usePermission } from '../../hooks/usePermission';

export function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}
