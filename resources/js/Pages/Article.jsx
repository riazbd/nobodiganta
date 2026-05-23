import { useState, useEffect, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ROUTES } from '../lib/routes';
import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import AdSlot from '../Components/ui/AdSlot';
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
import { relativeTime, toBengaliNum } from '../lib/formatters';

export default function Article({ 
  article,
  relatedArticles = [],
  paywall = false,
  paywallReason = null,
  meterRemaining = 0,
  meterExceeded = false,
  edition = 'bn'
}) {
  const { lang } = useApp();
  const { showToast } = useToast();
  const { onNavigate } = useNavigation();

  const [showPaywall, setShowPaywall] = useState(paywall);

  const articleRef = useRef(null);
  const progress = useReadingProgress(articleRef);

  const f = (item, field) => {
    if (!item) return '';
    return lang === 'en' ? (item[field + 'En'] || item[field] || '') : (item[field] || '');
  };

  const ni = (item, w, h) => {
    if (!item) return null;
    if (item.featured_image) {
      return <img src={item.featured_image} style={{ width: w, height: h, objectFit: 'cover', display: 'block', flexShrink: 0 }} loading="lazy" alt={item.title || ''} />;
    }
    return <div className="ph" style={{ width: w, height: h, flexShrink: 0 }}>📰</div>;
  };

  const secHdr = (title) => (
    <div className="sec-hdr"><div className="sec-ttl">{title}</div></div>
  );

  const cardHTML = (item, imgH = 160) => {
    if (!item) return null;
    return (
      <article className="card" onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })} key={item.id} role="button" tabIndex={0}>
        {ni(item, '100%', imgH)}
        <div className="cb">
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
        </div>
      </article>
    );
  };

  const liHTML = (item) => {
    if (!item) return null;
    return (
      <div className="li" onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })} key={item.id} role="button" tabIndex={0}>
        {ni(item, '100px', 70)}
        <div>
          <h4>{item.title}</h4>
          <p>{item.excerpt}</p>
        </div>
      </div>
    );
  };

  if (!article) {
    return (
      <div className="article-layout">
        <div className="article-main" style={{ padding: '40px 0', textAlign: 'center', color: '#c00' }}>
          {lang === 'bn' ? 'সংবাদটি পাওয়া যায়নি' : 'Article not found'}
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
    <>
      <MetaTags seo={seoData} />
      <NewsArticleJsonLd article={article} edition={lang} />

      {/* Reading progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 3,
          width: `${progress}%`,
          background: '#c00',
          zIndex: 9999,
          transition: 'width 0.1s linear',
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={lang === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading progress'}
      />

      <div className="article-layout">
        <article className="article-main" ref={articleRef}>
          <nav aria-label="category breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, marginBottom: 10, lineHeight: 1 }}>
            {(() => {
              const allCats = article.categories || [];

              const buildChains = () => {
                if (allCats.length === 0) {
                  return article.category ? [[article.category]] : [];
                }
                const catMap = {};
                allCats.forEach(c => { catMap[c.id] = c; });

                const parentIds = new Set(allCats.map(c => c.parent_id).filter(Boolean));
                const leaves = allCats.filter(c => !parentIds.has(c.id));
                const primaryLeaf = leaves.find(c => c.is_primary) || leaves[0];
                const orderedLeaves = primaryLeaf
                  ? [primaryLeaf, ...leaves.filter(c => c.id !== primaryLeaf.id)]
                  : leaves;

                return orderedLeaves.map(leaf => {
                  const chain = [];
                  let cur = leaf;
                  const seen = new Set();
                  while (cur && !seen.has(cur.id)) {
                    chain.unshift(cur);
                    seen.add(cur.id);
                    cur = cur.parent_id ? catMap[cur.parent_id] : null;
                  }
                  return chain;
                });
              };

              const chains = buildChains();

              const ChevronRight = () => (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  style={{ flexShrink: 0, display: 'block' }}>
                  <path d="M4 2.5L7.5 6L4 9.5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              );

              const catStyle = {
                color: 'var(--red)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              };

              const ancestorStyle = {
                ...catStyle,
                color: '#888',
                fontWeight: 600,
              };

              // Resolve the correct URL for a category in a chain.
              // Saradesh and its children have dedicated /saradesh/... routes.
              const resolveCatUrl = (chain, index) => {
                if (chain[0]?.slug === 'saradesh') {
                  const divSlug  = chain[1]?.slug?.replace('division-', '');
                  const distSlug = chain[2]?.slug?.replace('district-', '');
                  const uzSlug   = chain[3]?.slug?.replace('upazila-', '');
                  if (index === 0) return ROUTES.location(edition);
                  if (index === 1 && divSlug)  return ROUTES.locationDiv(divSlug, edition);
                  if (index === 2 && distSlug) return ROUTES.locationDist(divSlug, distSlug, edition);
                  if (index === 3 && uzSlug)   return ROUTES.locationUpazila(divSlug, distSlug, uzSlug, edition);
                }
                return ROUTES.category(chain[index].slug, edition);
              };

              return chains.map((chain, chainIdx) => (
                <span key={chainIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {chainIdx > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 6px', color: '#ddd', fontSize: 13, lineHeight: 1, userSelect: 'none' }}>|</span>
                  )}
                  {chain.map((c, i) => {
                    const url = resolveCatUrl(chain, i);
                    return (
                      <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {i > 0 && <ChevronRight />}
                        <span
                          style={i === chain.length - 1 ? catStyle : ancestorStyle}
                          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); router.visit(url); }}
                          role="link"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && router.visit(url)}
                        >
                          {c.name}
                        </span>
                      </span>
                    );
                  })}
                </span>
              ));
            })()}
          </nav>
          <h1 className="art-h1">{article.title}</h1>
          <div className="art-sub">{article.subtitle}</div>
          <div className="art-meta">
            <span
              className="author"
              style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: article.author?.slug ? 'pointer' : 'default' }}
              onClick={() => article.author?.slug && onNavigate('author', article.author.slug)}
              role={article.author?.slug ? 'link' : undefined}
              tabIndex={article.author?.slug ? 0 : undefined}
              onKeyDown={e => e.key === 'Enter' && article.author?.slug && onNavigate('author', article.author.slug)}
            >
              {article.author?.image ? (
                <img
                  src={article.author.image}
                  alt={article.author.name}
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                  {article.author?.name?.charAt(0)}
                </div>
              )}
              {article.author?.name}
            </span>
            <span className="time"><Icon name="clock" size={14} /> {relativeTime(article.published_at, lang)}</span>
            <span className="time"><Icon name="eye" size={12} /> {lang === 'bn' ? toBengaliNum(String(article.views || 0)) : (article.views || 0)} {t('article.readers', lang)}</span>
            <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="book" size={14} /> {readingTimeLabel}
            </span>
          </div>

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
          <div className="art-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          <div style={{ margin: '30px 0' }}>
            <AdSlot size="leaderboard" position="article_bottom" />
          </div>

          {/* Author bio */}
          <AuthorBio article={article} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="art-tags">
              <span style={{ fontSize: 12, color: '#888', marginRight: 4 }}>{t('article.tags_label', lang)}</span>
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

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="rel-news">
              {secHdr(t('article.related', lang))}
              <div className="g2">
                {relatedArticles.slice(0, 2).map((item) => cardHTML(item, 160))}
              </div>
              <div style={{ marginTop: 10 }}>
                {relatedArticles.slice(2, 4).map((item) => liHTML(item))}
              </div>
            </div>
          )}

          {/* Comments */}
          {article.allow_comments && <ArticleComments articleId={article.id} />}
        </article>

        <PageSidebar />
      </div>

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
    </>
  );
}
