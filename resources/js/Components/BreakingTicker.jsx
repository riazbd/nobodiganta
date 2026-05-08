import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function BreakingTicker() {
  const { lang, globalBreakingNews = [] } = useApp();
  const { onNavigate } = useNavigation();

  const [idx, setIdx]   = useState(0);
  const [show, setShow] = useState(true);
  const [paused, setPaused] = useState(false);
  const total = globalBreakingNews.length;

  const goTo = useCallback((next) => {
    setShow(false);
    setTimeout(() => {
      setIdx((next + total) % total);
      setShow(true);
    }, 180);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(() => goTo(idx + 1), 5000);
    return () => clearInterval(timer);
  }, [idx, paused, total, goTo]);

  if (!total) return null;

  const item = globalBreakingNews[idx];

  return (
    <div
      className="brk-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="brk-badge">
        {lang === 'bn' ? 'ব্রেকিং' : 'BREAKING'}
      </span>

      <div className="brk-body">
        <a
          className={`brk-text${show ? ' brk-visible' : ' brk-hidden'}`}
          onClick={() => item && onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug })}
          role="button"
          tabIndex={0}
        >
          {item?.title}
        </a>
      </div>

      {total > 1 && (
        <div className="brk-nav">
          <button className="brk-btn" onClick={() => goTo(idx - 1)} aria-label="Previous">‹</button>
          <span className="brk-count">{idx + 1} / {total}</span>
          <button className="brk-btn" onClick={() => goTo(idx + 1)} aria-label="Next">›</button>
        </div>
      )}
    </div>
  );
}
