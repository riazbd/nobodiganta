import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
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

  const siteName = settings.site_name    || (lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto');
  const tagline  = settings.site_tagline || (lang === 'bn' ? 'সঠিক সংবাদ সবার আগে' : 'Trusted News First');
  const logoUrl  = settings.site_logo    || null;

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
              <div className="bbc-blocks">
                {siteName.split('').slice(0, 3).map((ch, i) => (
                  <div key={i} className="bbc-block">{ch}</div>
                ))}
              </div>
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

          {auth?.user ? (
            <button className="bbc-register" onClick={() => router.visit('/admin')}>
              {auth.user.name?.split(' ')[0]}
            </button>
          ) : (
            <>
              <button className="bbc-register" onClick={() => router.visit('/register')}>
                {lang === 'bn' ? 'নিবন্ধন' : 'Register'}
              </button>
              <button className="bbc-signin" onClick={() => router.visit('/login')}>
                {lang === 'bn' ? 'সাইন ইন' : 'Sign In'}
              </button>
            </>
          )}
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
