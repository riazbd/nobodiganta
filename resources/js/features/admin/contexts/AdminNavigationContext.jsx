import { createContext, useContext } from 'react';

const AdminNavigationContext = createContext(null);

export function AdminNavigationProvider({ children, currentPage, onNavigate }) {
  return (
    <AdminNavigationContext.Provider value={{ currentPage, onNavigate }}>
      {children}
    </AdminNavigationContext.Provider>
  );
}

export function useAdminNavigation() {
  const ctx = useContext(AdminNavigationContext);
  if (!ctx) {
    // Fallback for pages that don't have the provider
    return { currentPage: 'dashboard', onNavigate: () => {} };
  }
  return ctx;
}
