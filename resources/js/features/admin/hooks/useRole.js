import { usePage } from '@inertiajs/react';
import { ROLES } from '../api/permissions';

/**
 * Reads the authenticated user's role from the Inertia shared auth prop.
 * This eliminates the localStorage security hole where anyone could set
 * localStorage.admin_role = 'super_admin' to gain admin access.
 *
 * The server must share auth via HandleInertiaRequests middleware:
 *   return ['auth' => ['user' => auth()->user()]];
 *
 * Falls back to 'reporter' (lowest privilege) if no auth prop found.
 */
export function useRole() {
  let auth = null;
  try {
    const page = usePage();
    auth = page.props?.auth;
  } catch (e) {
    // usePage() throws when called outside Inertia context
    // This is expected during initial render in AdminLayout
    // Fall back to 'reporter' (lowest privilege) for safety
    return {
      currentRole: 'reporter',
      roleInfo: ROLES.find(r => r.id === 'reporter') || ROLES[ROLES.length - 1],
      allRoles: ROLES,
      setRole: () => {},
    };
  }

  const currentRole = auth?.user?.role || 'reporter';
  const roleInfo = ROLES.find((r) => r.id === currentRole) || ROLES[ROLES.length - 1];

  return {
    currentRole,
    roleInfo,
    allRoles: ROLES,
    // setRole is a no-op: role comes from the server, not client state
    setRole: () => {},
  };
}
