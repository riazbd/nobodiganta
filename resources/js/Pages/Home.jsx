import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdSlot from '../Components/ui/AdSlot';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { relativeTime, toBengaliNum } from '../lib/formatters';
import Icon from '../Components/Icon';
import StoryStrip from '@/Components/StoryStrip';
import TrendingWidget from '../Components/widgets/TrendingWidget';
import ThreeColumnSection from '../features/home/ThreeColumnSection';
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
const SOCIAL_PLATFORMS = [
  { key: 'facebook_url',  label: 'Facebook',  color: '#1877f2', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { key: 'youtube_url',   label: 'YouTube',   color: '#ff0000', icon: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
  { key: 'twitter_url',   label: 'X',         color: '#000',    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { key: 'instagram_url', label: 'Instagram', color: '#e1306c', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { key: 'linkedin_url',  label: 'LinkedIn',  color: '#0a66c2', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
  { key: 'tiktok_url',    label: 'TikTok',    color: '#010101', icon: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z' },
];

function SocialFollow({ settings, lang }) {
  const platforms = SOCIAL_PLATFORMS.filter(p => settings[p.key]);
  if (!platforms.length) return null;

  return (
    <div className="hp-social-follow">
      <div className="hp-social-hd">{lang === 'bn' ? 'আমাদের ফলো করুন' : 'Follow Us'}</div>
      <div className="hp-social-btns">
        {platforms.map(({ key, label, color, icon }) => (
          <a
            key={key}
            href={settings[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="hp-social-btn"
            style={{ background: color }}
            aria-label={label}
            title={label}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
              <path d={icon} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

function HeroBlock({ feat, grid6, midMain, midList, lang, nav, settings }) {
  const t = (a) => lang === 'bn' ? a.title : (a.title_en || a.title);

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

      {/* ── RIGHT: Social follow + Trending ── */}
      <div className="hp-h3-right">
        <SocialFollow settings={settings} lang={lang} />
        <TrendingWidget />
      </div>
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
          lang={lang}
          nav={onNavigate}
          settings={settings}
        />
      </div>

      {/* ══ VIDEO (always after hero) ══════════════════════════════════════ */}
      {videoSec && <div className="p-body"><VideoSection items={videoSec.items} lang={lang} nav={onNavigate} /></div>}

      {/* ══ BODY ═══════════════════════════════════════════════════════════ */}
      <div className="p-body">

        {/* Three-column: Opinion | Poll | Stories */}
        <ThreeColumnSection stories={heroStories} />

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
