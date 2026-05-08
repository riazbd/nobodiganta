import { t } from '../translations';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

const MENU_ITEMS = [
  { key: 'stories', page: 'stories', bn: 'স্টোরিজ', en: 'Stories' },
  { key: 'gallery', page: 'gallery', bn: 'গ্যালারি', en: 'Gallery' },
  { key: 'video',   page: 'video',   bn: 'ভিডিও',   en: 'Video'   },
];

const VISIBLE_CATEGORIES = 6;

// Hamburger / Close inline SVGs — no extra import needed
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function Navigation() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [moreOpen,    setMoreOpen]    = useState(false);
  const [hoveredCat,  setHoveredCat]  = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [expandedMob, setExpandedMob] = useState(null); // for mobile sub-menu

  const moreBtnRef  = useRef(null);
  const measureRef  = useRef(null);
  const navRef      = useRef(null);
  const hoverTimer  = useRef(null);

  useEffect(() => {
    fetch(`/api/categories?edition=${lang}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setCategories(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [lang]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const visibleCats = categories.slice(0, VISIBLE_CATEGORIES);
  const hiddenCats  = categories.slice(VISIBLE_CATEGORIES);

  const moreItems = [
    ...hiddenCats.map(cat => ({
      key: cat.slug, page: 'cat', sub: cat.slug,
      bn: cat.name_bn, en: cat.name_en || cat.name_bn,
    })),
    ...MENU_ITEMS,
  ];

  const [visibleCount, setVisibleCount] = useState(99);

  const calculateVisible = useCallback(() => {
    const mc  = measureRef.current;
    const nav = navRef.current;
    if (!mc || !nav) return;
    const items = mc.querySelectorAll('.nav-measure-item');
    if (!items.length) return;
    const available = nav.offsetWidth - 90;
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

  // Close "more" dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCatEnter = slug => { clearTimeout(hoverTimer.current); setHoveredCat(slug); setMoreOpen(false); };
  const handleCatLeave = ()   => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };
  const handleDropEnter = ()  => clearTimeout(hoverTimer.current);
  const handleDropLeave = ()  => { hoverTimer.current = setTimeout(() => setHoveredCat(null), 130); };

  // Recursive renderer for desktop dropdown — any depth, with indentation
  const renderDropdownItems = (items, depth) => items.map(child => (
    <span key={child.slug}>
      <a
        className="nav-sub-link"
        style={depth > 0 ? { paddingLeft: `${16 + depth * 14}px`, opacity: 0.85 } : undefined}
        onClick={() => { setHoveredCat(null); onNavigate('cat', child.slug); }}
        role="menuitem"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onNavigate('cat', child.slug)}
      >
        {depth > 0 && <span style={{ marginRight: 4, opacity: 0.4 }}>↳</span>}
        {lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn)}
      </a>
      {child.children?.length > 0 && renderDropdownItems(child.children, depth + 1)}
    </span>
  ));

  // Recursive renderer for mobile drawer — any depth, with indentation
  const renderMobileItems = (items, depth) => items.map(child => (
    <span key={child.slug}>
      <button
        className="nav-mob-subitem"
        style={depth > 0 ? { paddingLeft: `${16 + depth * 14}px` } : undefined}
        onClick={() => { onNavigate('cat', child.slug); setMobileOpen(false); }}
      >
        {depth > 0 && <span style={{ marginRight: 4, opacity: 0.4 }}>↳</span>}
        {lang === 'bn' ? child.name_bn : (child.name_en || child.name_bn)}
      </button>
      {child.children?.length > 0 && renderMobileItems(child.children, depth + 1)}
    </span>
  ));

  const handleNav = item => {
    setMoreOpen(false);
    setMobileOpen(false);
    if (item.page === 'cat') onNavigate('cat', item.sub);
    else onNavigate(item.page);
  };

  // ─── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <nav id="nav" aria-label={lang === 'bn' ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
        <div className="nav-inner">
          <div style={{ display: 'flex', gap: 8, padding: '0 14px' }}>
            {[55, 72, 68, 80, 60, 75].map(w => (
              <div key={w} style={{ width: w, height: 14, background: 'rgba(255,255,255,.18)', borderRadius: 3, flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav id="nav" aria-label={lang === 'bn' ? 'প্রধান নেভিগেশন' : 'Main navigation'}>
        {/* Hidden measurement ghost */}
        <div className="nav-measure" ref={measureRef} aria-hidden="true">
          <a className="nav-measure-item nav-home">{t('nav.home', lang)}</a>
          {visibleCats.map(cat => (
            <a key={cat.slug + '-m'} className="nav-measure-item">
              {lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}
            </a>
          ))}
        </div>

        <div className="nav-inner" ref={navRef}>
          {/* Home link */}
          <a
            className="nav-item nav-home"
            onClick={() => onNavigate('home')}
            role="menuitem"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate('home')}
          >
            {t('nav.home', lang)}
          </a>

          {/* Visible categories */}
          {visibleCats.map((cat, i) => {
            const hasChildren = cat.children?.length > 0;
            const isHovered   = hoveredCat === cat.slug;
            const hidden      = i >= visibleCount - 1;
            return (
              <div
                key={cat.slug}
                className={`nav-cat-wrap${hidden ? ' nav-hidden' : ''}`}
                onMouseEnter={() => !hidden && hasChildren && handleCatEnter(cat.slug)}
                onMouseLeave={handleCatLeave}
              >
                <a
                  className={`nav-item${hasChildren ? ' nav-has-sub' : ''}`}
                  onClick={() => onNavigate('cat', cat.slug)}
                  role="menuitem"
                  tabIndex={hidden ? -1 : 0}
                  onKeyDown={e => e.key === 'Enter' && onNavigate('cat', cat.slug)}
                >
                  {lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}
                  {hasChildren && (
                    <svg className="nav-arrow" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </a>

                {hasChildren && isHovered && (
                  <div
                    className="nav-sub-dropdown"
                    role="menu"
                    onMouseEnter={handleDropEnter}
                    onMouseLeave={handleDropLeave}
                  >
                    <a
                      className="nav-sub-parent"
                      onClick={() => { setHoveredCat(null); onNavigate('cat', cat.slug); }}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {lang === 'bn' ? `সব ${cat.name_bn}` : `All ${cat.name_en || cat.name_bn}`}
                    </a>
                    <div className="nav-sub-divider" />
                    {renderDropdownItems(cat.children, 0)}
                  </div>
                )}
              </div>
            );
          })}

          {/* More mega-menu */}
          <div className="nav-more nav-mega-wrap" ref={moreBtnRef}>
            <a
              className={`nav-more-btn nav-mega-btn${moreOpen ? ' on' : ''}`}
              onClick={() => { setMoreOpen(!moreOpen); setHoveredCat(null); }}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') setMoreOpen(!moreOpen);
                if (e.key === 'Escape') setMoreOpen(false);
              }}
            >
              {lang === 'bn' ? 'আরও' : 'More'}
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 4, transition: 'transform .2s', transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </a>
            {moreOpen && moreItems.length > 0 && (
              <div className="nav-mega-dropdown" role="menu" onKeyDown={e => e.key === 'Escape' && setMoreOpen(false)}>
                {moreItems.map(item => (
                  <a
                    key={item.key}
                    onClick={() => handleNav(item)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleNav(item)}
                    className="nav-mega-link"
                  >
                    {lang === 'bn' ? item.bn : item.en}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label={lang === 'bn' ? 'মেনু খুলুন' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <HamburgerIcon />
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="nav-mob-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`nav-mob-drawer${mobileOpen ? ' open' : ''}`} aria-label={lang === 'bn' ? 'নেভিগেশন মেনু' : 'Navigation menu'} role="dialog">
        {/* Drawer header */}
        <div className="nav-mob-hdr">
          <span className="nav-mob-title">{lang === 'bn' ? 'মেনু' : 'Menu'}</span>
          <button
            className="nav-mob-close"
            onClick={() => setMobileOpen(false)}
            aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="nav-mob-body">
          {/* Home */}
          <div className="nav-mob-section">{lang === 'bn' ? 'প্রধান মেনু' : 'Main Menu'}</div>
          <button
            className="nav-mob-item"
            onClick={() => { onNavigate('home'); setMobileOpen(false); }}
          >
            <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
            <ChevronRight />
          </button>

          {/* Categories */}
          <div className="nav-mob-section">{lang === 'bn' ? 'বিভাগসমূহ' : 'Categories'}</div>
          {categories.map(cat => {
            const hasChildren = cat.children?.length > 0;
            const isExpanded  = expandedMob === cat.slug;
            return (
              <div key={cat.slug}>
                <button
                  className="nav-mob-item"
                  onClick={() => {
                    if (hasChildren) {
                      setExpandedMob(isExpanded ? null : cat.slug);
                    } else {
                      onNavigate('cat', cat.slug);
                      setMobileOpen(false);
                    }
                  }}
                >
                  <span>{lang === 'bn' ? cat.name_bn : (cat.name_en || cat.name_bn)}</span>
                  {hasChildren ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform .2s', transform: isExpanded ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  ) : <ChevronRight />}
                </button>
                {hasChildren && isExpanded && (
                  <div className="nav-mob-sub">
                    <button
                      className="nav-mob-subitem nav-mob-subitem-all"
                      onClick={() => { onNavigate('cat', cat.slug); setMobileOpen(false); }}
                    >
                      {lang === 'bn' ? `সব ${cat.name_bn}` : `All ${cat.name_en || cat.name_bn}`}
                    </button>
                    {renderMobileItems(cat.children, 0)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick links */}
          <div className="nav-mob-section">{lang === 'bn' ? 'অন্যান্য' : 'More'}</div>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className="nav-mob-item"
              onClick={() => { onNavigate(item.page); setMobileOpen(false); }}
            >
              <span>{lang === 'bn' ? item.bn : item.en}</span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
