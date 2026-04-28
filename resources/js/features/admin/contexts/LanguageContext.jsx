import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { adminTranslations } from '../api/adminTranslations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('admin_lang') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('admin_lang', lang);
    document.documentElement.lang = lang === 'bn' ? 'bn-BD' : 'en';
  }, [lang]);

  const t = useCallback((key) => {
    return adminTranslations[lang]?.[key] || key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for components outside the provider
    return {
      lang: 'bn',
      t: (key) => key,
      toggleLanguage: () => {},
      setLang: () => {},
    };
  }
  return ctx;
}
