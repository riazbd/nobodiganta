import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { trackImpression, trackClick } from '../services/adService';
import { getUniversalEmbedConfig } from '../lib/video';
import {
  mergePopupConfig, pageMatches, deviceMatches, capsAllow,
  readState, sessionShows, recordShow, recordDismiss, recordClick,
  bumpPageViews,
} from '../lib/popupFrequency';

/**
 * Site-wide pop-up advertisement.
 *
 * Driven entirely by the Ads system: it shows the active ad whose position is
 * 'popup' (shared as `popupAd` from HandleInertiaRequests). Appears immediately
 * on load and again on every page navigation; dismissible via the ×, the dark
 * backdrop, or Esc. Impressions/clicks report through the existing ad endpoints.
 */
export default function PopupAd() {
  const page = usePage();
  const popupAd = page.props.popupAd;
  const url = page.url; // changes on every Inertia navigation

  const [visible, setVisible] = useState(false);
  const tracked = useRef(false);

  const dismiss = () => {
    if (popupAd?.id) recordDismiss(popupAd.id);
    setVisible(false);
  };
  const onAdClick = () => {
    if (popupAd?.id) { recordClick(popupAd.id); trackClick(popupAd.id); }
  };

  // Evaluate gates + arm triggers on load and on every navigation.
  useEffect(() => {
    if (!popupAd?.id) return;
    setVisible(false);
    tracked.current = false;

    const cfg = mergePopupConfig(popupAd.config);
    const pv = bumpPageViews();

    // Gates — all must pass before arming.
    if (!pageMatches(cfg.targeting.pages, url)) return;
    if (!deviceMatches(cfg.targeting.devices)) return;
    if (cfg.triggers.min_page_views.enabled && pv < cfg.triggers.min_page_views.count) return;
    const state = { ...readState(popupAd.id), sessionShows: sessionShows(popupAd.id) };
    if (!capsAllow(cfg, state, Date.now())) return;

    // Triggers — OR / first-to-fire. Cleanup removes all listeners/timers.
    let done = false;
    const cleanups = [];
    const fire = () => {
      if (done) return;
      done = true;
      cleanups.forEach((fn) => fn());
      recordShow(popupAd.id);
      setVisible(true);
    };
    const t = cfg.triggers;
    const anyTrigger = t.delay.enabled || t.scroll.enabled || t.exit_intent.enabled;

    if (!anyTrigger || t.delay.enabled) {
      const id = setTimeout(fire, (anyTrigger ? t.delay.seconds : 0) * 1000);
      cleanups.push(() => clearTimeout(id));
    }
    if (t.scroll.enabled) {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0 && (window.scrollY / h) * 100 >= t.scroll.percent) fire();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }
    if (t.exit_intent.enabled) {
      const onLeave = (e) => { if (e.clientY <= 0) fire(); };
      document.addEventListener('mouseout', onLeave);
      cleanups.push(() => document.removeEventListener('mouseout', onLeave));
    }
    return () => cleanups.forEach((fn) => fn());
  }, [popupAd, url]);

  // Count one impression each time it's shown.
  useEffect(() => {
    if (visible && popupAd?.id && !tracked.current) {
      tracked.current = true;
      trackImpression(popupAd.id);
    }
  }, [visible, popupAd]);

  // Esc closes (counts as a dismiss).
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!popupAd || !visible) return null;

  return (
    <div className="popup-ad-overlay" onClick={dismiss} role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="popup-ad-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-ad-close" onClick={dismiss} aria-label="Close">×</button>
        <PopupAdContent ad={popupAd} onClick={onAdClick} />
      </div>
    </div>
  );
}

function PopupAdContent({ ad, onClick }) {
  if (ad.type === 'image') {
    return (
      <a
        href={ad.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="popup-ad-media"
      >
        <img src={ad.image} alt={ad.title || 'Advertisement'} />
      </a>
    );
  }

  if (ad.type === 'video') {
    const config = getUniversalEmbedConfig(ad.video_url);
    if (!config) return null;
    return (
      <div className="popup-ad-media">
        {config.type === 'iframe' ? (
          <iframe src={config.src} allow="autoplay; encrypted-media; fullscreen" allowFullScreen title={ad.title || 'Advertisement'} />
        ) : (
          <video src={config.src} poster={ad.image} controls autoPlay muted loop />
        )}
      </div>
    );
  }

  // html / google_ad / script / code
  return <AdCode code={ad.code} type={ad.type} />;
}

/** Injects HTML/script ad markup (scripts re-created so they execute). */
function AdCode({ code, type }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || !code) return;
    host.innerHTML = '';

    if (type === 'script') {
      const tmp = document.createElement('div');
      tmp.innerHTML = code;
      Array.from(tmp.childNodes).forEach((node) => {
        if (node.tagName === 'SCRIPT') {
          const script = document.createElement('script');
          Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
          script.textContent = node.textContent;
          host.appendChild(script);
        } else {
          host.appendChild(node.cloneNode(true));
        }
      });
    } else {
      host.innerHTML = code;
      host.querySelectorAll('script').forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, [code, type]);

  return <div ref={ref} className="popup-ad-code" />;
}
