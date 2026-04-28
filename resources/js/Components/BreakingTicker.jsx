import { t } from '../translations';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function BreakingTicker({ lang }) {
  const { globalBreakingNews = [] } = useApp();
  const { onNavigate } = useNavigation();
  
  if (globalBreakingNews.length === 0) {
    return null; // Don't show ticker if no breaking news
  }

  return (
    <div id="breaking">
      <div className="wrap">
        <span className="brk-lbl">{t('breaking.label', lang)}</span>
        <div className="brk-ticker">
          <span className="brk-inner">
            {globalBreakingNews.map((item, i) => (
              <span key={i} onClick={() => onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug })} style={{ cursor: 'pointer' }}>
                {item.title}
                <span className="brk-sep">●</span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
