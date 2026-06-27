import { useState, useEffect, useRef, useMemo } from 'react';
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

// Settings arrive as strings (or undefined) from the shared `settings` prop.
const asBool = (v, d) => (v === undefined || v === null || v === '') ? d : (v === true || v === 'true' || v === '1');
const asNum  = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };

export default function BreakingTicker() {
  const { lang, globalBreakingNews = [], settings = {} } = useApp();
  const { onNavigate } = useNavigation();

  // Admin-configurable cadence (with sensible fallbacks).
  const tickerEnabled = asBool(settings.breaking_ticker_enabled, true);
  const alertEnabled  = asBool(settings.breaking_alert_enabled, true);
  const alertSeconds  = asNum(settings.breaking_alert_seconds, 5);
  const alertCycles   = asNum(settings.breaking_alert_cycles, 1);
  const scrollSeconds = asNum(settings.breaking_scroll_seconds, 30);

  const [items, setItems] = useState(globalBreakingNews);
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState('scroll');     // 'alert' | 'scroll'
  const [alertIndex, setAlertIndex] = useState(0);
  const etagRef = useRef(null);

  // Signature of the current set — drives dismissal memory and phase resets.
  const sig = items.map(i => `${i.id}:${i.updated_at || ''}`).join('|');

  // Only PINNED items get the prominent alert/flash phase; everything else just
  // scrolls. (Severity stays purely a coloured label + ordering.)
  const alertItems = useMemo(
    () => items.filter(i => i.is_pinned),
    // sig captures the meaningful change to `items`
    [sig], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const alertActive = alertEnabled && alertItems.length > 0;

  // Live updates — poll the cheap, ETag-cached endpoint.
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const headers = {};
        if (etagRef.current) headers['If-None-Match'] = etagRef.current;
        // The API URL never starts with /en, so pass the edition explicitly —
        // otherwise the poll would always return Bangla titles on /en.
        const ed = window.location.pathname.startsWith('/en') ? 'en' : 'bn';
        const res = await fetch(`/api/breaking-news?edition=${ed}`, { headers });
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

  // Re-show the bar when content changes; (re)start the cadence from the top.
  useEffect(() => {
    setDismissed(sig !== '' && localStorage.getItem('brk_dismissed') === sig);
    setPhase(alertActive ? 'alert' : 'scroll');
    setAlertIndex(0);
  }, [sig, alertActive]);

  // ALERT phase: step through alert headlines, then hand off to the scroll phase.
  useEffect(() => {
    if (phase !== 'alert') return;
    if (!alertActive) { setPhase('scroll'); return; }
    setAlertIndex(0);
    let step = 0;
    const total = Math.max(1, alertItems.length * alertCycles);
    const id = setInterval(() => {
      step += 1;
      if (step >= total) { clearInterval(id); setPhase('scroll'); }
      else setAlertIndex(step % alertItems.length);
    }, alertSeconds * 1000);
    return () => clearInterval(id);
  }, [phase, alertActive, sig, alertSeconds, alertCycles]); // eslint-disable-line react-hooks/exhaustive-deps

  // SCROLL phase: after a spell, return to the alert phase (if there are any).
  useEffect(() => {
    if (phase !== 'scroll' || !alertActive) return;
    const id = setTimeout(() => setPhase('alert'), scrollSeconds * 1000);
    return () => clearTimeout(id);
  }, [phase, alertActive, sig, scrollSeconds]);

  if (!tickerEnabled || !items.length || dismissed) return null;

  const go = (item) => {
    if (item?.url) router.visit(item.url);
    else if (item?.category_slug && item?.slug) onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug });
  };

  const dismiss = () => { localStorage.setItem('brk_dismissed', sig); setDismissed(true); };

  const showingAlert = phase === 'alert' && alertActive;
  const current = showingAlert ? (alertItems[alertIndex] || alertItems[0]) : null;
  // Scroll phase: neutral "Headline" label, no severity tint, no flash.
  // Alert phase: the pinned item's severity label + gentle flash.
  const sevClass = showingAlert ? ` brk-sev-${current.severity}` : '';
  const label = showingAlert
    ? (SEV_LABEL[current.severity] || SEV_LABEL.breaking)
    : { bn: 'শিরোনাম', en: 'Headline' };
  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className={`brk-fixed${sevClass}${showingAlert ? ' brk-mode-alert' : ''}`} role="marquee" aria-label={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Breaking news'}>
      <div className="brk-label">{lang === 'bn' ? label.bn : label.en}</div>
      {showingAlert ? (
        <div className="brk-alert">
          <button className="brk-alert-text" onClick={() => go(current)} tabIndex={0}>{current?.title}</button>
        </div>
      ) : (
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
      )}
      <button className="brk-dismiss" onClick={dismiss} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}>×</button>
    </div>
  );
}
