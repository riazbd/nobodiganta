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

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const value = useMemo(() => ({
    lang,
    fontSize,
    cycleFontSize,
    setFontSize: setFontSizeExplicit,
    settings,
    globalBreakingNews: props.globalBreakingNews || [],
  }), [lang, fontSize, cycleFontSize, setFontSizeExplicit, settings, props.globalBreakingNews]);

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
