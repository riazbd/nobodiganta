import { useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function BreakingTicker() {
  const { lang, globalBreakingNews = [] } = useApp();
  const { onNavigate } = useNavigation();
  const total = globalBreakingNews.length;

  if (!total) return null;

  const go = (item) => {
    if (item?.category_slug && item?.slug)
      onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug });
  };

  // Duplicate items so the scroll loops seamlessly
  const items = [...globalBreakingNews, ...globalBreakingNews];

  return (
    <div className="brk-fixed" role="marquee" aria-label={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Breaking news'}>
      {/* Label */}
      <div className="brk-label">
        {lang === 'bn' ? 'শিরোনাম' : 'BREAKING'}
      </div>

      {/* Scrolling track */}
      <div className="brk-track-wrap">
        <div className="brk-track">
          {items.map((item, i) => (
            <span key={i} className="brk-item">
              <button
                className="brk-link"
                onClick={() => go(item)}
                tabIndex={0}
              >
                {item?.title}
              </button>
              <span className="brk-dot" aria-hidden="true">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
