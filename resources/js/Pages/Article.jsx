import { useState, useEffect, useRef, useCallback } from 'react';
import { trackImpression, trackClick } from '../services/adService';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ROUTES } from '../lib/routes';
import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import AdSlot from '../Components/ui/AdSlot';
import ArticleThumb from '../Components/ui/ArticleThumb';
import ArticleShare from '../Components/article/ArticleShare';
import MetaTags from '../Components/seo/MetaTags';
import { NewsArticleJsonLd } from '../Components/seo/JsonLd';
import { buildArticleSeo } from '../lib/seo';
import ArticleComments from '../Components/article/ArticleComments';
import AuthorBio from '../Components/article/AuthorBio';
import VideoPlayer from '../Components/media/VideoPlayer';
import PaywallOverlay from '../Components/ui/PaywallOverlay';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { calculateReadingTime } from '../lib/readingTime';
import { relativeTime, formatDate, toBengaliNum } from '../lib/formatters';

// Parse body HTML and extract inline ad markers (new format: data-inline-ad)
function parseInlineAds(html) {
  const re = /<div([^>]*data-inline-ad[^>]*)>(?:.*?)<\/div>/gi;
  const segments = [];
  let lastIndex = 0;
  let match;
  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'html', content: html.slice(lastIndex, match.index) });
    }
    const attrStr = match[1];
    const attr = (name) => { const m = new RegExp(`${name}="([^"]*)"`, 'i').exec(attrStr); return m ? m[1] : null; };
    const rawCode = attr('data-ad-code');
    segments.push({
      type: 'ad',
      adId: attr('data-ad-id') || null,
      adType: attr('data-ad-type') || 'image',
      adSrc: attr('data-ad-src'),
      adLink: attr('data-ad-link'),
      adCode: rawCode ? decodeURIComponent(rawCode) : null,
      adTitle: attr('data-ad-title'),
      adHref: attr('data-ad-href'),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) segments.push({ type: 'html', content: html.slice(lastIndex) });
  return segments;
}

function ScriptInjector({ html, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !html) return;
    ref.current.innerHTML = '';
    try {
      const frag = document.createRange().createContextualFragment(html);
      ref.current.appendChild(frag);
    } catch {
      ref.current.innerHTML = html;
    }
  }, [html]);
  return <div ref={ref} className={className} style={style} />;
}

function InlineAdBlock({ seg }) {
  const { adId, adType, adSrc, adLink, adCode, adTitle, adHref } = seg;

  useEffect(() => {
    if (adId) trackImpression(adId);
  }, [adId]);

  const handleClick = useCallback(() => {
    if (adId) trackClick(adId);
  }, [adId]);

  const wrap = (child) => <div className="in-article-ad" style={{ margin: '24px 0', textAlign: 'center' }}>{child}</div>;

  if (adType === 'news_promo' && adHref) {
    return (
      <div className="in-article-ad" style={{ margin: '24px 0' }}>
        <a href={adHref} onClick={handleClick} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 8, textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)' }}>
          {adSrc && <img src={adSrc} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e8001e', textTransform: 'uppercase', marginBottom: 4 }}>আরও পড়ুন</div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{adTitle}</div>
          </div>
        </a>
      </div>
    );
  }

  if ((adType === 'image' || adType === 'custom_image') && adSrc) {
    const img = <img src={adSrc} alt={adTitle || 'Advertisement'} style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} loading="lazy" />;
    return wrap(adLink
      ? <a href={adLink} onClick={handleClick} target="_blank" rel="noopener noreferrer sponsored">{img}</a>
      : img
    );
  }

  if (adType === 'video' && adSrc) {
    return <div className="in-article-ad" style={{ margin: '24px 0' }}><video src={adSrc} controls style={{ width: '100%', maxHeight: 300 }} preload="none" /></div>;
  }

  if (adCode) {
    return wrap(<ScriptInjector html={adCode} />);
  }

  return null;
}

// Count block-level closing tags to find split point (handles p, li, blockquote, headings)
function splitHtmlAtBlock(rawHtml, n) {
  let count = 0, splitIdx = -1;
  const re = /<\/(p|li|blockquote|h[1-6]|td|tr)>/gi;
  let m;
  while ((m = re.exec(rawHtml)) !== null) {
    if (++count === n) { splitIdx = m.index + m[0].length; break; }
  }
  // If position not reached (short article), insert at end
  return splitIdx === -1 ? [rawHtml, ''] : [rawHtml.slice(0, splitIdx), rawHtml.slice(splitIdx)];
}

function LegacyAdBlock({ ad }) {
  useEffect(() => {
    if (ad?.id) trackImpression(ad.id);
  }, [ad?.id]);

  const handleClick = useCallback(() => {
    if (ad?.id) trackClick(ad.id);
  }, [ad?.id]);

  if (!ad) return null;

  if (ad.type === 'image' && ad.image) {
    return (
      <div className="in-article-ad" style={{ margin: '24px 0', textAlign: 'center' }}>
        <a href={ad.link || '#'} onClick={handleClick} target="_blank" rel="noopener noreferrer sponsored">
          <img src={ad.image} alt={ad.title || 'Advertisement'} style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} loading="lazy" />
        </a>
      </div>
    );
  }
  if (ad.type === 'video' && ad.video_url) {
    return <div className="in-article-ad" style={{ margin: '24px 0' }}><video src={ad.video_url} controls style={{ width: '100%', maxHeight: 300 }} preload="none" /></div>;
  }
  if (['html', 'script', 'adsense', 'google_ad', 'code'].includes(ad.type)) {
    return <div className="in-article-ad" style={{ margin: '24px 0', textAlign: 'center' }}><ScriptInjector html={ad.code || ''} /></div>;
  }
  return null;
}

function ArticleBodyWithAd({ html, ad, position = 4 }) {
  if (!html) return null;

  // New format: inline ads embedded in body HTML
  const segments = parseInlineAds(html);
  if (segments.some(s => s.type === 'ad')) {
    return (
      <>
        {segments.map((seg, i) =>
          seg.type === 'html'
            ? (seg.content ? <div key={i} className="art-body" dangerouslySetInnerHTML={{ __html: seg.content }} /> : null)
            : <InlineAdBlock key={i} seg={seg} />
        )}
      </>
    );
  }

  // Legacy: no inline ads → use sidebar-assigned ad with block-level split
  if (!ad) return <div className="art-body" dangerouslySetInnerHTML={{ __html: html }} />;

  const splitOnMarker = (rawHtml) => {
    const re = /<div[^>]*data-ad-slot[^>]*>.*?<\/div>/i;
    const m = re.exec(rawHtml);
    return m ? [rawHtml.slice(0, m.index), rawHtml.slice(m.index + m[0].length)] : null;
  };

  const [top, bottom] = splitOnMarker(html) ?? splitHtmlAtBlock(html, position);
  return (
    <>
      <div className="art-body" dangerouslySetInnerHTML={{ __html: top }} />
      <LegacyAdBlock ad={ad} />
      {bottom && <div className="art-body" dangerouslySetInnerHTML={{ __html: bottom }} />}
    </>
  );
}

export default function Article({
  article,
  relatedArticles = [],
  tagRelatedArticles = [],
  categoryMoreArticles = [],
  ads = {},
  paywall = false,
  paywallReason = null,
  meterRemaining = 0,
  meterExceeded = false,
  edition = 'bn',
  preview = false,
}) {
  const { lang, settings } = useApp();
  const { showToast } = useToast();
  const { onNavigate } = useNavigation();

  const [showPaywall, setShowPaywall] = useState(paywall);

  const articleRef = useRef(null);
  const progress = useReadingProgress(articleRef);

  if (!article) {
    return (
      <div className="article-layout">
        <div className="article-main" style={{ padding: '40px 0', textAlign: 'center', color: '#c00' }}>
          {t('error.404.title', lang)}
        </div>
        <PageSidebar />
      </div>
    );
  }

  const bodyHtml = lang === 'en' ? (article.body_en || article.body) : (article.body_bn || article.body);
  const { label: readingTimeLabel } = calculateReadingTime(bodyHtml, lang);
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const articleUrl = article?.category?.slug && article?.slug
    ? `${window.location.origin}${lang === 'en' ? '/en' : ''}/${article.category.slug}/${article.slug}`
    : window.location.href;
  const articleId = article?.id;

  // ── Share state (lifted to avoid duplicate API calls from 2 ArticleShare instances) ──
  const [shareTotal, setShareTotal] = useState(0);
  const [sharePlatforms, setSharePlatforms] = useState({});
  const [shareSharing, setShareSharing] = useState(null);

  useEffect(() => {
    if (!articleId) return;
    fetch(`/api/articles/${articleId}/shares`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setShareTotal(data.total || 0);
          setSharePlatforms(data.platforms || {});
        }
      })
      .catch(e => console.error('Share fetch error:', e));
  }, [articleId]);

  const handleShare = useCallback(async (platform) => {
    if (shareSharing || !articleId) return;
    setShareSharing(platform);
    setShareTotal(t => t + 1);
    setSharePlatforms(p => ({ ...p, [platform]: (p[platform] || 0) + 1 }));

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    try {
      const res = await fetch(`/api/articles/${articleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result?.shares_count !== undefined) setShareTotal(result.shares_count);
      } else {
        console.error('Share API error:', res.status, await res.text().catch(() => ''));
      }
    } catch (e) {
      console.error('Share API network error:', e);
    }

    setShareSharing(null);
  }, [shareSharing, articleId]);

  const shareProps = { total: shareTotal, platforms: sharePlatforms, sharing: shareSharing, onShare: handleShare };

  const seoData = buildArticleSeo(article, lang);

  return (
    <div className="art-page-wrap">
      <MetaTags seo={seoData} />
      <NewsArticleJsonLd article={article} edition={lang} />

      {/* Staff preview banner — shown when viewing a not-yet-published article */}
      {preview && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 1200,
          background: '#b45309', color: '#fff', textAlign: 'center',
          fontFamily: 'SolaimanLipi, sans-serif', fontWeight: 700, fontSize: 13.5,
          padding: '7px 14px', letterSpacing: '.01em',
        }}>
          {lang === 'bn'
            ? `প্রিভিউ — এই সংবাদটি এখনও প্রকাশিত হয়নি (${article?.status || 'draft'})। শুধু আপনি দেখছেন।`
            : `Preview — this article is not published yet (${article?.status || 'draft'}). Only you can see this.`}
        </div>
      )}

      {/* Reading progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 3,
          width: `${progress}%`,
          background: '#263238',
          zIndex: 9999,
          transition: 'width 0.1s linear',
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={lang === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading progress'}
      />

      <div className="article-3col">
        {/* Left column – meta info + related articles */}
        <aside className="art-left-col">
          {/* Breadcrumb: ⌂ / Category */}
          <nav className="art-breadcrumb" aria-label="breadcrumb">
            <span
              className="art-bc-home"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); router.visit(lang === 'en' ? '/en' : '/'); }}
              role="link"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && router.visit(lang === 'en' ? '/en' : '/')}
            >
              <Icon name="home" size={14} />
            </span>
            {article.category && (
              <>
                <span className="art-bc-sep">/</span>
                <span
                  className="art-bc-cat"
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); router.visit(ROUTES.category(article.category.slug, edition)); }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && router.visit(ROUTES.category(article.category.slug, edition))}
                >
                  {article.category.name}
                </span>
              </>
            )}
          </nav>

          {/* Author + date + edition info box */}
          <div className="art-left-meta">
            {article.author?.name && (
              <div
                className="art-left-meta-row"
                onClick={() => article.author?.slug && onNavigate('author', article.author.slug)}
                style={{ cursor: article.author?.slug ? 'pointer' : 'default' }}
              >
                <Icon name="user" size={13} style={{ marginTop: 2, color: 'var(--text-muted)', flexShrink: 0 }} />
                <span className="art-left-meta-author">{article.author.designation || t('article.staff_reporter', lang)}</span>
              </div>
            )}
            {article.secondary_author?.name && (
              <div className="art-left-meta-row">
                <Icon name="user" size={13} style={{ marginTop: 2, color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{article.secondary_author.name}</span>
              </div>
            )}
            <div className="art-left-meta-row">
              <Icon name="clock" size={13} style={{ marginTop: 2, color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>
                {t('article.published', lang)}{' '}
                {formatDate(article.published_at, lang, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/[\s ]+(এ|at)[\s ]+/, ' | ').replace(/ (am|pm)\b/i, (m, p) => ' ' + p.toUpperCase())}
              </span>
            </div>
            <div className="art-left-meta-row">
              <Icon name="eye" size={13} style={{ marginTop: 2, color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>{lang === 'bn' ? toBengaliNum(String(article.views || 0)) : (article.views || 0)} {t('article.readers', lang)}</span>
            </div>
            <div className="art-left-meta-row">
              <Icon name="book" size={13} style={{ marginTop: 2, color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>{readingTimeLabel}</span>
            </div>
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <>
              <div className="art-left-hdr">{t('article.related', lang)}</div>
              <div className="art-left-list">
                {relatedArticles.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="art-left-item"
                    onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                  >
                    <div className="art-left-img">
                      <ArticleThumb src={item.featured_image} alt={item.title || ''} isVideo={item.article_type === 'video'} width={70} height={50} />
                    </div>
                    <div className="art-left-title">{item.title}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        <article className="article-main" ref={articleRef}>
          {article.is_exclusive && (
            <span className="excl-tag excl-tag-lg">{lang === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}</span>
          )}
          <h1 className="art-h1">{article.title}</h1>
          {article.subtitle && <div className="art-sub">{article.subtitle}</div>}

          {/* Share buttons */}
          <ArticleShare url={articleUrl} title={article.title} {...shareProps} />

          {article.article_type === 'video' && article.video_url ? (
            <div className="art-video-wrap" style={{ marginBottom: 20 }}>
              <VideoPlayer
                src={article.video_url}
                provider={article.video_provider}
                title={article.title}
                poster={article.featured_image}
              />
            </div>
          ) : article.featured_image && (
            <div className="art-img-wrap">
              <img
                src={article.featured_image}
                alt={article.featured_image_alt || article.title}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', maxHeight: 420 }}
                loading="eager"
              />
              {article.featured_image_caption && (
                <div className="art-img-cap">{article.featured_image_caption}</div>
              )}
            </div>
          )}

          <ArticleBodyWithAd
            html={bodyHtml}
            ad={(() => {
              const position = article.in_article_ad_position ?? 4;
              if (article.in_article_ad) return article.in_article_ad;
              const defaultAd = ads?.in_article?.[0] ?? null;
              if (!defaultAd) return null;
              const paragraphs = (bodyHtml?.match(/<\/p>/gi) || []).length;
              return paragraphs >= position ? defaultAd : null;
            })()}
            position={article.in_article_ad_position ?? 4}
          />

          {/* Approver code name at the end of the article — just "— CODE", no label */}
          {article.approver?.code_name && (
            <div className="art-codename">— {article.approver.code_name}</div>
          )}

          <div style={{ margin: '20px 0' }}>
            <AdSlot size="leaderboard" position="article_bottom" />
          </div>

          {/* Author bio */}
          <AuthorBio article={article} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="art-tags">
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>{t('article.tags_label', lang)}</span>
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="art-tag"
                  onClick={() => onNavigate('tag', tag.slug)}
                  style={{ cursor: 'pointer' }}
                  role="link"
                  tabIndex={0}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Bottom share row */}
          <ArticleShare url={articleUrl} title={article.title} {...shareProps} />

          {/* Comments */}
          {article.allow_comments && (
            <div className="art-comments-wrap">
              <ArticleComments articleId={article.id} />
            </div>
          )}
        </article>

        <PageSidebar />
      </div>

      {/* সম্পর্কিত সংবাদ – tag-based */}
      {tagRelatedArticles.length > 0 && (
        <div className="art-bottom-section">
          <div className="art-bottom-sec-hdr">
            <span className="art-bottom-sec-hdr-label">{t('article.tag_related', lang)}</span>
          </div>
          <div className="art-bottom-grid">
            {tagRelatedArticles.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="art-bottom-card"
                onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
              >
                {item.featured_image && (
                  <div className="art-bottom-card-img">
                    <img src={item.featured_image} alt={item.title || ''} loading="lazy" />
                  </div>
                )}
                <div className="art-bottom-card-body">
                  {item.category?.name && <div className="art-bottom-card-cat">{item.category.name}</div>}
                  <div className="art-bottom-card-title">{item.title}</div>
                  {item.published_at && (
                    <div className="art-bottom-card-date">{relativeTime(item.published_at, lang)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* আরো পড়ুন – category-based */}
      {categoryMoreArticles.length > 0 && (
        <div className="art-bottom-section">
          <div className="art-bottom-sec-hdr">
            <span className="art-bottom-sec-hdr-label">{t('article.read_more', lang)}</span>
            {article.category?.name && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'SolaimanLipi',sans-serif" }}>
                — {article.category.name}
              </span>
            )}
          </div>
          <div className="art-bottom-grid">
            {categoryMoreArticles.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="art-bottom-card"
                onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
              >
                {item.featured_image && (
                  <div className="art-bottom-card-img">
                    <img src={item.featured_image} alt={item.title || ''} loading="lazy" />
                  </div>
                )}
                <div className="art-bottom-card-body">
                  {item.category?.name && <div className="art-bottom-card-cat">{item.category.name}</div>}
                  <div className="art-bottom-card-title">{item.title}</div>
                  {item.published_at && (
                    <div className="art-bottom-card-date">{relativeTime(item.published_at, lang)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paywall Overlay */}
      {showPaywall && (
        <PaywallOverlay
          reason={paywallReason || 'premium'}
          meterRemaining={meterRemaining}
          meterExceeded={meterExceeded}
          onClose={() => setShowPaywall(false)}
          onSubscribe={(plan) => {
            // TODO: Navigate to subscription page with plan selected
            showToast(lang === 'bn' ? `সাবস্ক্রিপশন: ${plan}` : `Subscription: ${plan}`);
          }}
        />
      )}
    </div>
  );
}
