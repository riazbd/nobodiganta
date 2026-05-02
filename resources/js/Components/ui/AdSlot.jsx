/**
 * Ad slot wrapper with internal Ad system and Google AdSense integration.
 * Reserves height before ad loads — prevents CLS.
 */
import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { getAds } from '../../services/adService';
import { getUniversalEmbedConfig } from '../../lib/video';

const SLOT_SIZES = {
  leaderboard:   { width: '100%', height: 90, maxWidth: 728 },
  mrec:          { width: 300, height: 250 },
  'half-page':   { width: 300, height: 600 },
  'mobile-banner': { width: '100%', height: 50, maxWidth: 320 },
  billboard:     { width: '100%', height: 300, maxWidth: 970 },
  'in-article':  { width: 300, height: 250 },
};

export default function AdSlot({ size = 'mrec', position, slotId, className = '', label }) {
  const adRef = useRef(null);
  const { props } = usePage();
  const [internalAd, setInternalAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const dims = SLOT_SIZES[size] || SLOT_SIZES.mrec;

  useEffect(() => {
    // Check if ads were passed in page props
    if (position && props.ads && props.ads[position]) {
      const adsAtPos = props.ads[position];
      const picked = adsAtPos[Math.floor(Math.random() * adsAtPos.length)];
      setInternalAd(picked);
      setLoading(false);
      return;
    }

    async function loadInternalAd() {
      if (position) {
        const res = await getAds(position);
        if (res.data && res.data.length > 0) {
          const picked = res.data[Math.floor(Math.random() * res.data.length)];
          setInternalAd(picked);
        }
      }
      setLoading(false);
    }

    loadInternalAd();
  }, [position, props.ads]);

  useEffect(() => {
    // Push ad to AdSense queue if no internal ad and script is loaded
    if (!internalAd && window.adsbygoogle && adRef.current && slotId) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [internalAd, slotId]);

  const containerStyle = {
    width: dims.width,
    minHeight: dims.height,
    maxWidth: dims.maxWidth,
    margin: '0 auto',
    background: internalAd ? 'transparent' : '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb',
    fontSize: 11,
    letterSpacing: 1,
    position: 'relative',
    overflow: 'hidden'
  };

  if (internalAd) {
    if (internalAd.type === 'image') {
      return (
        <div className={`promo-banner promo-banner--${size} ${className}`} style={containerStyle}>
          <a href={internalAd.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
            <img 
              src={internalAd.image} 
              alt={internalAd.title} 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </a>
          <div style={{ position: 'absolute', top: 2, right: 5, fontSize: 9, color: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }}>PROMO</div>
        </div>
      );
    }
    if (internalAd.type === 'video') {
      const config = getUniversalEmbedConfig(internalAd.video_url, internalAd.video_provider);
      
      if (!config) return null;

      return (
        <div className={`promo-banner promo-banner--${size} ${className}`} style={containerStyle}>
          {config.type === 'iframe' ? (
            <iframe
              src={config.src}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video 
              src={config.src} 
              poster={internalAd.image}
              controls 
              muted 
              autoPlay 
              loop
              className="w-full h-full object-cover"
            />
          )}
          <div style={{ position: 'absolute', top: 2, right: 5, fontSize: 9, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 2, pointerEvents: 'none', zIndex: 10 }}>VIDEO PROMO</div>
        </div>
      );
    }
    
    if (internalAd.type === 'html' || internalAd.type === 'google_ad' || internalAd.type === 'code' || internalAd.type === 'script') {
      return (
        <div 
          className={`promo-banner promo-banner--${size} ${className}`} 
          style={containerStyle}
        >
           <AdCodeRenderer code={internalAd.code} type={internalAd.type} />
        </div>
      );
    }
  }

  // Fallback to AdSense or placeholder
  return (
    <div
      ref={adRef}
      className={`promo-banner promo-banner--${size} ${className}`}
      style={containerStyle}
      aria-label="Promotion"
    >
      {slotId ? (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: dims.width === '100%' ? '100%' : dims.width,
            height: dims.height,
            maxWidth: dims.maxWidth,
          }}
          data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}
          data-ad-slot={slotId}
          data-ad-format={size === 'leaderboard' || size === 'billboard' ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="false"
        />
      ) : (
        <span>{label || 'ADVERTISEMENT'}</span>
      )}
    </div>
  );
}

function AdCodeRenderer({ code, type }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    if (type === 'script') {
      // Create a temporary element to parse the HTML
      const div = document.createElement('div');
      div.innerHTML = code;
      
      // Move elements to the container
      Array.from(div.childNodes).forEach(node => {
        if (node.tagName === 'SCRIPT') {
          const script = document.createElement('script');
          Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
          script.textContent = node.textContent;
          containerRef.current.appendChild(script);
        } else {
          containerRef.current.appendChild(node.cloneNode(true));
        }
      });
    } else {
      containerRef.current.innerHTML = code;
      
      // If it's a google ad or general html that might contain scripts, 
      // we might need to manually trigger them if they are not external files
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, [code, type]);

  return <div ref={containerRef} className="w-full h-full" />;
}
