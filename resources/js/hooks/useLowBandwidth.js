import { useState, useCallback } from 'react';

export function useLowBandwidth() {
  const [lowBandwidth, setLowBandwidth] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('pa-low-bandwidth');
    if (saved !== null) return saved === 'true';
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      return conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
    }
    return false;
  });

  const toggle = useCallback(() => {
    setLowBandwidth(prev => {
      const next = !prev;
      localStorage.setItem('pa-low-bandwidth', String(next));
      return next;
    });
  }, []);

  return { lowBandwidth, toggle };
}
