import { router } from '@inertiajs/react';

/**
 * Fetch roles with permissions (handled server-side via Inertia props).
 */
export function fetchRoles() {
  router.visit('/admin/roles', {
    preserveState: true,
    preserveScroll: true,
    only: ['roles', 'allPermissions'],
  });
}

/**
 * Create a new role.
 */
export function createRole(data) {
  return new Promise((resolve, reject) => {
    router.post('/admin/roles', data, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Update a role's metadata (name labels, level).
 */
export function updateRole(roleId, data) {
  return new Promise((resolve, reject) => {
    router.put(`/admin/roles/${roleId}`, data, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Delete a role.
 */
export function deleteRole(roleId) {
  return new Promise((resolve, reject) => {
    router.delete(`/admin/roles/${roleId}`, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Sync permissions for a role.
 */
export function syncRolePermissions(roleId, permissions) {
  return new Promise((resolve, reject) => {
    router.post(`/admin/roles/${roleId}/permissions`, { permissions }, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}
