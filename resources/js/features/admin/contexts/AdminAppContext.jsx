import { createContext, useContext } from 'react';
import { usePage } from '@inertiajs/react';
import { useApp } from '../../../contexts/AppContext';

const AdminAppContext = createContext(null);

const ROLE_LEVEL = {
  super_admin: 7,
  editor_in_chief: 6,
  managing_editor: 5,
  section_editor: 4,
  seo_manager: 3,
  photographer: 2,
  reporter: 1,
};

export function AdminAppProvider({ children }) {
  const { lang, toggleLang } = useApp();
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const hasRole = (minRole) => {
    if (!user) return false;
    const userLevel = ROLE_LEVEL[user.role] ?? 0;
    const required = ROLE_LEVEL[minRole] ?? 1;
    return userLevel >= required;
  };

  return (
    <AdminAppContext.Provider value={{ lang, toggleLang, user, hasPermission, hasRole }}>
      {children}
    </AdminAppContext.Provider>
  );
}

export function useAdminApp() {
  const ctx = useContext(AdminAppContext);
  if (!ctx) throw new Error('useAdminApp must be used within AdminAppProvider');
  return ctx;
}
