import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useAdminApp } from '../../contexts/AdminAppContext';

/**
 * Wraps admin page roots. Redirects to /login if unauthenticated.
 * Shows 403 if role is insufficient.
 *
 * Usage: <AdminGuard minRole="editor">...</AdminGuard>
 */
export default function AdminGuard({ children, minRole = 'reporter' }) {
  const { user, hasRole } = useAdminApp();

  useEffect(() => {
    if (!user) {
      router.visit('/login');
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (!hasRole(minRole)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>403 — Access Denied</h2>
        <p style={{ color: '#888' }}>You don't have permission to view this page.</p>
        <button
          onClick={() => router.visit('/admin/dashboard')}
          style={{ padding: '8px 18px', background: '#c00', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return children;
}
