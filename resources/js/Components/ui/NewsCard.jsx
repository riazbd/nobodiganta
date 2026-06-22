import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import Icon from '../Icon';
import ArticleThumb from './ArticleThumb';

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

  const imgSrc  = article.featured_image;
  const title   = article.title || '';
  const excerpt = article.excerpt || '';
  const isVideo = article.article_type === 'video';

  if (variant === 'list') {
    return (
      <div
        className="li"
        onClick={handleClick}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <ArticleThumb src={imgSrc} alt={title} isVideo={isVideo} width={100} height={imgH || 70} />
        <div>
          {article.is_exclusive && <span className="excl-tag excl-tag-sm">{lang === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}</span>}
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
          <ArticleThumb src={imgSrc} alt={title} isVideo={isVideo} width={70} height={50} />
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
          <ArticleThumb src={imgSrc} alt={title} isVideo height={imgH || 130} />
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
      <ArticleThumb src={imgSrc} alt={title} isVideo={isVideo} height={imgH || 185} />
      <div className="cb">
        {article.is_exclusive && <span className="excl-tag">{lang === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}</span>}
        <h3>{title}</h3>
        {excerpt && <p>{excerpt}</p>}
      </div>
    </article>
  );
}
