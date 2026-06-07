import { t } from '../translations';
import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { ROUTES } from '../lib/routes';

const MENU_ITEMS = [
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
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const { searchQuery, setSearchQuery, onSearch } = useSearch();

  const [categories,   setCategories]  = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [drawerOpen,   setDrawerOpen]  = useState(false);
  const [hoveredCat,   setHoveredCat]  = useState(null);
  const [expandedCat,  setExpandedCat] = useState({});

  const measureRef  = useRef(null);
  const navRef      = useRef(null);
  const hoverTimer  = useRef(null);
  const moreTimer   = useRef(null);
  const searchRef   = useRef(null);

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

  // Resolve click handler for any category, aware of saradesh hierarchy
  const makeCatNav = (cat, ancestors = []) => {
    const underLocation = cat.slug === 'saradesh' || ancestors.some(a => a.slug === 'saradesh');
    if (!underLocation) return () => go('cat', cat.slug);
    if (cat.slug === 'saradesh') return () => go('location');

    const divCat  = ancestors.find(a => a.slug.startsWith('division-')) ?? (cat.slug.startsWith('division-') ? cat : null);
    const distCat = ancestors.find(a => a.slug.startsWith('district-')) ?? (cat.slug.startsWith('district-') ? cat : null);
    const uzSlug  = cat.slug.startsWith('upazila-') ? cat.slug.replace('upazila-', '') : null;
    const divSlug  = divCat?.slug.replace('division-', '');
    const distSlug = distCat?.slug.replace('district-', '');

    const visit = url => () => { closeDrawer(); window.scrollTo({ top: 0 }); router.visit(url); };
    if (uzSlug  && divSlug && distSlug) return visit(ROUTES.locationUpazila(divSlug, distSlug, uzSlug, lang));
    if (distSlug && divSlug)            return visit(ROUTES.locationDist(divSlug, distSlug, lang));
    if (divSlug)                        return visit(ROUTES.locationDiv(divSlug, lang));
    return () => go('location');
  };

  const handleEdition = (ed) => {
    if (ed === lang) return;
    const path = window.location.pathname;
    const target = ed === 'en'
      ? (path === '/' ? '/en' : `/en${path}`)
      : (path.replace(/^\/en/, '') || '/');
    window.location.href = target;
  };

  // "আরও / More" overflow dropdown
  const [moreOpen, setMoreOpen] = useState(false);
  const handleMoreEnter = () => { clearTimeout(moreTimer.current); setMoreOpen(true); };
  const handleMoreLeave = () => { moreTimer.current = setTimeout(() => setMoreOpen(false), 130); };

  // Responsive width measurement (used when nav_max_visible = 0)
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

  // Desktop nav: only show_in_nav=true categories; drawer uses full `categories`
  const navCats = categories.filter(c => c.show_in_nav !== false);

  // Split into visible + overflow based on admin setting or DOM width
  const navMaxVisible = parseInt(settings?.nav_max_visible) || 0;
  const autoMax       = Math.max(1, visibleCount - 1);
  const effectiveMax  = navMaxVisible > 0 ? Math.min(navMaxVisible, autoMax) : autoMax;
  const visibleCats   = navCats.slice(0, effectiveMax);
  const overflowCats  = navCats.slice(effectiveMax);
  const moreLabel     = lang === 'bn'
    ? (settings?.nav_more_label_bn || 'আরও')
    : (settings?.nav_more_label_en || 'More');

  const handleCatEnter = slug => { clearTimeout(hoverTimer.current); setHoveredCat(slug); };
  const handleCatLeave = ()   => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };
  const handleDropEnter = ()  => clearTimeout(hoverTimer.current);
  const handleDropLeave = ()  => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };

  const renderDropdownItems = (items, depth, ancestors = []) => {
    const useGrid = depth === 0 && items.length > 6 && !items.some(i => i.children?.length > 0);
    const cols = useGrid ? (items.length > 10 ? 3 : 2) : 1;
    return (
      <div className={`nav-sub-items${useGrid ? ' nav-sub-grid' : ''}`} style={useGrid ? { columnCount: cols } : {}}>
        {items.map(child => {
          const nav = makeCatNav(child, ancestors);
          const hasSub = child.children?.length > 0 && depth < 2;
          const name = lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn);
          if (hasSub) {
            return (
              <div key={child.slug} className="nav-sub-wrap">
                <a className="nav-sub-link nav-sub-has-sub"
                  onClick={() => { setHoveredCat(null); nav(); }}
                  role="menuitem" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && (setHoveredCat(null), nav())}
                >
                  {name}
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: 4 }}>
                    <polyline points="4 2 8 6 4 10"/>
                  </svg>
                </a>
                <div className="nav-sub-sub">
                  {renderDropdownItems(child.children, depth + 1, [...ancestors, child])}
                </div>
              </div>
            );
          }
          return (
            <a key={child.slug} className="nav-sub-link"
              onClick={() => { setHoveredCat(null); nav(); }}
              role="menuitem" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && (setHoveredCat(null), nav())}
            >
              {name}
            </a>
          );
        })}
      </div>
    );
  };

  const toggleExpanded = key => setExpandedCat(prev => ({ ...prev, [key]: !prev[key] }));

  const renderDrawerSubs = (items, depth = 0, ancestors = []) => items.map(child => {
    const hasChildren = child.children?.length > 0;
    const nav = makeCatNav(child, ancestors);
    const childKey = `drw-sub-${child.slug}`;
    const isExpanded = !!expandedCat[childKey];
    return (
      <div key={child.slug}>
        <button
          className="drw-sub"
          style={{ paddingLeft: 16 + depth * 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={() => {
            if (hasChildren) toggleExpanded(childKey);
            else nav();
          }}
        >
          <span>{lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn)}</span>
          {hasChildren && <ChevronDown open={isExpanded} />}
        </button>
        {hasChildren && isExpanded && (
          <div>
            <button className="drw-sub drw-sub-all" style={{ paddingLeft: 16 + (depth + 1) * 16 }} onClick={nav}>
              {lang === 'bn' ? `সব ${child.name_bn}` : `All ${child.name_en || child.name_bn}`}
            </button>
            {renderDrawerSubs(child.children, depth + 1, [...ancestors, child])}
          </div>
        )}
      </div>
    );
  });

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
        {/* Measurement ghost — measures all items to compute auto width cap */}
        <div className="nav-measure" ref={measureRef} aria-hidden="true">
          <a className="nav-measure-item nav-home">{t('nav.home', lang)}</a>
          {navCats.map(cat => (
            <a key={cat.slug + '-m'} className="nav-measure-item">
              {lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}
            </a>
          ))}
          <a className="nav-measure-item">{moreLabel}</a>
          {MENU_ITEMS.map(item => (
            <a key={item.key + '-m'} className="nav-measure-item">
              {lang === 'bn' ? item.bn : item.en}
            </a>
          ))}
        </div>

        <div className="nav-inner" ref={navRef}>
          {/* Home */}
          <a className="nav-item nav-home" onClick={() => onNavigate('home')} role="menuitem" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate('home')}>
            {t('nav.home', lang)}
          </a>

          {/* Visible categories */}
          {visibleCats.map(cat => {
            const hasChildren = cat.children?.length > 0;
            const isHovered   = hoveredCat === cat.slug;
            const nav         = makeCatNav(cat);
            return (
              <div key={cat.slug} className="nav-cat-wrap"
                onMouseEnter={() => hasChildren && handleCatEnter(cat.slug)}
                onMouseLeave={handleCatLeave}>
                <a className={`nav-item${hasChildren ? ' nav-has-sub' : ''}`}
                  onClick={nav} role="menuitem" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && nav()}>
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
                    {renderDropdownItems(cat.children, 0, [cat])}
                  </div>
                )}
              </div>
            );
          })}

          {/* MENU_ITEMS (Stories, Gallery, Video) */}
          {MENU_ITEMS.map((item, i) => {
            const hidden = visibleCats.length + i >= visibleCount - 1;
            return (
              <a key={item.key} className={`nav-item${hidden ? ' nav-hidden' : ''}`}
                onClick={() => onNavigate(item.page)} role="menuitem" tabIndex={hidden ? -1 : 0}>
                {lang === 'bn' ? item.bn : item.en}
              </a>
            );
          })}

          {/* "আরও / More" — always last */}
          {overflowCats.length > 0 && (
            <div className="nav-cat-wrap nav-more-wrap"
              onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
              <a className="nav-item nav-more-btn" role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setMoreOpen(o => !o)}>
                {moreLabel}
                <svg className="nav-arrow" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transition: 'transform .2s', transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </a>
              {moreOpen && (
                <div className="nav-sub-dropdown nav-more-dropdown" role="menu"
                  onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
                  {renderDropdownItems(overflowCats.map(cat => ({
                    ...cat,
                    children: cat.children ?? [],
                  })), 0, [])}
                </div>
              )}
            </div>
          )}
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
            const isExpanded  = !!expandedCat[cat.slug];
            const nav         = makeCatNav(cat);
            return (
              <div key={cat.slug}>
                <button className="drw-item"
                  onClick={() => {
                    if (hasChildren) toggleExpanded(cat.slug);
                    else nav();
                  }}>
                  <span>{lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}</span>
                  {hasChildren && <ChevronDown open={isExpanded} />}
                </button>
                {hasChildren && isExpanded && (
                  <div className="drw-subs">
                    <button className="drw-sub drw-sub-all" onClick={nav}>
                      {lang === 'bn' ? `সব ${cat.name_bn}` : `All ${cat.name_en || cat.name_bn}`}
                    </button>
                    {renderDrawerSubs(cat.children, 0, [cat])}
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
