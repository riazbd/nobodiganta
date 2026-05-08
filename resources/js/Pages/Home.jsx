import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdSlot from '../Components/ui/AdSlot';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { relativeTime, toBengaliNum } from '../lib/formatters';
import Icon from '../Components/Icon';
import StoryStrip from '@/Components/StoryStrip';

// ─── helpers ──────────────────────────────────────────────────────────────────

function go(a, nav) {
  if (!a?.category?.slug || !a?.slug) return;
  nav('article', { categorySlug: a.category.slug, articleSlug: a.slug });
}

// When h is omitted the wrapper expands to fill its parent (which sets aspect-ratio in CSS).
// When w+h are both given it's a fixed-size thumbnail.
function Img({ src, alt, h, w, isVideo, className = '', style = {} }) {
  const wrapStyle = {
    position: 'relative',
    width: w || '100%',
    height: h ? `${h}px` : '100%',
    overflow: 'hidden',
    flexShrink: 0,
  };
  const imgStyle = {
    objectFit: 'cover',
    display: 'block',
    width: '100%',
    height: '100%',
    ...style,
  };
  return (
    <div style={wrapStyle}>
      {src
        ? <img src={src} alt={alt || ''} loading="lazy" className={className} style={imgStyle} />
        : <div className="ph" style={{ height: h ? `${h}px` : '100%', width: w || '100%' }}>📰</div>}
      {isVideo && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 36, height: 36, background: 'rgba(232,0,30,.9)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 2,
        }}>
          <Icon name="play" size={14} />
        </div>
      )}
    </div>
  );
}

const CatTag = ({ cat }) => cat ? <span className="p-cat-tag">{cat.name}</span> : null;
const TimeTag = ({ dt, lang }) => <span className="p-time">{relativeTime(dt, lang)}</span>;

// ─── LEFT COL: সর্বশেষ (Latest) ──────────────────────────────────────────────
function LatestStrip({ items, lang, nav }) {
  return (
    <div className="p-latest">
      <div className="p-latest-hdr">{lang === 'bn' ? 'সর্বশেষ' : 'Latest'}</div>
      <div className="p-latest-body">
        {items.slice(0, 12).map(a => (
          <div key={a.id} className="p-latest-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            {a.featured_image && (
              <div className="p-latest-thumb">
                <Img src={a.featured_image} alt={a.title} />
              </div>
            )}
            <div className="p-latest-text">
              <div className="p-latest-meta">
                {a.category && <span className="p-cat-tag">{a.category.name}</span>}
                <TimeTag dt={a.published_at} lang={lang} />
              </div>
              <h4 className="p-latest-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CENTER COL: hero + mini-3 + rows ────────────────────────────────────────
function CenterBlock({ hero, mini3, rows, lang, nav }) {
  return (
    <div className="p-center">
      {/* Big hero */}
      {hero && (
        <div className="p-hero" onClick={() => go(hero, nav)} role="button" tabIndex={0}>
          <div className="p-hero-img">
            <Img src={hero.featured_image} alt={hero.title} isVideo={hero.article_type === 'video'} />
          </div>
          <div className="p-hero-body">
            <CatTag cat={hero.category} />
            <h2 className="p-hero-h">{lang === 'bn' ? hero.title : (hero.title_en || hero.title)}</h2>
            {hero.excerpt && <p className="p-hero-p">{hero.excerpt}</p>}
            <div className="p-meta">
              {hero.author?.name && <span>{hero.author.name}</span>}
              <TimeTag dt={hero.published_at} lang={lang} />
            </div>
          </div>
        </div>
      )}

      {/* 3-col mini grid */}
      <div className="p-mini3">
        {mini3.slice(0, 3).map(a => (
          <div key={a.id} className="p-mini3-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <Img src={a.featured_image} alt={a.title} />
            <div className="p-mini3-overlay">
              <CatTag cat={a.category} />
              <h5 className="p-mini3-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* Extra text/thumb rows */}
      <div className="p-center-rows">
        {rows.slice(0, 6).map(a => (
          <div key={a.id} className="p-center-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <div className="p-center-row-img">
              <Img src={a.featured_image} alt={a.title} h={56} w={80} />
            </div>
            <div className="p-center-row-body">
              <CatTag cat={a.category} />
              <h5 className="p-center-row-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
              <TimeTag dt={a.published_at} lang={lang} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RIGHT COL: horizontal thumb items ────────────────────────────────────────
function RightBlock({ items, opinions, mostRead, lang, nav }) {
  return (
    <div className="p-right">
      {/* Top: 2 horizontal items (text left + thumb right) */}
      <div className="p-right-top">
        {items.slice(0, 2).map((a, i) => (
          <div key={a.id} className={`p-right-item${i > 0 ? ' p-right-sep' : ''}`} onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <div className="p-right-body">
              <CatTag cat={a.category} />
              <h4 className="p-right-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h4>
              <TimeTag dt={a.published_at} lang={lang} />
            </div>
            <div className="p-right-img">
              <Img src={a.featured_image} alt={a.title} h={80} w={108} />
            </div>
          </div>
        ))}
      </div>

      {/* Opinion widget */}
      {opinions.length > 0 && (
        <div className="p-widget">
          <div className="p-wgt-hdr p-wgt-opinion">{lang === 'bn' ? 'মতামত' : 'Opinion'}</div>
          <div className="p-wgt-body">
            {opinions.slice(0, 4).map(op => (
              <div key={op.id} className="p-op-item" onClick={() => nav('article', { categorySlug: op.category?.slug, articleSlug: op.slug })} role="button" tabIndex={0}>
                <div className="p-op-av">
                  {op.author?.image ? <img src={op.author.image} alt={op.author.name} /> : <div className="ph" style={{ width: '100%', height: '100%', fontSize: 14 }}>👤</div>}
                </div>
                <div>
                  <div className="p-op-name">{op.author?.name}</div>
                  <div className="p-op-title">{lang === 'bn' ? op.title : (op.title_en || op.title)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most read widget */}
      {mostRead.length > 0 && (
        <div className="p-widget">
          <div className="p-wgt-hdr p-wgt-mostread">{lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}</div>
          <div className="p-wgt-body">
            {mostRead.slice(0, 8).map((a, i) => (
              <div key={a.id} className="p-tr-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                <span className={`p-tr-n${i === 0 ? ' hot' : ''}`}>{lang === 'bn' ? toBengaliNum(i + 1) : i + 1}</span>
                <div className="p-tr-body">
                  <span className="p-tr-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</span>
                </div>
                {a.featured_image && <Img src={a.featured_image} alt={a.title} h={52} w={72} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CATEGORY SCROLL STRIP ────────────────────────────────────────────────────
function CatStrip({ items, lang, nav }) {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  if (!items.length) return null;
  return (
    <div className="p-catstrip-wrap">
      <button className="p-catstrip-arr" onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
      <div className="p-catstrip" ref={ref}>
        {items.map(c => (
          <button key={c.id} className="p-catstrip-pill" onClick={() => nav('category', c.slug)}>
            {c.name}
          </button>
        ))}
      </div>
      <button className="p-catstrip-arr" onClick={() => scroll(1)} aria-label="Scroll right">›</button>
    </div>
  );
}

// ─── VIDEO CAROUSEL ───────────────────────────────────────────────────────────
function VideoSection({ items, lang, nav }) {
  const [slide, setSlide]       = useState(0);
  const [perSlide, setPerSlide] = useState(4);

  useEffect(() => {
    const upd = () => setPerSlide(window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 4);
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);

  if (!items?.length) return null;
  const pages = Math.ceil(items.length / perSlide);

  return (
    <div className="p-section">
      <div className="p-sec-hdr-wrap">
        <div className="p-sec-hdr">
          <h2 className="p-sec-ttl" onClick={() => nav('video')}>{lang === 'bn' ? 'ভিডিও' : 'Video'}</h2>
          <span className="p-sec-more" onClick={() => nav('video')}>{lang === 'bn' ? 'আরও »' : 'More »'}</span>
        </div>
      </div>
      <div className="p-carousel">
        <button className="p-car-btn" onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}>‹</button>
        <div className="p-car-viewport">
          <div className="p-car-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {Array.from({ length: pages }).map((_, pi) => (
              <div key={pi} className="p-car-page" style={{ gridTemplateColumns: `repeat(${perSlide},1fr)` }}>
                {items.slice(pi * perSlide, (pi + 1) * perSlide).map(a => (
                  <div key={a.id} className="p-vid-card" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                    <div className="p-vid-thumb"><Img src={a.featured_image} alt={a.title} isVideo /></div>
                    <div className="p-vid-body">
                      <CatTag cat={a.category} />
                      <h5 className="p-vid-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
                      <TimeTag dt={a.published_at} lang={lang} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button className="p-car-btn" onClick={() => setSlide(s => Math.min(pages - 1, s + 1))} disabled={slide >= pages - 1}>›</button>
      </div>
      {pages > 1 && (
        <div className="p-car-dots">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} className={`p-car-dot${slide === i ? ' on' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TABBED SECTION ───────────────────────────────────────────────────────────
function TabbedSection({ mostRead, breakingNews, latest, featured, lang, nav }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    { bn: 'পড়া',    en: 'Most Read'  },
    { bn: 'আলোচিত', en: 'Discussed'  },
    { bn: 'মুখর',   en: 'Trending'   },
  ];
  const leftList  = tab === 0 ? mostRead : tab === 1 ? breakingNews : [...mostRead].reverse();
  const rightList = latest;

  return (
    <div className="p-section p-tab-section">
      <div className="p-tabs">
        {tabs.map((t, i) => (
          <button key={i} className={`p-tab-btn${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>
            {lang === 'bn' ? t.bn : t.en}
          </button>
        ))}
      </div>
      <div className="p-tab-body">
        {/* Left: numbered list */}
        <div className="p-tab-list">
          {leftList.slice(0, 8).map((a, i) => (
            <div key={a.id} className="p-tab-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <span className={`p-tab-n${i === 0 ? ' hot' : ''}`}>{lang === 'bn' ? toBengaliNum(i + 1) : i + 1}</span>
              <div className="p-tab-item-body">
                <CatTag cat={a.category} />
                <h5 className="p-tab-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
              </div>
              {a.featured_image && <Img src={a.featured_image} alt={a.title} h={58} w={80} />}
            </div>
          ))}
        </div>

        {/* Center: featured + 2-col mini */}
        <div className="p-tab-feat">
          {featured && (
            <>
              <div className="p-tab-main" onClick={() => go(featured, nav)} role="button" tabIndex={0}>
                <div className="p-tab-main-img">
                  <Img src={featured.featured_image} alt={featured.title} isVideo={featured.article_type === 'video'} />
                </div>
                <div className="p-tab-main-body">
                  <CatTag cat={featured.category} />
                  <h3 className="p-tab-main-h">{lang === 'bn' ? featured.title : (featured.title_en || featured.title)}</h3>
                  <div className="p-meta">
                    {featured.author?.name && <span>{featured.author.name}</span>}
                    <TimeTag dt={featured.published_at} lang={lang} />
                  </div>
                </div>
              </div>
              <div className="p-tab-mini2">
                {leftList.slice(8, 10).map(a => (
                  <div key={a.id} className="p-tab-mini2-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                    <div className="p-tab-mini2-img">
                      <Img src={a.featured_image} alt={a.title} />
                    </div>
                    <h5 className="p-tab-mini2-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
                    <TimeTag dt={a.published_at} lang={lang} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: thumbnail list */}
        <div className="p-tab-right">
          {rightList.slice(0, 6).map(a => (
            <div key={a.id} className="p-tab-right-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <div>
                <CatTag cat={a.category} />
                <h5 className="p-tab-right-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
                <TimeTag dt={a.published_at} lang={lang} />
              </div>
              <Img src={a.featured_image} alt={a.title} h={62} w={85} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SecHdr({ title, slug, subcats, lang, nav, activeSub, onSub }) {
  return (
    <div className="p-sec-hdr-wrap">
      <div className="p-sec-hdr">
        <h2 className="p-sec-ttl" onClick={() => slug && nav('category', slug)}>{title}</h2>
        {slug && (
          <span className="p-sec-more" onClick={() => nav('category', slug)}>
            {lang === 'bn' ? 'আরও »' : 'More »'}
          </span>
        )}
      </div>
      {subcats?.length > 0 && (
        <div className="p-subcats">
          <span className={`p-subcat${!activeSub ? ' on' : ''}`} onClick={() => onSub(null)}>{lang === 'bn' ? 'সব' : 'All'}</span>
          {subcats.map(s => (
            <span key={s.id} className={`p-subcat${activeSub === s.slug ? ' on' : ''}`} onClick={() => onSub(s.slug)}>{s.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────
function CategorySection({ section, lang, nav }) {
  const [sub, setSub] = useState(null);
  const all = section.items || [];
  if (!all.length) return null;

  const items = sub
    ? all.filter(a => (a.categories || []).some(c => c.slug === sub))
    : all;

  const layout = section.layout || 'featured_left';
  const t = (a) => lang === 'bn' ? a.title : (a.title_en || a.title);

  // ── featured_left ───────────────────────────────────────────────────────
  // Slot map for 11 items:
  //   [0]       → hero (left col, large)
  //   [1,2]     → center stacked (2 articles with image)
  //   [3..7]    → right list (5 articles: text + small thumb)
  //   [8,9,10]  → bottom strip (3 text-only headlines)
  const hero    = items[0];
  const mid     = items.slice(1, 3);
  const side    = items.slice(3, 8);
  const strip   = items.slice(8, 11);

  if (layout === 'featured_left' && hero) {
    return (
      <div className="cs-section">
        <SecHdr
          title={section.title} slug={section.slug}
          subcats={section.subcategories} lang={lang} nav={nav}
          activeSub={sub} onSub={setSub}
        />

        {/* 3-column body */}
        <div className="cs-feat">

          {/* LEFT — hero */}
          <div className="cs-hero" onClick={() => go(hero, nav)} role="button" tabIndex={0}>
            <div className="cs-hero-img">
              <Img src={hero.featured_image} alt={t(hero)} />
            </div>
            <div className="cs-hero-body">
              <CatTag cat={hero.category} />
              <h3 className="cs-hero-h">{t(hero)}</h3>
              {hero.excerpt && <p className="cs-hero-p">{hero.excerpt}</p>}
              <div className="p-meta">
                {hero.author?.name && <span className="cs-author">{hero.author.name}</span>}
                <TimeTag dt={hero.published_at} lang={lang} />
              </div>
            </div>
          </div>

          {/* CENTER — 2 stacked */}
          <div className="cs-mid">
            {mid.map((a, i) => (
              <div
                key={a.id}
                className={`cs-mid-item${i > 0 ? ' cs-mid-sep' : ''}`}
                onClick={() => go(a, nav)} role="button" tabIndex={0}
              >
                <div className="cs-mid-img">
                  <Img src={a.featured_image} alt={t(a)} />
                </div>
                <div className="cs-mid-body">
                  <CatTag cat={a.category} />
                  <h4 className="cs-mid-h">{t(a)}</h4>
                  <div className="p-meta">
                    {a.author?.name && <span>{a.author.name}</span>}
                    <TimeTag dt={a.published_at} lang={lang} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — compact list (text + thumb) */}
          <div className="cs-side">
            {side.map(a => (
              <div key={a.id} className="cs-side-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                <div className="cs-side-body">
                  <CatTag cat={a.category} />
                  <h5 className="cs-side-h">{t(a)}</h5>
                  <TimeTag dt={a.published_at} lang={lang} />
                </div>
                <div className="cs-side-img">
                  <Img src={a.featured_image} alt={t(a)} h={62} w={84} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM STRIP */}
        {strip.length > 0 && (
          <div className="cs-strip">
            {strip.map(a => (
              <div key={a.id} className="cs-strip-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                {a.featured_image && (
                  <div className="cs-strip-img">
                    <Img src={a.featured_image} alt={t(a)} />
                  </div>
                )}
                <div className="cs-strip-body">
                  <CatTag cat={a.category} />
                  <h5 className="cs-strip-h">{t(a)}</h5>
                  <TimeTag dt={a.published_at} lang={lang} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── grid ────────────────────────────────────────────────────────────────
  if (layout === 'grid') {
    return (
      <div className="cs-section">
        <SecHdr
          title={section.title} slug={section.slug}
          subcats={section.subcategories} lang={lang} nav={nav}
          activeSub={sub} onSub={setSub}
        />
        <div className="cs-grid">
          {items.slice(0, 6).map(a => (
            <div key={a.id} className="cs-grid-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <div className="cs-grid-img">
                <Img src={a.featured_image} alt={t(a)} />
              </div>
              <div className="cs-grid-body">
                <CatTag cat={a.category} />
                <h4 className="cs-grid-h">{t(a)}</h4>
                <div className="p-meta">
                  {a.author?.name && <span>{a.author.name}</span>}
                  <TimeTag dt={a.published_at} lang={lang} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── list / video_grid ────────────────────────────────────────────────────
  return (
    <div className="cs-section">
      <SecHdr
        title={section.title} slug={section.slug}
        subcats={section.subcategories} lang={lang} nav={nav}
        activeSub={sub} onSub={setSub}
      />
      <div className="cs-list">
        {items.slice(0, 6).map(a => (
          <div key={a.id} className="cs-list-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <div className="cs-list-img">
              <Img src={a.featured_image} alt={t(a)} h={78} w={116} isVideo={layout === 'video_grid'} />
            </div>
            <div className="cs-list-body">
              <CatTag cat={a.category} />
              <h4 className="cs-list-h">{t(a)}</h4>
              {a.excerpt && <p className="cs-list-p">{a.excerpt}</p>}
              <div className="p-meta">
                {a.author?.name && <span>{a.author.name}</span>}
                <TimeTag dt={a.published_at} lang={lang} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OPINION ROW ──────────────────────────────────────────────────────────────
function OpinionRow({ opinions, lang, nav }) {
  if (!opinions.length) return null;
  return (
    <div className="p-section">
      <div className="p-sec-hdr-wrap">
        <div className="p-sec-hdr">
          <h2 className="p-sec-ttl" onClick={() => nav('category', 'opinion')}>{lang === 'bn' ? 'মতামত' : 'Opinion'}</h2>
          <span className="p-sec-more" onClick={() => nav('category', 'opinion')}>{lang === 'bn' ? 'আরও »' : 'More »'}</span>
        </div>
      </div>
      <div className="p-op-grid">
        {opinions.slice(0, 4).map(op => (
          <div key={op.id} className="p-op-card" onClick={() => nav('article', { categorySlug: op.category?.slug, articleSlug: op.slug })} role="button" tabIndex={0}>
            <div className="p-op-card-av">
              {op.author?.image ? <img src={op.author.image} alt={op.author.name} /> : <div className="ph" style={{ width: '100%', height: '100%', fontSize: 22 }}>👤</div>}
            </div>
            <div className="p-op-card-name">{op.author?.name}</div>
            <div className="p-op-card-desg">{op.author?.designation || (lang === 'bn' ? 'কলামিস্ট' : 'Columnist')}</div>
            <h5 className="p-op-card-title">{lang === 'bn' ? op.title : (op.title_en || op.title)}</h5>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAGS CLOUD ───────────────────────────────────────────────────────────────
function TagsCloud({ tags, lang, nav }) {
  if (!tags.length) return null;
  return (
    <div className="p-section">
      <div className="p-sec-hdr-wrap">
        <div className="p-sec-hdr">
          <h2 className="p-sec-ttl">{lang === 'bn' ? 'জনপ্রিয় বিষয়' : 'Popular Topics'}</h2>
        </div>
      </div>
      <div className="p-tags">
        {tags.map(t => (
          <span key={t.id} className="p-tag" onClick={() => nav('topic', t.slug)} role="button" tabIndex={0}>
            {lang === 'bn' ? t.name : (t.name_en || t.name)}
            {t.count > 0 && <span className="p-tag-cnt">{lang === 'bn' ? toBengaliNum(t.count) : t.count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home({
  leadArticles = [],
  breakingNews = [],
  sections     = [],
  opinions     = [],
  mostRead     = [],
  popularTags  = [],
}) {
  const { lang }       = useApp();
  const { onNavigate } = useNavigation();

  // Data distribution matching Prothom Alo layout
  const hero        = leadArticles[0];
  const mini3       = leadArticles.slice(1, 4);
  const centerRows  = leadArticles.slice(4, 10);
  const rightItems  = leadArticles.slice(8, 10);
  const leftItems   = breakingNews.length > 0 ? breakingNews : leadArticles.slice(2);
  const tabFeat     = mostRead[0] || leadArticles[0];

  const videoSec    = sections.find(s => s.type === 'videos');
  const storiesSec  = sections.find(s => s.type === 'stories');
  const catSecs     = sections.filter(s => s.type === 'category' && s.items?.length > 0);
  const stripItems  = catSecs.map(s => ({ id: s.id, slug: s.slug, name: s.title }));

  return (
    <div className="p-page">
      <Head title={lang === 'bn' ? 'নব দিগন্ত | বিশ্বস্ত সংবাদের উৎস' : 'Nobo Digonto | Trusted News'} />

      <div className="p-ad-top"><AdSlot size="leaderboard" position="home_top" /></div>

      {/* ══ TOP 3-COLUMN BLOCK ══════════════════════════════════════════════ */}
      <div className="p-top-wrap">
      <div className="p-top3">
        <div className="p-col-left">
          <LatestStrip items={leftItems} lang={lang} nav={onNavigate} />
        </div>
        <div className="p-col-center">
          <CenterBlock hero={hero} mini3={mini3} rows={centerRows} lang={lang} nav={onNavigate} />
        </div>
        <div className="p-col-right">
          <RightBlock items={rightItems} opinions={opinions} mostRead={mostRead} lang={lang} nav={onNavigate} />
        </div>
      </div>

      </div>{/* /p-top-wrap */}

      {/* ══ CATEGORY SCROLL STRIP ═══════════════════════════════════════════ */}
      <div className="p-top-wrap">
      <CatStrip items={stripItems} lang={lang} nav={onNavigate} />
      </div>

      {/* ══ BODY ═══════════════════════════════════════════════════════════ */}
      <div className="p-body">

        {/* Stories strip */}
        {storiesSec && storiesSec.items?.length > 0 && (
          <div className="my-6">
            <StoryStrip stories={storiesSec.items} title={storiesSec.title} />
          </div>
        )}

        {/* Category sections */}
        {catSecs.map((section, idx) => (
          <div key={section.id}>
            <CategorySection section={section} lang={lang} nav={onNavigate} />
            {idx === 1 && opinions.length > 0 && <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />}
            {(idx + 1) % 3 === 0 && (
              <div className="p-ad-between"><AdSlot size="leaderboard" position="between_sections" /></div>
            )}
          </div>
        ))}

        {catSecs.length <= 1 && opinions.length > 0 && (
          <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />
        )}

        {/* Video carousel */}
        {videoSec && <VideoSection items={videoSec.items} lang={lang} nav={onNavigate} />}

        {/* Ad strip */}
        <div className="p-ad-between"><AdSlot size="leaderboard" position="mid_home" /></div>

        {/* Tabbed most-read */}
        {mostRead.length > 0 && (
          <TabbedSection
            mostRead={mostRead}
            breakingNews={breakingNews}
            latest={leadArticles}
            featured={tabFeat}
            lang={lang}
            nav={onNavigate}
          />
        )}

        <TagsCloud tags={popularTags} lang={lang} nav={onNavigate} />

        <div className="p-ad-bottom"><AdSlot size="billboard" position="home_bottom" /></div>
      </div>
    </div>
  );
}
