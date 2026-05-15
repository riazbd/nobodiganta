import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
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
  const excerpt = article.excerpt || '';

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
          <h4>{title}</h4>
          {excerpt && <p>{excerpt}</p>}
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
        <h3>{title}</h3>
        {excerpt && <p>{excerpt}</p>}
      </div>
    </article>
  );
}
