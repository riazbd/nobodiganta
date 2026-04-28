/**
 * PWA Install Prompt - Shows a banner/modal prompting users to install the app.
 * Only appears when:
 * 1. Browser supports PWA installation
 * 2. User hasn't dismissed the prompt
 * 3. App isn't already installed
 */
import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function InstallPrompt() {
  const { lang } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Check if user dismissed before
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        return; // Don't show again for 7 days
      }
    }

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        setIsVisible(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ User accepted PWA install');
      setIsVisible(false);
      localStorage.removeItem('pwa-install-dismissed');
    } else {
      console.log('❌ User declined PWA install');
      handleDismiss();
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || isDismissed) return null;

  const t = {
    bn: {
      title: '📱 অ্যাপ ইনস্টল করুন',
      description: 'দ্রুত ব্রেকিং নিউজ পেতে নবদিগন্ত অ্যাপ ইনস্টল করুন',
      benefits: [
        'তাৎক্ষণিক ব্রেকিং নিউজ নোটিফিকেশন',
        'অফলাইনে নিবন্ধ পড়ুন',
        'হোম স্ক্রিনে দ্রুত অ্যাক্সেস',
        'কম ডেটা ব্যবহার',
      ],
      install: 'ইনস্টল করুন',
      later: 'পরে করব',
    },
    en: {
      title: '📱 Install App',
      description: 'Install NoboDiganta app for faster access and breaking news alerts',
      benefits: [
        'Instant breaking news notifications',
        'Read articles offline',
        'Quick access from home screen',
        'Lower data usage',
      ],
      install: 'Install Now',
      later: 'Maybe Later',
    },
  };

  const content = t[lang];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{content.title}</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-700 mb-4">{content.description}</p>

          {/* Benefits */}
          <ul className="space-y-2 mb-5">
            {content.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {content.install}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {content.later}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
