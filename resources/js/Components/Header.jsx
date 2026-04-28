import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { toBanglaCalendar } from '../lib/dateUtils';
import AdSlot from './ui/AdSlot';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);


export default function Header() {
  const { lang, settings } = useApp();
  const { onNavigate }     = useNavigation();
  const { searchQuery, setSearchQuery, onSearch } = useSearch();

  const siteName = settings.site_name    || (lang === 'bn' ? 'নব দিগন্ত'       : 'Nobo Digonto');
  const tagline  = settings.site_tagline || (lang === 'bn' ? 'সঠিক সংবাদ সবার আগে' : 'Trusted News First');
  const logoUrl  = settings.site_logo    || null;

  const today      = useMemo(() => new Date(), []);
  const banglaDate = useMemo(() => toBanglaCalendar(today, lang), [today, lang]);
  const gregDate   = useMemo(() => today.toLocaleDateString(
    lang === 'bn' ? 'bn-BD' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  ), [today, lang]);

  return (
    <header id="header">
      {/* ① Top gradient stripe */}
      <div className="hdr-stripe" aria-hidden="true" />

      <div className="hdr-wrap">

        {/* ② Logo / Masthead */}
        <div
          className="hdr-logo"
          onClick={() => onNavigate('home')}
          role="link"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNavigate('home')}
          aria-label={lang === 'bn' ? 'হোমপেজে যান' : 'Go to homepage'}
        >
          {logoUrl ? (
            <>
              <img src={logoUrl} alt={siteName} className="hdr-logo-img" />
              <div className="hdr-logo-daterow">{banglaDate}</div>
            </>
          ) : (
            <>
              <div className="hdr-logo-wordmark">
                <span className="hdr-logo-accent" aria-hidden="true" />
                <div className="hdr-logo-words">
                  <span className="hdr-logo-name">{siteName}</span>
                  <span className="hdr-logo-rule" aria-hidden="true" />
                  <span className="hdr-logo-tag">{tagline}</span>
                </div>
              </div>
              <div className="hdr-logo-date">{banglaDate}</div>
              <div className="hdr-logo-date hdr-logo-dategreg">{gregDate}</div>
            </>
          )}
        </div>

        {/* ③ Centre ad slot */}
        <div className="hdr-ad">
          <AdSlot size="leaderboard" position="header" />
        </div>

        {/* ④ Right: edition + search + subscribe */}
        <div className="hdr-right">

          {/* Search bar */}
          <div className="hdr-searchbar">
            <span className="hdr-search-ico" aria-hidden="true"><SearchIcon /></span>
            <input
              type="search"
              placeholder={lang === 'bn' ? 'সংবাদ, বিষয় বা ব্যক্তি খুঁজুন...' : 'Search news, topics or people...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              aria-label={lang === 'bn' ? 'সংবাদ অনুসন্ধান' : 'Search news'}
            />
            <button onClick={onSearch} className="hdr-search-btn" aria-label="Search">
              {lang === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </div>

        </div>
      </div>

      {/* ⑤ Bottom red border */}
      <div className="hdr-border" aria-hidden="true" />
    </header>
  );
}
