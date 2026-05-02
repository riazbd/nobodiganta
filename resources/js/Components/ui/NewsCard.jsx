import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { relativeTime, formatViews } from '../../lib/formatters';
import Icon from '../Icon';

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
          <div className="play-btn"><Icon name="play" size={16} /></div>
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
        <div className="meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {article.author?.image ? (
              <img src={article.author.image} alt={article.author.name} style={{ width: 18, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 'bold' }}>
                {article.author?.name?.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>{article.author?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{timeStr}</span>
            {viewStr && <span className="views">👁 {viewStr}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
