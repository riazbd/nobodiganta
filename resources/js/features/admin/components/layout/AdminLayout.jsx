import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ROLES } from '../../api/permissions';
import { Toast } from '../feedback/Toast';
import { useToast } from '../../hooks/useToast';

export default function AdminLayout({ children, currentPage, onNavigate, userRole }) {
  const { toast, showToast } = useToast();

  // Look up role info from the static ROLES list
  const roleInfo = ROLES.find(r => r.id === userRole) || null;

  return (
    <LanguageProvider>
      <div className={`flex min-h-screen`} style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans Bengali', 'Inter', sans-serif" }}>
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} roleInfo={roleInfo} userRole={userRole} />
        <div className="ml-60 flex-1 flex flex-col min-h-screen">
          <Topbar currentPage={currentPage} onNavigate={onNavigate} showToast={showToast} />
          <main className="p-6 flex-1" style={{ backgroundColor: 'var(--body-bg, #f0f2f8)' }}>
            {children}
          </main>
        </div>
        <Toast toast={toast} />
      </div>
    </LanguageProvider>
  );
}
