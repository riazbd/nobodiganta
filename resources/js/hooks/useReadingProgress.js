import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks reading progress as a percentage (0–100) based on scroll position
 * within a target element. Defaults to the full document.
 * @param {React.RefObject} [targetRef] - optional ref to the article element
 * @returns {number} progress 0–100
 */
export function useReadingProgress(targetRef = null) {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = targetRef?.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const totalHeight = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      setProgress(Math.round(pct));
    } else {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.round(pct));
    }
  }, [targetRef]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return progress;
}
