import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { props } = usePage();
  // lang is always derived from the URL edition — no independent state needed
  const lang = props.edition || 'bn';
  const settings = props.settings || {};

  const [fontSize, setFontSize] = useState(() =>
    (typeof window !== 'undefined' && localStorage.getItem('pa-font-size')) || 'normal'
  );

  const cycleFontSize = useCallback(() => {
    setFontSize(prev => {
      const cycle = { small: 'normal', normal: 'large', large: 'small' };
      const next = cycle[prev] || 'normal';
      localStorage.setItem('pa-font-size', next);
      return next;
    });
  }, []);

  const setFontSizeExplicit = useCallback((size) => {
    setFontSize(size);
    localStorage.setItem('pa-font-size', size);
  }, []);

  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('pa-theme', next); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    lang,
    fontSize,
    cycleFontSize,
    setFontSize: setFontSizeExplicit,
    theme,
    toggleTheme,
    settings,
    globalBreakingNews: props.globalBreakingNews || [],
  }), [lang, fontSize, cycleFontSize, setFontSizeExplicit, theme, toggleTheme, settings, props.globalBreakingNews]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
