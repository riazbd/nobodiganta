import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

const LogoDot = () => (
  <span className="brk-logo-dot" aria-hidden="true">
    <img src="/logo.png" alt="" />
  </span>
);

const SEV_LABEL = {
  just_in:  { bn: 'জাস্ট ইন', en: 'JUST IN' },
  breaking: { bn: 'ব্রেকিং',   en: 'BREAKING' },
  urgent:   { bn: 'জরুরি',     en: 'URGENT' },
  live:     { bn: 'লাইভ',      en: 'LIVE' },
};
const SEV_RANK = { just_in: 1, breaking: 2, live: 3, urgent: 4 };

export default function BreakingTicker() {
  const { lang, globalBreakingNews = [] } = useApp();
  const { onNavigate } = useNavigation();
  const [items, setItems] = useState(globalBreakingNews);
  const [dismissed, setDismissed] = useState(false);
  const etagRef = useRef(null);

  // Signature of the current set — used to remember dismissal until content changes.
  const sig = items.map(i => `${i.id}:${i.updated_at || ''}`).join('|');

  // Live updates — poll the cheap, ETag-cached endpoint.
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const headers = {};
        if (etagRef.current) headers['If-None-Match'] = etagRef.current;
        const res = await fetch('/api/breaking-news', { headers });
        if (res.status === 304) return;
        const et = res.headers.get('ETag');
        if (et) etagRef.current = et;
        const data = await res.json();
        if (alive && Array.isArray(data?.news)) setItems(data.news);
      } catch { /* ignore transient poll errors */ }
    };
    const id = setInterval(poll, 25000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Re-show the bar whenever the content changes (new signature).
  useEffect(() => {
    setDismissed(sig !== '' && localStorage.getItem('brk_dismissed') === sig);
  }, [sig]);

  if (!items.length || dismissed) return null;

  const topSev = items.reduce((acc, i) => ((SEV_RANK[i.severity] || 2) > (SEV_RANK[acc] || 0) ? i.severity : acc), 'just_in');
  const label = SEV_LABEL[topSev] || SEV_LABEL.breaking;

  const go = (item) => {
    if (item?.url) router.visit(item.url);
    else if (item?.category_slug && item?.slug) onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug });
  };

  const dismiss = () => { localStorage.setItem('brk_dismissed', sig); setDismissed(true); };

  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className={`brk-fixed brk-sev-${topSev}`} role="marquee" aria-label={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Breaking news'}>
      <div className="brk-label">{lang === 'bn' ? label.bn : label.en}</div>
      <div className="brk-track-wrap">
        <div className="brk-track">
          {loop.map((item, i) => (
            <span key={i} className="brk-item">
              <LogoDot />
              <button className="brk-link" onClick={() => go(item)} tabIndex={0}>
                {item?.title}
              </button>
            </span>
          ))}
        </div>
      </div>
      <button className="brk-dismiss" onClick={dismiss} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}>×</button>
    </div>
  );
}
