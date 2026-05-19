import { t } from '../translations';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';

const MENU_ITEMS = [
  { key: 'location', page: 'location', bn: 'সারাদেশ', en: 'Bangladesh' },
  { key: 'stories',  page: 'stories',  bn: 'স্টোরিজ',  en: 'Stories'   },
  { key: 'gallery',  page: 'gallery',  bn: 'গ্যালারি',  en: 'Gallery'   },
  { key: 'video',    page: 'video',    bn: 'ভিডিও',    en: 'Video'     },
];

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Navigation() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const { searchQuery, setSearchQuery, onSearch } = useSearch();

  const [categories,   setCategories]  = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [drawerOpen,   setDrawerOpen]  = useState(false);
  const [hoveredCat,   setHoveredCat]  = useState(null);
  const [expandedCat,  setExpandedCat] = useState(null);

  const measureRef = useRef(null);
  const navRef     = useRef(null);
  const hoverTimer = useRef(null);
  const searchRef  = useRef(null);

  // Fetch categories
  useEffect(() => {
    fetch(`/api/categories?edition=${lang}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setCategories(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  // Listen for hamburger click from Header
  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener('open-nav-drawer', handler);
    return () => window.removeEventListener('open-nav-drawer', handler);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [lang]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Focus search when drawer opens
  useEffect(() => {
    if (drawerOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);
  const go = (page, sub) => { closeDrawer(); if (sub) onNavigate(page, sub); else onNavigate(page); };

  const handleEdition = (ed) => {
    if (ed === lang) return;
    const path = window.location.pathname;
    const target = ed === 'en'
      ? (path === '/' ? '/en' : `/en${path}`)
      : (path.replace(/^\/en/, '') || '/');
    window.location.href = target;
  };

  // Desktop hover dropdown
  const [visibleCount, setVisibleCount] = useState(99);
  const calculateVisible = useCallback(() => {
    const mc  = measureRef.current;
    const nav = navRef.current;
    if (!mc || !nav) return;
    const items = mc.querySelectorAll('.nav-measure-item');
    if (!items.length) return;
    const available = nav.offsetWidth;
    let total = 0, count = items.length;
    for (let i = 0; i < items.length; i++) {
      total += items[i].offsetWidth;
      if (total > available) { count = i; break; }
    }
    setVisibleCount(Math.max(2, count));
  }, []);

  useEffect(() => {
    const t1 = setTimeout(calculateVisible, 100);
    const t2 = setTimeout(calculateVisible, 300);
    window.addEventListener('resize', calculateVisible);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', calculateVisible); };
  }, [calculateVisible, categories]);

  const handleCatEnter = slug => { clearTimeout(hoverTimer.current); setHoveredCat(slug); };
  const handleCatLeave = ()   => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };
  const handleDropEnter = ()  => clearTimeout(hoverTimer.current);
  const handleDropLeave = ()  => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };

  const renderDropdownItems = (items, depth) => items.map(child => (
    <span key={child.slug}>
      <a className="nav-sub-link"
        style={depth > 0 ? { paddingLeft: `${20 + depth * 14}px`, opacity: 0.85 } : undefined}
        onClick={() => { setHoveredCat(null); onNavigate('cat', child.slug); }}
        role="menuitem" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onNavigate('cat', child.slug)}
      >
        {depth > 0 && <span style={{ marginRight: 4, opacity: 0.4 }}>↳</span>}
        {lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn)}
      </a>
      {child.children?.length > 0 && renderDropdownItems(child.children, depth + 1)}
    </span>
  ));

  const renderDrawerSubs = (items, depth = 0) => items.map(child => (
    <span key={child.slug}>
      <button className="drw-sub" style={{ paddingLeft: 16 + depth * 16 }}
        onClick={() => go('cat', child.slug)}>
        {lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn)}
      </button>
      {child.children?.length > 0 && renderDrawerSubs(child.children, depth + 1)}
    </span>
  ));

  const handleDrawerSearch = e => {
    e.preventDefault();
    onSearch();
    closeDrawer();
  };

  if (loading) {
    return (
      <nav id="nav" aria-label={lang === 'bn' ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
        <div className="nav-inner">
          <div style={{ display: 'flex', gap: 8 }}>
            {[55, 72, 68, 80, 60, 75].map(w => (
              <div key={w} style={{ width: w, height: 14, background: '#ebebeb', borderRadius: 3, flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ── Desktop nav bar ───────────────────────────────────── */}
      <nav id="nav" aria-label={lang === 'bn' ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
        {/* Measurement ghost */}
        <div className="nav-measure" ref={measureRef} aria-hidden="true">
          <a className="nav-measure-item nav-home">{t('nav.home', lang)}</a>
          {categories.map(cat => (
            <a key={cat.slug + '-m'} className="nav-measure-item">
              {lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}
            </a>
          ))}
        </div>

        <div className="nav-inner" ref={navRef}>
          {/* Home */}
          <a className="nav-item nav-home" onClick={() => onNavigate('home')} role="menuitem" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate('home')}>
            {t('nav.home', lang)}
          </a>

          {/* Categories */}
          {categories.map((cat, i) => {
            const hasChildren = cat.children?.length > 0;
            const isHovered   = hoveredCat === cat.slug;
            const hidden      = i >= visibleCount - 1;
            return (
              <div key={cat.slug} className={`nav-cat-wrap${hidden ? ' nav-hidden' : ''}`}
                onMouseEnter={() => !hidden && hasChildren && handleCatEnter(cat.slug)}
                onMouseLeave={handleCatLeave}>
                <a className={`nav-item${hasChildren ? ' nav-has-sub' : ''}`}
                  onClick={() => onNavigate('cat', cat.slug)}
                  role="menuitem" tabIndex={hidden ? -1 : 0}
                  onKeyDown={e => e.key === 'Enter' && onNavigate('cat', cat.slug)}>
                  {lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}
                  {hasChildren && (
                    <svg className="nav-arrow" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </a>
                {hasChildren && isHovered && (
                  <div className="nav-sub-dropdown" role="menu"
                    onMouseEnter={handleDropEnter} onMouseLeave={handleDropLeave}>
                    {/* <a className="nav-sub-parent"
                      onClick={() => { setHoveredCat(null); onNavigate('cat', cat.slug); }}
                      role="menuitem" tabIndex={0}>
                      {lang === 'bn' ? `সব ${cat.name_bn}` : `All ${cat.name_en || cat.name_bn}`}
                    </a>
                    <div className="nav-sub-divider" /> */}
                    {renderDropdownItems(cat.children, 0)}
                  </div>
                )}
              </div>
            );
          })}

          {/* MENU_ITEMS in nav (visible if space, else in drawer) */}
          {MENU_ITEMS.map((item, i) => {
            const hidden = categories.length + i >= visibleCount - 1;
            return (
              <a key={item.key} className={`nav-item${hidden ? ' nav-hidden' : ''}`}
                onClick={() => onNavigate(item.page)} role="menuitem" tabIndex={hidden ? -1 : 0}>
                {lang === 'bn' ? item.bn : item.en}
              </a>
            );
          })}
        </div>
      </nav>

      {/* ── BBC-style side drawer ─────────────────────────────── */}
      {drawerOpen && (
        <div className="drw-overlay" onClick={closeDrawer} aria-hidden="true" />
      )}

      <div className={`drw${drawerOpen ? ' drw-open' : ''}`} role="dialog" aria-modal="true"
        aria-label={lang === 'bn' ? 'নেভিগেশন মেনু' : 'Navigation menu'}>

        {/* Close button */}
        <button className="drw-close" onClick={closeDrawer} aria-label="Close">
          <CloseIcon />
        </button>

        {/* Search */}
        <form className="drw-search" onSubmit={handleDrawerSearch}>
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'সংবাদ, বিষয় এবং আরও...' : 'Search news, topics and more'}
          />
          <button type="submit" aria-label="Search"><SearchIcon /></button>
        </form>

        {/* Scrollable body */}
        <div className="drw-body">
          {/* Home */}
          <button className="drw-item drw-home" onClick={() => go('home')}>
            {lang === 'bn' ? 'হোম' : 'Home'}
          </button>

          {/* All categories */}
          {categories.map(cat => {
            const hasChildren = cat.children?.length > 0;
            const isExpanded  = expandedCat === cat.slug;
            return (
              <div key={cat.slug}>
                <button className="drw-item"
                  onClick={() => {
                    if (hasChildren) setExpandedCat(isExpanded ? null : cat.slug);
                    else go('cat', cat.slug);
                  }}>
                  <span>{lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}</span>
                  {hasChildren && <ChevronDown open={isExpanded} />}
                </button>
                {hasChildren && isExpanded && (
                  <div className="drw-subs">
                    <button className="drw-sub drw-sub-all" onClick={() => go('cat', cat.slug)}>
                      {lang === 'bn' ? `সব ${cat.name_bn}` : `All ${cat.name_en || cat.name_bn}`}
                    </button>
                    {renderDrawerSubs(cat.children)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick links */}
          <div className="drw-divider" />
          {MENU_ITEMS.map(item => (
            <button key={item.key} className="drw-item" onClick={() => go(item.page)}>
              {lang === 'bn' ? item.bn : item.en}
            </button>
          ))}

          {/* Edition toggle */}
          <div className="drw-divider" />
          <div className="drw-edition">
            <button
              className={`drw-ed-btn${lang === 'bn' ? ' on' : ''}`}
              onClick={() => handleEdition('bn')}
              disabled={lang === 'bn'}
            >বাংলা</button>
            <button
              className={`drw-ed-btn${lang === 'en' ? ' on' : ''}`}
              onClick={() => handleEdition('en')}
              disabled={lang === 'en'}
            >English</button>
          </div>
        </div>
      </div>
    </>
  );
}
