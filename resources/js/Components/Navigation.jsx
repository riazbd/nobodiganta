import { t } from '../translations';
import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { ROUTES } from '../lib/routes';

// The "Media" nav item is a single dropdown holding these links. Clicking the
// Media label itself goes to Video (the default media landing).
const MEDIA_DEFAULT = 'video';
const MEDIA_LINKS = [
  { key: 'stories',  page: 'stories',  bn: 'স্টোরিজ',  en: 'Stories'   },
  { key: 'video',    page: 'video',    bn: 'ভিডিও',    en: 'Video'     },
  { key: 'gallery',  page: 'gallery',  bn: 'গ্যালারি',  en: 'Gallery'   },
];
const MEDIA_SLUG = '__media__';

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
const FbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const YtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const IgIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
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
    // Measure order: [Home, ...categories, More, Media]
    const all = mc.querySelectorAll('.nav-measure-item');
    if (!all.length) return;

    // Real content width: clientWidth minus horizontal padding, minus a small
    // safety buffer. Using offsetWidth here (the old bug) counted the 32px
    // padding as usable space, so an item too many fit and overflowed/clipped.
    const cs   = getComputedStyle(nav);
    const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    const available = nav.clientWidth - padX - 8;

    // Trailing items after the categories: [More, Media] → 2.
    const catCount = Math.max(0, all.length - 2 - 1);
    const widthAt  = (i) => all[i]?.offsetWidth || 0;
    const homeW    = widthAt(0);
    const moreW    = widthAt(1 + catCount);

    // How many categories fit alongside Home.
    let used = homeW, fitCats = 0;
    for (let i = 0; i < catCount; i++) {
      const w = widthAt(1 + i);
      if (used + w <= available) { used += w; fitCats++; } else break;
    }

    if (fitCats < catCount) {
      // Some categories overflow → reserve room for the "More" button, dropping
      // trailing categories until Home + categories + More all fit.
      while (fitCats > 0 && used + moreW > available) { used -= widthAt(fitCats); fitCats--; }
      setVisibleCount(Math.max(2, fitCats + 1));
      return;
    }

    // Everything fits → see whether the single "Media" dropdown fits too.
    const mediaW = widthAt(1 + catCount + 1);
    const fitMedia = (used + mediaW <= available) ? 1 : 0;
    setVisibleCount(catCount + 1 + fitMedia);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(calculateVisible, 100);
    const t2 = setTimeout(calculateVisible, 300);
    window.addEventListener('resize', calculateVisible);
    // Bengali web fonts widen the items after they load — re-measure then too.
    if (document.fonts?.ready) document.fonts.ready.then(calculateVisible);
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
  // The Media dropdown collapses into "More" when there's no room for it inline.
  const mediaHidden   = visibleCats.length >= visibleCount - 1;
  const mediaLabel    = lang === 'bn' ? 'মিডিয়া' : 'Media';
  const moreLabel     = lang === 'bn'
    ? (settings?.nav_more_label_bn || 'আরও')
    : (settings?.nav_more_label_en || 'More');

  // Flip a dropdown (and its nested submenus) leftward when it would otherwise
  // overflow the right edge of the viewport, so menus always stay on screen.
  const [flip, setFlip] = useState(false);
  const estDropWidth = (cat) => {
    const kids = cat.children || [];
    const grid = kids.length > 6 && !kids.some(i => i.children?.length > 0);
    if (grid) return kids.length > 10 ? 680 : 460;
    return 240;
  };
  const handleCatEnter = (cat, e) => {
    clearTimeout(hoverTimer.current);
    setHoveredCat(cat.slug);
    const left = e?.currentTarget?.getBoundingClientRect().left ?? 0;
    // +220 leaves room for a nested submenu that would open to the right.
    setFlip(left + estDropWidth(cat) + 220 > window.innerWidth - 8);
  };
  const handleCatLeave = ()   => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };
  const handleDropEnter = ()  => clearTimeout(hoverTimer.current);
  const handleDropLeave = ()  => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };

  // Position a nested flyout submenu so it always fits inside the *usable* area —
  // the band between the top of the screen and any fixed bottom bar (the breaking
  // ticker). Measured against clientWidth/clientHeight, which exclude the page
  // scrollbar, so a deep column never slides behind it.
  //   • Horizontal: open to the right of the row; flip to the left if there
  //     isn't room (decided per submenu, not once for the whole dropdown).
  //   • Vertical: align its top with the row you hovered, then shift up only as
  //     much as needed to fit (so long lists stay attached instead of shooting
  //     to the top). Leaf menus get a capped height + scroll within the band;
  //     intermediate menus only reposition so their own child flyouts aren't clipped.
  const positionFlyout = (e) => {
    const wrap = e.currentTarget;
    const sub = wrap.querySelector(':scope > .nav-sub-sub');
    if (!sub) return;
    sub.style.top = ''; sub.style.bottom = ''; sub.style.left = ''; sub.style.right = '';
    sub.style.maxHeight = ''; sub.style.overflowY = '';

    const margin = 8;
    const rect = wrap.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Usable vertical band: top margin → top edge of the fixed breaking bar.
    const ticker = document.querySelector('.brk-fixed');
    const topBound = margin;
    const botBound = (ticker ? ticker.getBoundingClientRect().top : vh) - margin;
    const bandH = botBound - topBound;
    const isLeaf = !sub.querySelector('.nav-sub-wrap');

    let h = sub.offsetHeight;
    if (isLeaf && h > bandH) { // taller than the usable band — cap + scroll
      h = bandH;
      sub.style.maxHeight = bandH + 'px';
      sub.style.overflowY = 'auto';
    }

    // Horizontal: prefer the right of the row; flip left if it would overflow.
    const w = sub.offsetWidth;
    if (rect.right + w > vw - margin && rect.left - w >= margin) {
      sub.style.left = 'auto'; sub.style.right = '100%';
    } else {
      sub.style.left = '100%'; sub.style.right = 'auto';
    }

    // Vertical: top is relative to the (position:relative) wrap; 0 aligns it
    // with the row. Shift up if it would cross the bottom bound, then clamp so
    // it never crosses the top bound either.
    let top = 0;
    const overflowBelow = (rect.top + h) - botBound;
    if (overflowBelow > 0) top = -overflowBelow;
    const minTop = topBound - rect.top;
    if (top < minTop) top = minTop;
    sub.style.top = top + 'px';
    sub.style.bottom = 'auto';
  };

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
              <div key={child.slug} className="nav-sub-wrap" onMouseEnter={positionFlyout}>
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
              <div key={w} style={{ width: w, height: 14, background: 'var(--border-color)', borderRadius: 3, flexShrink: 0 }} />
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
          <a className="nav-measure-item">{mediaLabel}</a>
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
                onMouseEnter={(e) => hasChildren && handleCatEnter(cat, e)}
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
                  <div className={`nav-sub-dropdown${flip ? ' nav-sub-dropdown--flip' : ''}`} role="menu"
                    onMouseEnter={handleDropEnter} onMouseLeave={handleDropLeave}>
                    {renderDropdownItems(cat.children, 0, [cat])}
                  </div>
                )}
              </div>
            );
          })}

          {/* Media dropdown (Stories / Video / Gallery). Clicking "Media" goes
              to Video; collapses into "More" when it doesn't fit inline. */}
          {!mediaHidden && (
            <div className="nav-cat-wrap"
              onMouseEnter={(e) => handleCatEnter({ slug: MEDIA_SLUG, children: MEDIA_LINKS }, e)}
              onMouseLeave={handleCatLeave}>
              <a className="nav-item nav-has-sub"
                onClick={() => onNavigate(MEDIA_DEFAULT)} role="menuitem" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onNavigate(MEDIA_DEFAULT)}>
                {mediaLabel}
                <svg className="nav-arrow" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </a>
              {hoveredCat === MEDIA_SLUG && (
                <div className={`nav-sub-dropdown${flip ? ' nav-sub-dropdown--flip' : ''}`} role="menu"
                  onMouseEnter={handleDropEnter} onMouseLeave={handleDropLeave}>
                  <div className="nav-sub-items">
                    {MEDIA_LINKS.map(item => (
                      <a key={item.key} className="nav-sub-link" role="menuitem" tabIndex={0}
                        onClick={() => { setHoveredCat(null); onNavigate(item.page); }}
                        onKeyDown={e => e.key === 'Enter' && (setHoveredCat(null), onNavigate(item.page))}>
                        {lang === 'bn' ? item.bn : item.en}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* "আরও / More" — last; holds overflow categories and, when it
              doesn't fit inline, the Media links. Hidden when empty. */}
          {(overflowCats.length > 0 || mediaHidden) && (
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
              <div className="nav-sub-dropdown nav-more-dropdown nav-sub-dropdown--flip" role="menu"
                onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
                {mediaHidden && (
                  <div className="nav-sub-items">
                    {MEDIA_LINKS.map(item => (
                      <a key={item.key} className="nav-sub-link" role="menuitem" tabIndex={0}
                        onClick={() => { setMoreOpen(false); onNavigate(item.page); }}
                        onKeyDown={e => e.key === 'Enter' && (setMoreOpen(false), onNavigate(item.page))}>
                        {lang === 'bn' ? item.bn : item.en}
                      </a>
                    ))}
                  </div>
                )}
                {overflowCats.length > 0 && renderDropdownItems(overflowCats.map(cat => ({
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
          {/* Edition toggle */}
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

          {/* Social follow */}
          {(settings.facebook_url || settings.twitter_url || settings.youtube_url || settings.instagram_url) && (
            <div className="drw-socials">
              <span className="drw-socials-label">{lang === 'bn' ? 'ফলো করুন' : 'Follow us'}</span>
              <div className="drw-socials-icons">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="drw-soc drw-soc-fb"><FbIcon /></a>
                )}
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="X" className="drw-soc drw-soc-x"><XIcon /></a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="drw-soc drw-soc-yt"><YtIcon /></a>
                )}
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="drw-soc drw-soc-ig"><IgIcon /></a>
                )}
              </div>
            </div>
          )}
          <div className="drw-divider" />

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

          {/* Media (Stories / Video / Gallery) */}
          <div className="drw-divider" />
          <button className="drw-item"
            onClick={() => {
              if (expandedCat[MEDIA_SLUG]) go(MEDIA_DEFAULT);
              else toggleExpanded(MEDIA_SLUG);
            }}>
            <span>{mediaLabel}</span>
            <ChevronDown open={!!expandedCat[MEDIA_SLUG]} />
          </button>
          {expandedCat[MEDIA_SLUG] && (
            <div className="drw-subs">
              {MEDIA_LINKS.map(item => (
                <button key={item.key} className="drw-sub" style={{ paddingLeft: 32 }} onClick={() => go(item.page)}>
                  {lang === 'bn' ? item.bn : item.en}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
