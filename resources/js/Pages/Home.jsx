import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdSlot from '../Components/ui/AdSlot';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { relativeTime, toBengaliNum } from '../lib/formatters';
import Icon from '../Components/Icon';
import StoryStrip from '@/Components/StoryStrip';
import StoryViewer from '../Components/StoryViewer';
import MetaTags from '../Components/seo/MetaTags';
import { OrganizationJsonLd, WebSiteJsonLd } from '../Components/seo/JsonLd';
import { buildDefaultSeo } from '../lib/seo';

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

// ─── HERO 3-COL BLOCK (top.html design) ──────────────────────────────────────
function StoryCarousel({ label, items, isVideo, onClickItem, scrollRef }) {
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollAmount = () => (scrollRef.current?.offsetWidth ?? 200) * 0.8;
  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  scrollAmount(), behavior: 'smooth' });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  return (
    <div className="hp-h3-carousel-sec">
      <div className="hp-h3-cs-hdr">
        <span className="hp-h3-cs-ttl">{label}</span>
      </div>
      <div className="hp-h3-stories">
        <div className="hp-h3-scroll" ref={scrollRef} onScroll={onScroll}>
          {items.length > 0 ? items.slice(0, 8).map((item, idx) => (
            <div
              key={item.id}
              className="hp-h3-scard"
              onClick={() => onClickItem(item, idx)}
              role="button"
              tabIndex={0}
              aria-label={item.title}
            >
              {(item.cover_thumbnail || item.cover || item.featured_image)
                ? <img src={item.cover_thumbnail || item.cover || item.featured_image} alt={item.title} loading="lazy" />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }} />}
              <div className="hp-h3-scard-grad" />
              {isVideo && <div className="hp-h3-scard-play"><Icon name="play" size={16} /></div>}
              <div className="hp-h3-scard-title">{item.title}</div>
            </div>
          )) : (
            <div style={{ padding: '16px 12px', color: '#aaa', fontSize: 12, fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>
              কোনো কন্টেন্ট নেই।
            </div>
          )}
        </div>
        {items.length > 1 && canScrollLeft && (
          <button className="hp-h3-arr hp-h3-arr-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
        )}
        {items.length > 1 && canScrollRight && (
          <button className="hp-h3-arr hp-h3-arr-right" onClick={scrollRight} aria-label="Scroll right">›</button>
        )}
      </div>
    </div>
  );
}

function HeroBlock({ feat, grid6, midMain, midList, stories, lang, nav }) {
  const [activeStory, setActiveStory] = useState(null);
  const videoScrollRef = useRef(null);
  const photoScrollRef = useRef(null);
  const t = (a) => lang === 'bn' ? a.title : (a.title_en || a.title);

  const videoStories = stories.filter(s => s.slides?.some(sl => sl.is_video));
  const photoStories = stories.filter(s => !s.slides?.some(sl => sl.is_video));

  return (
    <div className="hp-hero3">
      {/* ── LEFT: featured hero + 6-card grid ── */}
      <div className="hp-h3-left">
        {feat && (
          <div className="hp-h3-feat" onClick={() => go(feat, nav)} role="button" tabIndex={0} aria-label={t(feat)} style={{ marginBottom: 0 }}>
            <div className="hp-h3-feat-img">
              {feat.featured_image
                ? <img src={feat.featured_image} alt={t(feat)} loading="eager" />
                : <div className="ph" style={{ width: '100%', height: '100%' }} />}
            </div>
            <div className="hp-h3-feat-body">
              {/* <CatTag cat={feat.category} /> */}
              <h1 className="hp-h3-feat-h">{t(feat)}</h1>
              {feat.excerpt && <p className="hp-h3-feat-p">{feat.excerpt}</p>}
            </div>
          </div>
        )}

        <div className="hp-h3-grid">
          {[grid6.slice(0, 3), grid6.slice(3, 6)].map((row, ri) => (
            <div key={ri}>
              {ri > 0 && <div className="hp-h3-divider" />}
              <div className="hp-h3-grid-row">
                {row.map(a => (
                  <div key={a.id} className="hp-h3-card" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                    <div className="hp-h3-card-img">
                      {a.featured_image
                        ? <img src={a.featured_image} alt={t(a)} loading="lazy" />
                        : <div className="ph" style={{ width: '100%', height: '100%' }} />}
                    </div>
                    <h3 className="hp-h3-card-h">
                      {t(a)}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MIDDLE: main article + 4 list rows ── */}
      <div className="hp-h3-mid">
        {midMain && (
          <div className="hp-h3-main" onClick={() => go(midMain, nav)} role="button" tabIndex={0}>
            <div className="hp-h3-main-img">
              {midMain.featured_image
                ? <img src={midMain.featured_image} alt={t(midMain)} loading="lazy" />
                : <div className="ph" style={{ width: '100%', height: '100%' }} />}
            </div>
            <div className="hp-h3-main-body">
              {/* <CatTag cat={midMain.category} /> */}
              <h2 className="hp-h3-main-h">{t(midMain)}</h2>
            </div>
          </div>
        )}
        <div>
          {midList.slice(0, 5).map(a => (
            <div key={a.id} className="hp-h3-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              {a.featured_image && (
                <div className="hp-h3-row-thumb">
                  <img src={a.featured_image} alt={t(a)} loading="lazy" />
                </div>
              )}
              <h4 className="hp-h3-row-h">{t(a)}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Video Story (top) + Photo Story (bottom) — two carousels ── */}
      <div className="hp-h3-right">
        <StoryCarousel
          label={lang === 'bn' ? 'ভিডিও স্টোরি' : 'Video Story'}
          items={videoStories}
          isVideo={true}
          onClickItem={(_, idx) => setActiveStory(stories.indexOf(videoStories[idx]))}
          scrollRef={videoScrollRef}
        />
        <StoryCarousel
          label={lang === 'bn' ? 'ফটো স্টোরি' : 'Photo Story'}
          items={photoStories}
          isVideo={false}
          onClickItem={(_, idx) => setActiveStory(stories.indexOf(photoStories[idx]))}
          scrollRef={photoScrollRef}
        />
      </div>

      {activeStory !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
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
    { bn: 'সর্বাধিক পঠিত', en: 'Most Read'    },
    { bn: 'জনপ্রিয়',      en: 'Most Popular' },
  ];
  const leftList  = tab === 0 ? mostRead : breakingNews;
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
              <div className="p-tab-item-body">
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
                  <h3 className="p-tab-main-h">{lang === 'bn' ? featured.title : (featured.title_en || featured.title)}</h3>
                </div>
              </div>
              <div className="p-tab-mini2">
                {leftList.slice(8, 10).map(a => (
                  <div key={a.id} className="p-tab-mini2-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                    <div className="p-tab-mini2-img">
                      <Img src={a.featured_image} alt={a.title} />
                    </div>
                    <h5 className="p-tab-mini2-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
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
                <h5 className="p-tab-right-h">{lang === 'bn' ? a.title : (a.title_en || a.title)}</h5>
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
              {/* <CatTag cat={hero.category} /> */}
              <h3 className="cs-hero-h">{t(hero)}</h3>
              {hero.excerpt && <p className="cs-hero-p">{hero.excerpt}</p>}
              {/* <div className="p-meta">
                {hero.author?.name && <span className="cs-author">{hero.author.name}</span>}
                <TimeTag dt={hero.published_at} lang={lang} />
              </div> */}
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
                  {/* <CatTag cat={a.category} /> */}
                  <h4 className="cs-mid-h">{t(a)}</h4>
                  {/* <div className="p-meta">
                    {a.author?.name && <span>{a.author.name}</span>}
                    <TimeTag dt={a.published_at} lang={lang} />
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — compact list (text + thumb) */}
          <div className="cs-side">
            {side.map(a => (
              <div key={a.id} className="cs-side-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                <div className="cs-side-body">
                  {/* <CatTag cat={a.category} /> */}
                  <h5 className="cs-side-h">{t(a)}</h5>
                  {/* <TimeTag dt={a.published_at} lang={lang} /> */}
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
                  {/* <CatTag cat={a.category} /> */}
                  <h5 className="cs-strip-h">{t(a)}</h5>
                  {/* <TimeTag dt={a.published_at} lang={lang} /> */}
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
                {/* <CatTag cat={a.category} /> */}
                <h4 className="cs-grid-h">{t(a)}</h4>
                {/* <div className="p-meta">
                  {a.author?.name && <span>{a.author.name}</span>}
                  <TimeTag dt={a.published_at} lang={lang} />
                </div> */}
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
              {/* <CatTag cat={a.category} /> */}
              <h4 className="cs-list-h">{t(a)}</h4>
              {a.excerpt && <p className="cs-list-p">{a.excerpt}</p>}
              {/* <div className="p-meta">
                {a.author?.name && <span>{a.author.name}</span>}
                <TimeTag dt={a.published_at} lang={lang} />
              </div> */}
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
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();

  // Data distribution — top.html hero layout
  const heroFeat    = leadArticles[0];
  const heroGrid6   = leadArticles.slice(1, 7);
  const midMain     = leadArticles[7];
  const midList     = leadArticles.slice(8, 13);
  const tabFeat     = mostRead[0] || leadArticles[0];

  const videoSec    = sections.find(s => s.type === 'videos');
  const storiesSec  = sections.find(s => s.type === 'stories');
  const catSecs     = sections.filter(s => s.type === 'category' && s.items?.length > 0);
  const stripItems  = catSecs.map(s => ({ id: s.id, slug: s.slug, name: s.title }));

  const heroStories   = storiesSec?.items ?? [];

  const seoData = buildDefaultSeo(lang);

  return (
    <div className="p-page">
      <MetaTags seo={seoData} />
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <div className="p-ad-top"><AdSlot size="leaderboard" position="home_top" /></div>

      {/* ══ NOTICE BANNER ═══════════════════════════════════════════════════ */}
      {settings.notice_enabled === 'true' && (
        <div className="home-notice-wrapper">
          <div className="home-notice">
            <div className="home-notice-inner">
              <span className="home-notice-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <span className="home-notice-text">
                {lang === 'bn'
                  ? (settings.notice_text_bn || '')
                  : (settings.notice_text_en || '')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOP 3-COLUMN BLOCK (top.html design) ═══════════════════════════ */}
      <div className="p-top-wrap">
        <HeroBlock
          feat={heroFeat}
          grid6={heroGrid6}
          midMain={midMain}
          midList={midList}
          stories={heroStories}
          lang={lang}
          nav={onNavigate}
        />
      </div>

      {/* ══ VIDEO (always after hero) ══════════════════════════════════════ */}
      {videoSec && <div className="p-body"><VideoSection items={videoSec.items} lang={lang} nav={onNavigate} /></div>}

      {/* ══ BODY ═══════════════════════════════════════════════════════════ */}
      <div className="p-body">

        {/* Tabbed most-read / popular */}
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

        {/* Category sections */}
        {catSecs.map((section, idx) => (
          <div key={section.id}>
            <CategorySection section={section} lang={lang} nav={onNavigate} />
            {/* {idx === 1 && opinions.length > 0 && <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />} */}
            {(idx + 1) % 3 === 0 && (
              <div className="p-ad-between"><AdSlot size="leaderboard" position="between_sections" /></div>
            )}
          </div>
        ))}

        {/* {catSecs.length <= 1 && opinions.length > 0 && (
          <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />
        )} */}

        {/* Ad strip */}
        <div className="p-ad-between"><AdSlot size="leaderboard" position="mid_home" /></div>

        <TagsCloud tags={popularTags} lang={lang} nav={onNavigate} />

        <div className="p-ad-bottom"><AdSlot size="billboard" position="home_bottom" /></div>
      </div>
    </div>
  );
}
