import { useMemo, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { trackImpression, trackClick } from '../services/adService';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { toBanglaCalendar } from '../lib/dateUtils';
import { relativeTime } from '../lib/formatters';

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
  const { headerArticles = [], headerAd = null } = usePage().props;

  useEffect(() => {
    if (headerAd?.id) trackImpression(headerAd.id);
  }, [headerAd?.id]);

  const siteName = settings.site_name    || (lang === 'bn' ? 'নব দিগন্ত'            : 'Nobo Digonto');
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
      {/* Top gradient stripe */}
      <div className="hdr-stripe" aria-hidden="true" />

      <div className="hdr-wrap">

        {/* Logo / Masthead */}
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

        {/* Header ad takes priority; fall back to article strip */}
        {headerAd ? (
          <div className="hdr-ad">
            {headerAd.type === 'image' && headerAd.image && (
              <a href={headerAd.link || '#'} target="_blank" rel="noopener noreferrer" className="hdr-ad-link" onClick={() => trackClick(headerAd.id)}>
                <img src={headerAd.image} alt={headerAd.title || 'Advertisement'} className="hdr-ad-img" />
              </a>
            )}
            {(headerAd.type === 'html' || headerAd.type === 'google_ad') && headerAd.code && (
              <div className="hdr-ad-code" dangerouslySetInnerHTML={{ __html: headerAd.code }} />
            )}
          </div>
        ) : headerArticles.length > 0 && (
          <div className="hdr-art-strip">
            {headerArticles.map(a => (
              <div
                key={a.id}
                className="hdr-art-item"
                onClick={() => a.category?.slug && a.slug && onNavigate('article', { categorySlug: a.category.slug, articleSlug: a.slug })}
                role="button"
                tabIndex={0}
              >
                <div className="hdr-art-img">
                  {a.featured_image
                    ? <img src={a.featured_image} alt={a.title} />
                    : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
                </div>
                <div className="hdr-art-body">
                  {a.category && <span className="hdr-art-cat">{a.category.name}</span>}
                  <h5 className="hdr-art-h">{a.title}</h5>
                  <span className="hdr-art-time">{relativeTime(a.published_at, lang)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search bar */}
        <div className="hdr-right">
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

      {/* Bottom border */}
      <div className="hdr-border" aria-hidden="true" />
    </header>
  );
}
