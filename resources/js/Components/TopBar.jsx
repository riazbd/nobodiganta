import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { router, usePage } from '@inertiajs/react';
import { findNextPrayer, formatCountdown, toBn, prayerLabel } from '../lib/prayerUtils';

import Icon from './Icon';

const FbIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

function useLiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useCountdown(epochMs) {
  const [display, setDisplay] = useState('--:--:--');
  useEffect(() => {
    if (!epochMs) return;
    const tick = () => setDisplay(formatCountdown(epochMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [epochMs]);
  return display;
}

export default function TopBar() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const { auth } = usePage().props;
  const clock = useLiveClock();
  const [prayer, setPrayer] = useState(null);

  useEffect(() => {
    fetch('/api/prayer?city=dhaka')
      .then(r => r.json())
      .then(json => setPrayer(json.data))
      .catch(() => {});
  }, []);

  const next = prayer ? findNextPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);

  const now = new Date();
  const gregDate = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const handleEdition = (ed) => {
    if (ed === lang) return;
    const path = window.location.pathname;
    const target = ed === 'en'
      ? (path === '/' ? '/en' : `/en${path}`)
      : (path.replace(/^\/en/, '') || '/');
    window.location.href = target;
  };

  const socials = [
    { key: 'fb', url: settings.facebook_url  || '#', Icon: FbIcon, label: 'Facebook' },
    { key: 'tw', url: settings.twitter_url   || '#', Icon: XIcon,  label: 'X (Twitter)' },
    { key: 'yt', url: settings.youtube_url   || '#', Icon: YtIcon, label: 'YouTube' },
    { key: 'ig', url: settings.instagram_url || '#', Icon: IgIcon, label: 'Instagram' },
  ];

  return (
    <div id="top-bar">
      <div className="tb-inner">

        <div className="tb-left">
          <span className="tb-clock">{lang === 'bn' ? toBn(clock) : clock}</span>
          <span className="tb-sep" />
          <span className="tb-date">{gregDate}</span>
          {prayer?.date?.hijri && (
            <>
              <span className="tb-sep tb-sep-md" />
              <span className="tb-hijri">{prayer.date.hijri}</span>
            </>
          )}
          {next && (
            <>
              <span className="tb-sep tb-sep-lg" />
              <span className="tb-prayer">
                <span className="tb-pulse" />
                {lang === 'bn' ? 'পরবর্তী:' : 'Next:'} {prayerLabel(next.name, lang)} {lang === 'bn' ? toBn(countdown) : countdown}
              </span>
            </>
          )}
        </div>

        <div className="tb-right">
          <nav className="tb-links" aria-label="Quick links">
            <a onClick={() => onNavigate('about')}>{lang === 'bn' ? 'পরিচিতি' : 'About'}</a>
            <a onClick={() => onNavigate('contact')}>{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</a>
            <a onClick={() => onNavigate('archive')}>{lang === 'bn' ? 'আর্কাইভ' : 'Archive'}</a>
          </nav>

          <div className="tb-divider-v" />

          <div className="tb-socials" role="list" aria-label="Social media">
            {socials.map(({ key, url, Icon, label }) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="tb-soc" role="listitem">
                <Icon />
              </a>
            ))}
          </div>

          <div className="tb-user" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {auth.user ? (
              <div 
                className="tb-auth-user" 
                onClick={() => router.visit('/admin')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <div className="tb-user-av" style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {auth.user.profile_photo_url ? (
                    <img src={auth.user.profile_photo_url} alt={auth.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e8001e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                      {auth.user.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="tb-user-name" style={{ fontSize: 11, color: '#ddd', fontWeight: 600 }}>{auth.user.name}</span>
              </div>
            ) : (
              <a 
                onClick={() => router.visit('/login')}
                style={{ fontSize: 11, color: '#bbb', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Icon name="user" size={12} />
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </a>
            )}

            <div className="tb-divider-v" style={{ height: 12, opacity: 0.2 }} />

            <div className="tb-edition" role="group" aria-label="Edition">
              <button
                className={`tb-ed-btn${lang === 'bn' ? ' active' : ''}`}
                onClick={() => handleEdition('bn')}
                disabled={lang === 'bn'}
                aria-pressed={lang === 'bn'}
              >বাংলা</button>
              <button
                className={`tb-ed-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => handleEdition('en')}
                disabled={lang === 'en'}
                aria-pressed={lang === 'en'}
              >EN</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
