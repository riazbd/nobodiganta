import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdSlot from '../Components/ui/AdSlot';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { relativeTime, formatViews, toBengaliNum } from '../lib/formatters';

// ─── tiny helpers ──────────────────────────────────────────────────────────────

function go(article, nav) {
  if (!article?.category?.slug || !article?.slug) return;
  nav('article', { categorySlug: article.category.slug, articleSlug: article.slug });
}

function Img({ src, alt, h, w, style = {} }) {
  const base = { objectFit: 'cover', display: 'block', ...style };
  if (w) base.width = w;
  if (h) base.height = h;
  if (!w) base.width = '100%';
  return src
    ? <img src={src} alt={alt || ''} loading="lazy" style={base} />
    : <div className="ph" style={{ height: h || 160, width: w || '100%' }}>📰</div>;
}

// ─── LEAD HERO (left col top) ─────────────────────────────────────────────────

function Hero({ article, lang, nav }) {
  if (!article) return null;
  return (
    <div className="hp-hero" onClick={() => go(article, nav)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && go(article, nav)}>
      <Img src={article.featured_image} alt={article.title} h={390} style={{ width: '100%' }} />
      <div className="hp-hero-cap">
        {article.category && <span className="hp-hero-cat">{article.category.name}</span>}
        <h2>{article.title}</h2>
        {article.excerpt && <p>{article.excerpt}</p>}
        <div className="hp-hero-meta">
          {article.author?.name && <span>{article.author.name}</span>}
          <span>{relativeTime(article.published_at, lang)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── BREAKING STRIP ───────────────────────────────────────────────────────────

function BreakingStrip({ items, lang, nav }) {
  if (!items.length) return null;
  return (
    <div className="hp-brk-strip">
      {items.slice(0, 5).map((a, i) => (
        <div key={a.id} className="hp-brk-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
          <span className="hp-brk-n">{lang === 'bn' ? toBengaliNum(i + 1) : i + 1}</span>
          <span className="hp-brk-t">{a.title}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 2×2 MINI GRID ───────────────────────────────────────────────────────────

function MiniGrid({ items, lang, nav }) {
  const list = items.slice(0, 4);
  if (!list.length) return null;
  return (
    <div className="hp-mini">
      {list.map(a => (
        <div key={a.id} className="hp-mini-item" onClick={() => go(a, nav)} role="button" tabIndex={0}>
          <Img src={a.featured_image} alt={a.title} h={54} w={72} style={{ flexShrink: 0, borderRadius: 2 }} />
          <div className="hp-mini-body">
            {a.category && <span className="hp-mini-cat">{a.category.name}</span>}
            <h5 className="hp-mini-h">{a.title}</h5>
            <span className="hp-mini-time">{relativeTime(a.published_at, lang)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MIDDLE STORY (top of middle col) ────────────────────────────────────────

function MiddleHero({ article, lang, nav }) {
  if (!article) return null;
  return (
    <div className="hp-mid-hero" onClick={() => go(article, nav)} role="button" tabIndex={0}>
      <Img src={article.featured_image} alt={article.title} h={188} style={{ width: '100%' }} />
      <div className="hp-mid-body">
        {article.category && <span className="hp-mid-cat">{article.category.name}</span>}
        <h3 className="hp-mid-h">{article.title}</h3>
        {article.excerpt && <p className="hp-mid-p">{article.excerpt}</p>}
        <div className="hp-mid-meta">
          {article.author?.name && <span>{article.author.name}</span>}
          <span>{relativeTime(article.published_at, lang)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MIDDLE LIST (text-only list under mid-hero) ──────────────────────────────

function MiddleList({ items, lang, nav }) {
  if (!items.length) return null;
  return (
    <div className="hp-mid-list">
      {items.map(a => (
        <div key={a.id} className="hp-mid-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
          <div className="hp-mid-img-wrap">
            <Img src={a.featured_image} alt={a.title} h={60} w={84} />
          </div>
          <div>
            {a.category && <span className="hp-mid-cat">{a.category.name}</span>}
            <h5 className="hp-mid-row-h">{a.title}</h5>
            <span className="hp-mid-time">{relativeTime(a.published_at, lang)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PHOTO STRIP ──────────────────────────────────────────────────────────────

function PhotoStrip({ items, nav }) {
  const photos = items.filter(a => a.featured_image).slice(0, 4);
  if (!photos.length) return null;
  return (
    <div className="hp-photo-strip">
      {photos.map(a => (
        <div key={a.id} className="hp-ps" onClick={() => go(a, nav)} role="button" tabIndex={0}>
          <img src={a.featured_image} alt={a.title} />
          <div className="hp-ps-cap">{a.title}</div>
        </div>
      ))}
    </div>
  );
}

// ─── WEATHER WIDGET ───────────────────────────────────────────────────────────

// ─── OPINION WIDGET (right col) ───────────────────────────────────────────────

function OpinionWidget({ opinions, nav, lang }) {
  if (!opinions.length) return null;
  return (
    <div className="hp-widget">
      <div className="hp-wgt-hd hp-wgt-orange">{lang === 'bn' ? 'মতামত' : 'Opinion'}</div>
      <div className="hp-wgt-bd">
        {opinions.slice(0, 4).map(op => (
          <div key={op.id} className="hp-op-row" onClick={() => nav('article', { categorySlug: op.category?.slug, articleSlug: op.slug })} role="button" tabIndex={0}>
            <div className="hp-op-av">
              {op.author?.image
                ? <img src={op.author.image} alt={op.author.name} />
                : <div className="ph" style={{ width: '100%', height: '100%', fontSize: 18 }}>👤</div>}
            </div>
            <div className="hp-op-body">
              <div className="hp-op-name">{op.author?.name || ''}</div>
              <div className="hp-op-title">{op.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION HEADER with subcategory pills ────────────────────────────────────

function SecHeader({ title, slug, subcategories = [], lang, nav, activeSubcat, onSubcat }) {
  return (
    <div className="hp-sec-hdr">
      <div className="hp-sec-top">
        <h2 className="hp-sec-ttl" onClick={() => slug && nav('category', slug)} style={{ cursor: slug ? 'pointer' : 'default' }}>
          {title}
        </h2>
        {slug && (
          <span className="hp-sec-more" onClick={() => nav('category', slug)}>
            {lang === 'bn' ? 'আরও »' : 'More »'}
          </span>
        )}
      </div>
      {subcategories.length > 0 && (
        <div className="hp-subcats">
          <span
            className={`hp-subcat-pill${!activeSubcat ? ' active' : ''}`}
            onClick={() => onSubcat(null)}
          >
            {lang === 'bn' ? 'সব' : 'All'}
          </span>
          {subcategories.map(sc => (
            <span
              key={sc.id}
              className={`hp-subcat-pill${activeSubcat === sc.slug ? ' active' : ''}`}
              onClick={() => onSubcat(sc.slug)}
            >
              {sc.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CATEGORY SECTION (body main) ─────────────────────────────────────────────

function CategorySection({ section, lang, nav }) {
  const [activeSub, setActiveSub] = useState(null);
  const allItems = section.items || [];
  if (!allItems.length) return null;

  const displayItems = activeSub
    ? allItems.filter(a => a.subcategory?.slug === activeSub)
    : allItems;

  const isEmpty = activeSub && displayItems.length === 0;
  const [main, ...rest] = displayItems;

  return (
    <div className="hp-cat-sec">
      <SecHeader
        title={section.title}
        slug={section.slug}
        subcategories={section.subcategories || []}
        lang={lang}
        nav={nav}
        activeSubcat={activeSub}
        onSubcat={setActiveSub}
      />

      {isEmpty && (
        <div className="hp-tab-empty">
          {lang === 'bn' ? 'এই বিভাগে কোনো সংবাদ নেই।' : 'No articles in this subcategory.'}
        </div>
      )}

      {/* Featured-left (default and explicit) */}
      {!isEmpty && (!section.layout || section.layout === 'featured_left') && (
        <div className="hp-feat-row">
          {/* Left: main featured */}
          <div className="hp-feat-main" onClick={() => go(main, nav)} role="button" tabIndex={0}>
            <Img src={main.featured_image} alt={main.title} h={220} style={{ width: '100%', borderRadius: 2 }} />
            <div className="hp-feat-body">
              {main.category && <span className="tag">{main.category.name}</span>}
              {main.subcategory && <span className="tag" style={{ marginLeft: 4, color: '#666' }}>› {main.subcategory.name}</span>}
              <h3 className="hp-feat-h">{main.title}</h3>
              {main.excerpt && <p className="hp-feat-p">{main.excerpt}</p>}
              <div className="meta">
                {main.author?.name && <span style={{ fontWeight: 600 }}>{main.author.name}</span>}
                <span>{relativeTime(main.published_at, lang)}</span>
              </div>
              {main.tags?.length > 0 && (
                <div className="hp-art-tags">
                  {main.tags.slice(0, 3).map(t => (
                    <span key={t.id} className="hp-art-tag" onClick={e => { e.stopPropagation(); nav('topic', t.slug); }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: list items */}
          <div className="hp-feat-list">
            {rest.slice(0, 5).map(a => (
              <div key={a.id} className="hp-list-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                <div className="hp-list-img">
                  <Img src={a.featured_image} alt={a.title} h={65} w={92} />
                </div>
                <div className="hp-list-body">
                  <div className="hp-list-cats">
                    {a.category && <span className="tag">{a.category.name}</span>}
                    {a.subcategory && <span className="hp-sub-tag">› {a.subcategory.name}</span>}
                  </div>
                  <h5 className="hp-list-h">{a.title}</h5>
                  <div className="meta">
                    {a.author?.name && <span style={{ fontWeight: 600 }}>{a.author.name}</span>}
                    <span>{relativeTime(a.published_at, lang)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Extra items as simple links */}
            {rest.slice(5, 8).map(a => (
              <div key={a.id} className="hp-extra-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
                {a.category && <span className="tag" style={{ marginRight: 6 }}>{a.category.name}</span>}
                <span className="hp-extra-t">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {!isEmpty && section.layout === 'grid' && (
        <div className="hp-grid3">
          {displayItems.slice(0, 6).map(a => (
            <article key={a.id} className="card" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <Img src={a.featured_image} alt={a.title} h={160} style={{ width: '100%' }} />
              <div className="cb">
                {a.category && <span className="tag">{a.category.name}</span>}
                <h3>{a.title}</h3>
                {a.excerpt && <p>{a.excerpt}</p>}
                <div className="meta">
                  {a.author?.name && <span style={{ fontWeight: 600 }}>{a.author.name}</span>}
                  <span>{relativeTime(a.published_at, lang)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* List */}
      {!isEmpty && section.layout === 'list' && (
        <div>
          {displayItems.slice(0, 6).map(a => (
            <div key={a.id} className="li" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <Img src={a.featured_image} alt={a.title} h={68} w={100} style={{ flexShrink: 0 }} />
              <div>
                <div>
                  {a.category && <span className="tag">{a.category.name}</span>}
                  {a.subcategory && <span className="hp-sub-tag">› {a.subcategory.name}</span>}
                </div>
                <h4>{a.title}</h4>
                <div className="meta">
                  {a.author?.name && <span style={{ fontWeight: 600 }}>{a.author.name}</span>}
                  <span>{relativeTime(a.published_at, lang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Grid */}
      {!isEmpty && section.layout === 'video_grid' && (
        <div className="hp-vid-grid">
          {displayItems.slice(0, 6).map(a => (
            <div key={a.id} className="hp-vid-card" onClick={() => go(a, nav)} role="button" tabIndex={0}>
              <div className="hp-vid-thumb">
                <Img src={a.featured_image} alt={a.title} h={136} style={{ width: '100%' }} />
                <div className="hp-vid-play">▶</div>
              </div>
              <div className="hp-vid-body">
                {a.category && <span className="tag">{a.category.name}</span>}
                {a.subcategory && <span className="hp-sub-tag">› {a.subcategory.name}</span>}
                <h5 className="hp-vid-h">{a.title}</h5>
                <div className="meta"><span>{relativeTime(a.published_at, lang)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OPINION ROW (full-width columnist strip) ─────────────────────────────────

function OpinionRow({ opinions, lang, nav }) {
  if (!opinions.length) return null;
  return (
    <div className="hp-opinion-row">
      <div className="hp-sec-hdr">
        <div className="hp-sec-top">
          <h2 className="hp-sec-ttl">{lang === 'bn' ? 'মতামত' : 'Opinion'}</h2>
          <span className="hp-sec-more" onClick={() => nav('category', 'opinion')}>{lang === 'bn' ? 'আরও »' : 'More »'}</span>
        </div>
      </div>
      <div className="hp-op-grid">
        {opinions.slice(0, 4).map(op => (
          <div key={op.id} className="hp-op-card" onClick={() => nav('article', { categorySlug: op.category?.slug, articleSlug: op.slug })} role="button" tabIndex={0}>
            <div className="hp-op-card-av">
              {op.author?.image
                ? <img src={op.author.image} alt={op.author.name} />
                : <div className="ph" style={{ width: '100%', height: '100%', fontSize: 28 }}>👤</div>}
            </div>
            <div className="hp-op-card-name">{op.author?.name || ''}</div>
            <div className="hp-op-card-desg">{op.author?.designation || (lang === 'bn' ? 'কলামিস্ট' : 'Columnist')}</div>
            <h5 className="hp-op-card-title">{op.title}</h5>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIDEO SECTION ────────────────────────────────────────────────────────────

function VideoSection({ section, lang, nav }) {
  const items = (section.items || []).slice(0, 4);
  if (!items.length) return null;
  return (
    <div className="hp-cat-sec">
      <div className="hp-sec-hdr">
        <div className="hp-sec-top">
          <h2 className="hp-sec-ttl">{section.title || (lang === 'bn' ? 'ভিডিও' : 'Video')}</h2>
        </div>
      </div>
      <div className="hp-vid-grid">
        {items.map(a => (
          <div key={a.id} className="hp-vid-card" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <div className="hp-vid-thumb">
              <Img src={a.featured_image} alt={a.title} h={136} style={{ width: '100%' }} />
              <div className="hp-vid-play">▶</div>
            </div>
            <div className="hp-vid-body">
              {a.category && <span className="tag">{a.category.name}</span>}
              <h5 className="hp-vid-h">{a.title}</h5>
              <div className="meta"><span>{relativeTime(a.published_at, lang)}</span></div>
            </div>
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
    <div className="hp-tags-sec">
      <div className="hp-sec-hdr">
        <div className="hp-sec-top">
          <h2 className="hp-sec-ttl">{lang === 'bn' ? 'জনপ্রিয় বিষয়' : 'Popular Topics'}</h2>
        </div>
      </div>
      <div className="hp-tags-cloud">
        {tags.map(t => (
          <span
            key={t.id}
            className="hp-tag-chip"
            onClick={() => nav('topic', t.slug)}
            role="button" tabIndex={0}
          >
            {t.name}
            {t.count > 0 && <span className="hp-tag-cnt">{lang === 'bn' ? toBengaliNum(t.count) : t.count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── TRENDING WIDGET (right col) ─────────────────────────────────────────────

function TrendingWidget({ articles, nav, lang }) {
  if (!articles.length) return null;
  return (
    <div className="hp-widget">
      <div className="hp-wgt-hd hp-wgt-red2">{lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}</div>
      <div className="hp-wgt-bd">
        {articles.slice(0, 10).map((a, i) => (
          <div key={a.id} className="hp-tr-row" onClick={() => go(a, nav)} role="button" tabIndex={0}>
            <span className={`hp-tr-n${i === 0 ? ' hot' : ''}`}>{lang === 'bn' ? toBengaliNum(i + 1) : i + 1}</span>
            <span className="hp-tr-t">{a.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SIDEBAR: Prayer Times ────────────────────────────────────────────────────

// ─── STOCK MARKET STRIP ───────────────────────────────────────────────────────


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home({
  leadArticles = [],
  breakingNews = [],
  sections     = [],
  opinions     = [],
  mostRead     = [],
  popularTags  = [],
}) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const hero         = leadArticles[0];
  const midHero      = leadArticles[1];
  const midListItems = leadArticles.slice(2, 7);
  const miniItems    = leadArticles.slice(7, 11);

  const videoSection     = sections.find(s => s.type === 'videos');
  const categorySections = sections.filter(s => s.type === 'category' && (s.items?.length ?? 0) > 0);

  return (
    <div>
      <Head title={lang === 'bn' ? 'নব দিগন্ত | বিশ্বস্ত সংবাদের উৎস' : 'Nobo Digonto | Trusted News'} />

      {/* ── Top leaderboard ── */}
      <div className="hp-ad-top"><AdSlot size="leaderboard" position="home_top" /></div>

      {/* ═══════════════════════════════════════
          TOP SECTION — 3 columns
          Left: hero + breaking + mini-grid
          Mid:  2nd story + list + photo strip
          Right: weather + opinion + trending + poll
          ═══════════════════════════════════════ */}
      <div className="hp-top3">

        {/* LEFT COLUMN */}
        <div className="hp-lcol">
          <Hero article={hero} lang={lang} nav={onNavigate} />
          <BreakingStrip items={breakingNews} lang={lang} nav={onNavigate} />
          <MiniGrid items={miniItems} lang={lang} nav={onNavigate} />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="hp-mcol">
          <MiddleHero article={midHero} lang={lang} nav={onNavigate} />
          <MiddleList items={midListItems} lang={lang} nav={onNavigate} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="hp-rcol">
          <OpinionWidget opinions={opinions} nav={onNavigate} lang={lang} />
          <TrendingWidget articles={mostRead} nav={onNavigate} lang={lang} />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BODY — main (70%) + sidebar (30%)
          ═══════════════════════════════════════ */}
      <div className="hp-body">

        {/* MAIN COLUMN */}
        <div className="hp-body-main">


          {categorySections.map((section, idx) => (
            <div key={section.id}>
              <CategorySection section={section} lang={lang} nav={onNavigate} />

              {/* Opinion row after 2nd section */}
              {idx === 1 && opinions.length > 0 && (
                <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />
              )}

              {/* Ad every 3 sections */}
              {(idx + 1) % 3 === 0 && (
                <div className="hp-ad-between"><AdSlot size="leaderboard" position="between_sections" /></div>
              )}


            </div>
          ))}

          {/* Fallback opinion row */}
          {categorySections.length <= 1 && opinions.length > 0 && (
            <OpinionRow opinions={opinions} lang={lang} nav={onNavigate} />
          )}

          {/* Video section */}
          {videoSection && <VideoSection section={videoSection} lang={lang} nav={onNavigate} />}

          {/* Tags cloud */}
          <TagsCloud tags={popularTags} lang={lang} nav={onNavigate} />


        </div>

        {/* SIDEBAR */}
        <div className="hp-body-side">
          <div className="sidebar">
          </div>
        </div>
      </div>
    </div>
  );
}
