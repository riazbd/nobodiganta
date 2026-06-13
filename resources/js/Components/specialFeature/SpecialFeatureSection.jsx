import ArticleThumb from '../ui/ArticleThumb';

// ─── Special Feature section — shared between the public homepage and the
// admin live preview, so both render byte-for-byte identical markup/CSS. ──────

export const SF_DEFAULTS = {
  section_bg: '#ffffff', bg_type: 'solid',
  gradient_from: '#1a56db', gradient_to: '#ffffff', gradient_angle: 135,
  bg_image: null, bg_overlay_opacity: 40, content_theme: 'light',
  header_bg: '#1a56db', header_text_color: '#ffffff',
  badge_bg: '#1a56db', badge_text_color: '#ffffff',
  badge_label_bn: 'বিশেষ', badge_label_en: 'Special',
  show_badge: true, show_excerpt: true,
  banner_image: null, show_banner: true, show_header: true, list_columns: 3,
};

// Builds the CSS `background*` properties for the section based on bg_type.
export function sfBackgroundStyle(cfg) {
  const type = cfg.bg_type || 'solid';
  if (type === 'gradient') {
    return {
      background: `linear-gradient(${cfg.gradient_angle ?? 135}deg, ${cfg.gradient_from || '#1a56db'}, ${cfg.gradient_to || '#ffffff'})`,
    };
  }
  if (type === 'image' && cfg.bg_image) {
    const op = Math.min(100, Math.max(0, cfg.bg_overlay_opacity ?? 40)) / 100;
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,${op}), rgba(0,0,0,${op})), url('${cfg.bg_image}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: cfg.section_bg || '#ffffff' };
}

// Splits items into N roughly-equal contiguous columns
export function chunkColumns(items, cols) {
  const n = Math.max(1, cols);
  const per = Math.ceil(items.length / n);
  const out = [];
  for (let i = 0; i < n; i++) out.push(items.slice(i * per, (i + 1) * per));
  return out;
}

// `nav` is optional — when omitted (e.g. the admin live preview), clicks are no-ops.
function go(a, nav) {
  if (typeof nav !== 'function') return;
  if (!a?.category?.slug || !a?.slug) return;
  nav('article', { categorySlug: a.category.slug, articleSlug: a.slug });
}

function SFHeader({ title, badge, cfg }) {
  return (
    <div className="sf-hdr" style={{ background: cfg.header_bg }}>
      {cfg.show_badge !== false && (
        <span className="sf-badge" style={{ background: cfg.badge_bg, color: cfg.badge_text_color }}>{badge}</span>
      )}
      <h2 className="sf-ttl" style={{ color: cfg.header_text_color }}>{title}</h2>
    </div>
  );
}

function SFHeroCard({ article, large, cfg, lang, nav }) {
  const label  = lang === 'bn' ? article.title : (article.title_en || article.title);
  const excerpt = lang === 'bn' ? article.excerpt : (article.excerpt_en || article.excerpt);
  return (
    <div
      className={large ? 'sf-hero' : 'sf-hero-sm'}
      onClick={() => go(article, nav)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(article, nav)}
      role="button" tabIndex={0}
    >
      <div className={large ? 'sf-hero-img' : 'sf-hero-sm-img'}>
        <ArticleThumb src={article.featured_image} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="sf-hero-body">
        <h2 className={large ? 'sf-hero-h' : 'sf-hero-sm-h'}>{label}</h2>
        {cfg.show_excerpt !== false && excerpt && large && <p className="sf-hero-p">{excerpt}</p>}
      </div>
    </div>
  );
}

function SFListItem({ article, i, lang, nav }) {
  const label = lang === 'bn' ? article.title : (article.title_en || article.title);
  return (
    <div
      className={`sf-item${i > 0 ? ' sf-item-sep' : ''}`}
      onClick={() => go(article, nav)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(article, nav)}
      role="button" tabIndex={0}
    >
      <div className="sf-item-img">
        <ArticleThumb src={article.featured_image} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="sf-item-body">
        <h4 className="sf-item-h">{label}</h4>
      </div>
    </div>
  );
}

function SFBanner({ src, alt }) {
  if (!src) return null;
  return (
    <div className="sf-banner">
      <img src={src} alt={alt || ''} loading="lazy" />
    </div>
  );
}

function SFBannerSplitHero({ article, cfg, lang, nav }) {
  const label   = lang === 'bn' ? article.title : (article.title_en || article.title);
  const excerpt = lang === 'bn' ? article.excerpt : (article.excerpt_en || article.excerpt);
  return (
    <div
      className="sf-bs-hero"
      onClick={() => go(article, nav)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(article, nav)}
      role="button" tabIndex={0}
    >
      <div className="sf-bs-hero-img">
        <ArticleThumb src={article.featured_image} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <h3 className="sf-bs-hero-h">{label}</h3>
      {cfg.show_excerpt !== false && excerpt && <p className="sf-bs-hero-p">{excerpt}</p>}
    </div>
  );
}

function SFColumnLink({ article, lang, nav }) {
  const label = lang === 'bn' ? article.title : (article.title_en || article.title);
  return (
    <div
      className="sf-col-item"
      onClick={() => go(article, nav)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(article, nav)}
      role="button" tabIndex={0}
    >
      <div className="sf-col-img">
        <ArticleThumb src={article.featured_image} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="sf-col-link">{label}</div>
    </div>
  );
}

function SFGridItem({ article, lang, nav }) {
  const label = lang === 'bn' ? article.title : (article.title_en || article.title);
  return (
    <div
      className="sf-grid-item"
      onClick={() => go(article, nav)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(article, nav)}
      role="button" tabIndex={0}
    >
      <div className="sf-grid-img">
        <ArticleThumb src={article.featured_image} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <h4 className="sf-grid-item-h">{label}</h4>
    </div>
  );
}

// `section` shape: { title, title_bn, title_en, type, layout, config, items: [...] }
export default function SpecialFeatureSection({ section, lang, nav }) {
  const items  = section.items || [];
  if (!items.length) return null;

  const cfg    = { ...SF_DEFAULTS, ...(section.config || {}) };
  const layout = section.layout || 'hero_list';
  const title  = lang === 'bn' ? (section.title_bn || section.title || 'বিশেষ প্রতিবেদন') : (section.title_en || section.title_bn || 'Special Feature');
  const badge  = lang === 'bn' ? (cfg.badge_label_bn || 'বিশেষ') : (cfg.badge_label_en || 'Special');
  const hero   = items[0];
  const rest   = items.slice(1);

  return (
    <div className={`sf-section${cfg.content_theme === 'dark' ? ' sf-theme-dark' : ''}`} style={sfBackgroundStyle(cfg)}>
      {cfg.show_banner !== false && <SFBanner src={cfg.banner_image} alt={title} />}
      {cfg.show_header !== false && <SFHeader title={title} badge={badge} cfg={cfg} />}

      {layout === 'banner_split' && (
        <div className="sf-body sf-layout-bannersplit">
          {hero && <SFBannerSplitHero article={hero} cfg={cfg} lang={lang} nav={nav} />}
          <div className="sf-cols" style={{ gridTemplateColumns: `repeat(${cfg.list_columns || 3}, 1fr)` }}>
            {chunkColumns(rest, cfg.list_columns || 3).map((col, i) => (
              <div className="sf-col" key={i}>
                {col.map(a => <SFColumnLink key={a.id} article={a} lang={lang} nav={nav} />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === 'hero_list' && (
        <div className="sf-body sf-layout-herolist">
          {hero && <SFHeroCard article={hero} large cfg={cfg} lang={lang} nav={nav} />}
          <div className="sf-list">
            {rest.map((a, i) => <SFListItem key={a.id} article={a} i={i} lang={lang} nav={nav} />)}
          </div>
        </div>
      )}

      {layout === 'hero_grid' && (
        <div className="sf-body sf-layout-herogrid">
          {hero && <SFHeroCard article={hero} large cfg={cfg} lang={lang} nav={nav} />}
          <div className="sf-grid-2x2">
            {rest.slice(0, 4).map(a => <SFGridItem key={a.id} article={a} lang={lang} nav={nav} />)}
          </div>
        </div>
      )}

      {layout === 'full_grid' && (
        <div className="sf-body sf-layout-fullgrid">
          {items.map(a => <SFGridItem key={a.id} article={a} lang={lang} nav={nav} />)}
        </div>
      )}

      {layout === 'big_hero' && (
        <div className="sf-body sf-layout-bighero">
          {hero && (
            <div
              className="sf-bighero"
              onClick={() => go(hero, nav)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go(hero, nav)}
              role="button" tabIndex={0}
            >
              <div className="sf-bighero-img">
                <ArticleThumb src={hero.featured_image} alt={lang === 'bn' ? hero.title : (hero.title_en || hero.title)} style={{ width: '100%', height: '100%' }} />
              </div>
              <div className="sf-bighero-body">
                <h2 className="sf-bighero-h">{lang === 'bn' ? hero.title : (hero.title_en || hero.title)}</h2>
                {cfg.show_excerpt !== false && (lang === 'bn' ? hero.excerpt : (hero.excerpt_en || hero.excerpt)) && (
                  <p className="sf-hero-p">{lang === 'bn' ? hero.excerpt : (hero.excerpt_en || hero.excerpt)}</p>
                )}
              </div>
            </div>
          )}
          <div className="sf-strip">
            {rest.map(a => <SFGridItem key={a.id} article={a} lang={lang} nav={nav} />)}
          </div>
        </div>
      )}
    </div>
  );
}
