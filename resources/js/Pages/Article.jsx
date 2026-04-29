import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import AdSlot from '../Components/ui/AdSlot';
import ArticleShare from '../Components/article/ArticleShare';
import ArticleComments from '../Components/article/ArticleComments';
import AuthorBio from '../Components/article/AuthorBio';
import PaywallOverlay from '../Components/ui/PaywallOverlay';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { calculateReadingTime } from '../lib/readingTime';
import { relativeTime } from '../lib/formatters';

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
          <span className="tag">{item.category?.name}</span>
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
          <span className="tag">{item.category?.name}</span>
          <h4>{item.title}</h4>
          <p>{item.excerpt}</p>
          <div className="meta"><span>{relativeTime(item.published_at, lang)}</span></div>
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
  const articleUrl = window.location.href;

  return (
    <>
      <Head title={`${article.title} | ${lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}`} />

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
          <span
            className="art-category"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('cat', article.category?.slug)}
            role="link"
            tabIndex={0}
          >
            {article.category?.name}
          </span>
          <h1 className="art-h1">{article.title}</h1>
          <div className="art-sub">{article.subtitle}</div>
          <div className="art-meta">
            <span className="author"><Icon name="pen" size={16} /> {article.author?.name}</span>
            <span className="time"><Icon name="clock" size={14} /> {relativeTime(article.published_at, lang)}</span>
            <span className="time"><Icon name="eye" size={12} /> {article.views || 0} {t('article.readers', lang)}</span>
            <span style={{ fontSize: 12, color: '#888' }}>📖 {readingTimeLabel}</span>
          </div>

          {/* Share buttons */}
          <ArticleShare url={articleUrl} title={article.title} />

          {article.featured_image && (
            <div className="art-img-wrap">
              <img
                src={article.featured_image}
                alt={article.title}
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
                loading="eager"
              />
            </div>
          )}
          <div className="art-img-cap">{article.featured_image_caption}</div>
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
          <ArticleShare url={articleUrl} title={article.title} />

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
          <ArticleComments articleId={article.id} />
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
