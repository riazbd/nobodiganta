import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * usePermission Hook
 * Uses permissions shared from Laravel via HandleInertiaRequests middleware.
 * This is the source of truth for RBAC on the frontend.
 */
export function usePermission() {
  const { props } = usePage();
  const auth = props.auth;
  
  const permissions = useMemo(() => {
    return auth?.user?.permissions || [];
  }, [auth]);

  const currentRole = useMemo(() => {
    return auth?.user?.role || 'reporter';
  }, [auth]);

  const isSuperAdmin = ['supreme_admin', 'super_admin'].includes(currentRole);

  const hasPermission = (permission) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (isSuperAdmin) return true;
    return permissionList.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    if (isSuperAdmin) return true;
    return permissionList.every(p => permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions, currentRole };
}
