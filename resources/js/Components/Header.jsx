import { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Header() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const { searchQuery, setSearchQuery, onSearch } = useSearch();
  const { auth } = usePage().props;
  const [searchOpen, setSearchOpen] = useState(false);

  const siteName = settings.site_name    || (lang === 'bn' ? 'নব দিগন্ত'            : 'Nobo Digonto');
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
      <div className="bbc-hdr">
        {/* Logo */}
        <div
          className="bbc-logo"
          onClick={() => onNavigate('home')}
          role="link"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNavigate('home')}
          aria-label={lang === 'bn' ? 'হোমপেজে যান' : 'Go to homepage'}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="bbc-logo-img" />
          ) : (
            <div className="bbc-logo-wordmark">
              <div className="bbc-logo-box">
                <span>{siteName.charAt(0)}</span>
              </div>
              <div className="bbc-logo-text">
                <span className="bbc-logo-name">{siteName}</span>
                <span className="bbc-logo-tag">{tagline}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="bbc-actions">
          {/* Edition toggle */}
          <div className="bbc-edition">
            <button
              className={`bbc-ed-btn${lang === 'bn' ? ' active' : ''}`}
              onClick={() => handleEdition('bn')}
              disabled={lang === 'bn'}
            >বাংলা</button>
            <button
              className={`bbc-ed-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => handleEdition('en')}
              disabled={lang === 'en'}
            >EN</button>
          </div>

          {/* Login / user */}
          {auth?.user ? (
            <button
              className="bbc-user-btn"
              onClick={() => router.visit('/admin')}
              aria-label="Admin panel"
            >
              <UserIcon />
              <span className="bbc-user-name">{auth.user.name?.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              className="bbc-sign-in"
              onClick={() => router.visit('/login')}
            >
              <UserIcon />
              <span>{lang === 'bn' ? 'সাইন ইন' : 'Sign in'}</span>
            </button>
          )}

          {/* Search toggle */}
          <button
            className="bbc-search-btn"
            onClick={() => setSearchOpen(o => !o)}
            aria-label={searchOpen ? 'Close search' : 'Search'}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
        </div>
      </div>

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="bbc-search-bar">
          <form onSubmit={handleSearchSubmit} className="bbc-search-form">
            <SearchIcon />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'সংবাদ, বিষয় বা ব্যক্তি খুঁজুন...' : 'Search news, topics or people...'}
              aria-label={lang === 'bn' ? 'অনুসন্ধান' : 'Search'}
            />
            <button type="submit">{lang === 'bn' ? 'খুঁজুন' : 'Search'}</button>
          </form>
        </div>
      )}
    </header>
  );
}
