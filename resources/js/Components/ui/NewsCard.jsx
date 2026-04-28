import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { relativeTime, formatViews } from '../../lib/formatters';

/**
 * Unified news card — works with toAPIArray() article shape.
 * variants: 'featured' | 'list' | 'compact' | 'video'
 */
export default function NewsCard({ article, variant = 'featured', imgH }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const handleClick = () => {
    if (!article?.category?.slug || !article?.slug) return;
    onNavigate('article', { categorySlug: article.category.slug, articleSlug: article.slug });
  };

  if (!article) return null;

  const imgSrc = article.featured_image;
  const title  = article.title || '';
  const catName = article.category?.name || '';
  const excerpt = article.excerpt || '';
  const timeStr = relativeTime(article.published_at, lang);
  const viewStr = article.views ? formatViews(article.views, lang) : '';

  function Img({ h, style = {} }) {
    return imgSrc
      ? <img src={imgSrc} alt={title} loading="lazy" style={{ width: '100%', height: h, objectFit: 'cover', display: 'block', ...style }} />
      : <div className="ph" style={{ height: h }}>📰</div>;
  }

  if (variant === 'list') {
    return (
      <div
        className="li"
        onClick={handleClick}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <Img h={imgH || 70} style={{ width: 100, height: imgH || 70, flexShrink: 0 }} />
        <div>
          {catName && <span className="tag">{catName}</span>}
          <h4>{title}</h4>
          {excerpt && <p>{excerpt}</p>}
          <div className="meta"><span>{timeStr}</span></div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className="sub-compact-item"
        onClick={handleClick}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <div className="sc-img">
          <Img h={50} style={{ width: 70, height: 50 }} />
        </div>
        <div className="sc-text">
          <h4>{title}</h4>
          <div className="sc-time">{timeStr}</div>
        </div>
      </div>
    );
  }

  if (variant === 'video') {
    return (
      <div onClick={handleClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>
        <div className="vid-thumb">
          <Img h={imgH || 130} />
          <div className="play-btn">▶</div>
        </div>
        <div className="vid-info"><h4>{title}</h4></div>
      </div>
    );
  }

  // default: 'featured'
  return (
    <article
      className="card"
      onClick={handleClick}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <Img h={imgH || 185} />
      <div className="cb">
        {catName && <span className="tag">{catName}</span>}
        <h3>{title}</h3>
        {excerpt && <p>{excerpt}</p>}
        <div className="meta">
          <span>{timeStr}</span>
          {viewStr && <span className="views">👁 {viewStr}</span>}
        </div>
      </div>
    </article>
  );
}
