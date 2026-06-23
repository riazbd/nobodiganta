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

  // Only the supreme admin is an unconditional wildcard; super_admin (and every
  // other role) is governed by its assigned permissions — which the supreme/super
  // admin accounts already hold in full.
  const isSupremeAdmin = currentRole === 'supreme_admin';

  const hasPermission = (permission) => {
    if (isSupremeAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (isSupremeAdmin) return true;
    return permissionList.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    if (isSupremeAdmin) return true;
    return permissionList.every(p => permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions, currentRole };
}
