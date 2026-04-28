import { router } from '@inertiajs/react';

/**
 * Fetch users list (handled server-side via Inertia props).
 * For filtering/pagination, navigate to the users page with query params.
 */
export function fetchUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  router.visit(query ? `/admin/users?${query}` : '/admin/users', {
    preserveState: true,
    preserveScroll: true,
    only: ['initialUsers'],
  });
}

/**
 * Create a new user.
 */
export function createUser(data) {
  return new Promise((resolve, reject) => {
    router.post('/admin/users', data, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Update an existing user.
 */
export function updateUser(userId, data) {
  return new Promise((resolve, reject) => {
    router.put(`/admin/users/${userId}`, data, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Delete a user.
 */
export function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    router.delete(`/admin/users/${userId}`, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Assign a role to a user.
 */
export function assignRole(userId, role) {
  return new Promise((resolve, reject) => {
    router.patch(`/admin/users/${userId}/role`, { role }, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}

/**
 * Toggle user active/inactive status.
 */
export function toggleUserStatus(userId) {
  return new Promise((resolve, reject) => {
    router.patch(`/admin/users/${userId}/toggle-status`, {}, {
      onSuccess: () => resolve(),
      onError: (errors) => reject(errors),
    });
  });
}
