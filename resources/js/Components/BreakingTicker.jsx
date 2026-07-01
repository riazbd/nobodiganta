import { useState, useEffect, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

const LogoDot = () => (
  <span className="brk-logo-dot" aria-hidden="true">
    <img src="/logo.png" alt="" />
  </span>
);

// Settings arrive as strings (or undefined) from the shared `settings` prop.
const asBool = (v, d) => (v === undefined || v === null || v === '') ? d : (v === true || v === 'true' || v === '1');
const asNum  = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };

// How long the centered "BREAKING NEWS" bumper flashes before the headline.
const BUMPER_MS = 2000;

/**
 * Breaking bar at the bottom of the site.
 *
 * Two independent stacked bars:
 *  - SCROLL (always on): the marquee of breaking headlines.
 *  - ALERT (above the scroll): a TV-style banner that flashes IN for a few
 *    seconds, then hides for an interval, then reappears — repeating all day
 *    while there are pinned items. It never sits there permanently.
 *
 * Alert content = the PINNED breaking items. Everything else only scrolls.
 */
export default function BreakingTicker() {
  const { lang, globalBreakingNews = [], settings = {} } = useApp();
  const { onNavigate } = useNavigation();

  // Admin-configurable cadence (with sensible fallbacks).
  const tickerEnabled    = asBool(settings.breaking_ticker_enabled, true);
  const alertEnabled     = asBool(settings.breaking_alert_enabled, true);
  const alertSeconds     = asNum(settings.breaking_alert_seconds, 8);       // visible time per headline
  const alertCycles      = asNum(settings.breaking_alert_cycles, 1);        // times to loop the pinned set per appearance
  const alertIntervalMin = asNum(settings.breaking_alert_interval_minutes, 5); // gap (minutes) between appearances

  const [items, setItems] = useState(globalBreakingNews);
  const [dismissed, setDismissed] = useState(false);            // scroll ticker dismissed (alert can't be dismissed)
  const [alertVisible, setAlertVisible] = useState(false);      // alert currently flashed in?
  const [alertIndex, setAlertIndex] = useState(0);
  const [alertMode, setAlertMode] = useState('bumper');         // 'bumper' (BREAKING NEWS) | 'headline'
  const etagRef = useRef(null);

  // Signature of the current set — drives dismissal memory and cadence resets.
  const sig = items.map(i => `${i.id}:${i.updated_at || ''}`).join('|');

  // Only PINNED items get the prominent alert banner; everything else scrolls.
  const alertItems = useMemo(
    () => items.filter(i => i.is_pinned),
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

  // Dismissal is in-memory only — closing the ticker hides it for the current
  // view, but a hard reload brings it back. New/updated breaking content (sig
  // change) also clears an earlier dismissal so fresh news always re-shows.
  useEffect(() => {
    setDismissed(false);
  }, [sig]);

  // Alert cadence: each appearance alternates the "BREAKING NEWS" bumper with
  // the real headline (short bumper, longer headline), loops the pinned set
  // `alertCycles` times, then hides for the interval and repeats. Single
  // self-rescheduling timer, torn down cleanly on change.
  useEffect(() => {
    if (!alertActive) { setAlertVisible(false); return; }

    let cancelled = false;
    let timer = null;

    const runWindow = () => {
      if (cancelled) return;
      setAlertVisible(true);

      // Build one appearance: bumper, headline[0], bumper, headline[1], … × cycles.
      const seq = [];
      for (let c = 0; c < Math.max(1, alertCycles); c++) {
        for (let i = 0; i < alertItems.length; i++) {
          seq.push({ mode: 'bumper',   index: i, ms: BUMPER_MS });
          seq.push({ mode: 'headline', index: i, ms: alertSeconds * 1000 });
        }
      }

      let s = 0;
      const tick = () => {
        if (cancelled) return;
        if (s >= seq.length) {
          setAlertVisible(false);
          timer = setTimeout(runWindow, alertIntervalMin * 60 * 1000);
          return;
        }
        const cur = seq[s++];
        setAlertMode(cur.mode);
        setAlertIndex(cur.index);
        timer = setTimeout(tick, cur.ms);
      };
      tick();
    };

    runWindow();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [alertActive, sig, alertSeconds, alertCycles, alertIntervalMin]); // eslint-disable-line react-hooks/exhaustive-deps

  const showTicker = tickerEnabled && items.length > 0 && !dismissed;
  const showAlert  = alertActive && alertVisible;

  if (!showTicker && !showAlert) return null;

  const go = (item) => {
    if (item?.url) router.visit(item.url);
    else if (item?.category_slug && item?.slug) onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug });
  };

  const dismissTicker = () => setDismissed(true);   // scroll ticker × — hides until reload / new content

  const current = alertItems[alertIndex] || alertItems[0];
  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <div className="brk-stack">
      {showAlert && current && (
        <div
          className={`brk-alert-bar brk-alert-${current.severity || 'breaking'}`}
          role="alert"
          aria-label={lang === 'bn' ? 'জরুরি সংবাদ' : 'News alert'}
        >
          <div className="brk-alert-headline">
            {alertMode === 'bumper' ? (
              <span className="brk-alert-bumper">
                {lang === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING NEWS'}
              </span>
            ) : (
              <button className="brk-alert-text" onClick={() => go(current)} tabIndex={0}>
                {current?.title}
              </button>
            )}
          </div>
        </div>
      )}

      {showTicker && (
        <div className="brk-fixed" role="marquee" aria-label={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Breaking news'}>
          <div className="brk-label">{lang === 'bn' ? 'শিরোনাম' : 'Headline'}</div>
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
          <button className="brk-dismiss" onClick={dismissTicker} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}>×</button>
        </div>
      )}
    </div>
  );
}
