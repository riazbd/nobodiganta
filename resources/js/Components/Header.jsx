import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { toBanglaCalendar, toHijriDate } from '../lib/dateUtils';

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FbIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const XIcon   = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const YtIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const IgIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;


function SocialSlider({ settings, lang }) {
  const [showIcons, setShowIcons] = useState(false);
  const [prevShow,  setPrevShow]  = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setShowIcons(v => {
        setPrevShow(v);
        return !v;
      });
    }, 5500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prevShow === null) return;
    const t = setTimeout(() => setPrevShow(null), 350);
    return () => clearTimeout(t);
  }, [prevShow]);

  const socials = [
    { url: settings.facebook_url,  Icon: FbIcon,  label: 'Facebook' },
    { url: settings.twitter_url,   Icon: XIcon,   label: 'X' },
    { url: settings.youtube_url,   Icon: YtIcon,  label: 'YouTube' },
    { url: settings.instagram_url, Icon: IgIcon,  label: 'Instagram' },
  ].filter(s => s.url);

  const renderSlide = (isIcons) => isIcons ? (
    <div className="bbc-soc-icons">
      {socials.map(({ url, Icon, label }) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="bbc-hdr-soc">
          <Icon />
        </a>
      ))}
    </div>
  ) : (
    <span className="bbc-soc-label">{lang === 'bn' ? 'ফলো করুন' : 'Follow us'}</span>
  );

  return (
    <div className="bbc-social-slider">
      {prevShow !== null && (
        <div key={`out-${prevShow}`} className="bbc-soc-slot bbc-soc-exit">
          {renderSlide(prevShow)}
        </div>
      )}
      <div key={`in-${showIcons}`} className="bbc-soc-slot bbc-soc-enter">
        {renderSlide(showIcons)}
      </div>
    </div>
  );
}

function RotatingDates({ items, font }) {
  const [idx, setIdx]         = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % items.length;
        setPrevIdx(i);
        return next;
      });
    }, 5500);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    if (prevIdx === null) return;
    const t = setTimeout(() => setPrevIdx(null), 600);
    return () => clearTimeout(t);
  }, [prevIdx]);

  const enterRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    if (enterRef.current && wrapRef.current) {
      wrapRef.current.style.width = enterRef.current.scrollWidth + 'px';
    }
  }, [idx]);

  return (
    <div ref={wrapRef} className="bbc-date-wrap" style={{ fontFamily: font }}>
      {prevIdx !== null && (
        <span key={`out-${prevIdx}`} className="bbc-date-slot bbc-date-exit">
          {items[prevIdx]}
        </span>
      )}
      <span key={`in-${idx}`} ref={enterRef} className="bbc-date-slot bbc-date-enter">
        {items[idx]}
      </span>
    </div>
  );
}

export default function Header() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const { searchQuery, setSearchQuery, onSearch } = useSearch();
  const { auth } = usePage().props;
  const [searchOpen, setSearchOpen] = useState(false);

  // const siteName = lang === 'bn'
  //   ? (settings.site_name    || 'নব দিগন্ত')
  //   : (settings.site_name_en || settings.site_name || 'Nobo Digonto');
  const siteName = lang === 'bn'
    ? 'নবদিগন্ত'
    : 'NOBODIGONTO';
  const tagline  = settings.site_tagline || (lang === 'bn' ? 'সঠিক সংবাদ সবার আগে' : 'Trusted News First');
  const logoUrl  = settings.site_logo    || null;

  // Scroll-aware header shrink + nav hide/show
  const lastY = useRef(0);
  const ticking = useRef(false);
  useEffect(() => {
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    if (!nav || !header) return;

    // Keep --header-h synced to header's real height during its transition
    // so the sticky nav follows smoothly. ResizeObserver fires off the main thread.
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height;
      if (h) document.documentElement.style.setProperty('--header-h', h + 'px');
    });
    ro.observe(header);

    let isShrunk = false;
    let isHidden = false;

    const update = () => {
      const y = window.scrollY;

      // Shrink header — wider hysteresis, only write when state actually changes
      if (!isShrunk && y > 100) {
        header.classList.add('header-scrolled');
        isShrunk = true;
      } else if (isShrunk && y < 15) {
        header.classList.remove('header-scrolled');
        isShrunk = false;
      }

      // Nav hide/show — asymmetric thresholds, idempotent writes
      const delta = y - lastY.current;
      if (delta <= -5 && isHidden) {
        nav.classList.remove('nav-scroll-hidden');
        isHidden = false;
        lastY.current = y;
      } else if (delta >= 15 && y > 150 && !isHidden) {
        nav.classList.add('nav-scroll-hidden');
        isHidden = true;
        lastY.current = y;
      } else if (Math.abs(delta) >= 5) {
        lastY.current = y;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(update);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  const now = new Date();
  const banglaDate = toBanglaCalendar(now, lang);
  const engDate = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const hijriDate = toHijriDate(now, lang);

  const handleEdition = (ed) => {
    if (ed === lang) return;
    const path = window.location.pathname;
    const target = ed === 'en'
      ? (path === '/' ? '/en' : `/en${path}`)
      : (path.replace(/^\/en/, '') || '/');
    window.location.href = target;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
    setSearchOpen(false);
  };

  return (
    <header id="header">
      {/* ── Main bar ─────────────────────────────── */}
      <div className="bbc-bar">

        {/* Left: hamburger + search + dates */}
        <div className="bbc-left">
          <button className="bbc-icon-btn" onClick={() => window.dispatchEvent(new Event('open-nav-drawer'))} aria-label="Menu">
            <MenuIcon />
          </button>
          <button className="bbc-icon-btn" onClick={() => setSearchOpen(o => !o)} aria-label="Search">
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
          <RotatingDates
            items={[banglaDate, engDate, hijriDate]}
            font={lang === 'bn' ? "'SolaimanLipi', sans-serif" : "'Playfair Display', serif"}
          />
        </div>

        {/* Centre: logo */}
        <div className="bbc-centre" onClick={() => onNavigate('home')} role="link" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onNavigate('home')}>
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="bbc-logo-img" />
          ) : (
            <div className="bbc-wordmark">
              <span className="bbc-site-name">{siteName}</span>
              <span className="bbc-tagline">{tagline}</span>
            </div>
          )}
        </div>

        {/* Right: socials + edition */}
        <div className="bbc-right">
          <SocialSlider settings={settings} lang={lang} />

          {/* Edition toggle — compact */}
          <div className="bbc-edition">
            <button
              className={`bbc-ed${lang === 'bn' ? ' on' : ''}`}
              onClick={() => handleEdition('bn')}
              disabled={lang === 'bn'}
            >বাংলা</button>
            <button
              className={`bbc-ed${lang === 'en' ? ' on' : ''}`}
              onClick={() => handleEdition('en')}
              disabled={lang === 'en'}
            >EN</button>
          </div>

        </div>
      </div>

      {/* ── Expandable search bar ─────────────────── */}
      {searchOpen && (
        <div className="bbc-search-drop">
          <form onSubmit={handleSearchSubmit} className="bbc-search-form">
            <SearchIcon />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'সংবাদ খুঁজুন...' : 'Search news...'}
            />
            <button type="submit">{lang === 'bn' ? 'খুঁজুন' : 'Search'}</button>
          </form>
        </div>
      )}
    </header>
  );
}
