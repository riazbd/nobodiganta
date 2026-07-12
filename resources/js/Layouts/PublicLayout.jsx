import { Suspense } from 'react';
import Header from '../Components/Header';
import Navigation from '../Components/Navigation';
import BreakingTicker from '../Components/BreakingTicker';
import PopupAd from '../Components/PopupAd';
import Footer from '../Components/Footer';
import Toast from '../Components/Toast';
import BackToTop from '../Components/BackToTop';
import InstallPrompt from '../Components/ui/InstallPrompt';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

function PageFallback() {
  const { lang } = useApp();
  return (
    <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
      </div>
    </div>
  );
}

export default function PublicLayout({ children }) {
  const { lang } = useApp();
  const { toast } = useToast();

  return (
    <>
      <a href="#main-content" className="skip-nav-link">
        {lang === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
      </a>
      <Header />
      <Navigation />
      <main id="main-content" className="page-container">
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <BreakingTicker />
      <PopupAd />
      <Toast message={toast.message} visible={toast.visible} />
      <BackToTop />
      <InstallPrompt />
    </>
  );
}
