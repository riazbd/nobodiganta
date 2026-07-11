import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { trackImpression, trackClick } from '../services/adService';
import { getUniversalEmbedConfig } from '../lib/video';

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

  // Show on initial load and re-show on every page navigation.
  useEffect(() => {
    if (popupAd) {
      tracked.current = false;
      setVisible(true);
    }
  }, [popupAd, url]);

  // Count one impression each time it's shown.
  useEffect(() => {
    if (visible && popupAd?.id && !tracked.current) {
      tracked.current = true;
      trackImpression(popupAd.id);
    }
  }, [visible, popupAd]);

  // Esc closes.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') setVisible(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!popupAd || !visible) return null;

  const close = () => setVisible(false);

  return (
    <div className="popup-ad-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="popup-ad-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-ad-close" onClick={close} aria-label="Close">×</button>
        <PopupAdContent ad={popupAd} onClick={() => trackClick(popupAd.id)} />
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
