import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';

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

        {/* Left: hamburger + search */}
        <div className="bbc-left">
          <button className="bbc-icon-btn" onClick={() => window.dispatchEvent(new Event('open-nav-drawer'))} aria-label="Menu">
            <MenuIcon />
          </button>
          <button className="bbc-icon-btn" onClick={() => setSearchOpen(o => !o)} aria-label="Search">
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
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

        {/* Right: edition + sign in */}
        <div className="bbc-right">
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
