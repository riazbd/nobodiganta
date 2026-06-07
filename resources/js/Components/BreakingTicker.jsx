import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

const LogoDot = () => (
  <span className="brk-logo-dot" aria-hidden="true">
    <img src="/logo.png" alt="" />
  </span>
);

export default function BreakingTicker() {
  const { lang, globalBreakingNews = [] } = useApp();
  const { onNavigate } = useNavigation();
  const total = globalBreakingNews.length;

  if (!total) return null;

  const go = (item) => {
    if (item?.category_slug && item?.slug)
      onNavigate('article', { categorySlug: item.category_slug, articleSlug: item.slug });
  };

  const items = [...globalBreakingNews, ...globalBreakingNews];

  return (
    <div className="brk-fixed" role="marquee" aria-label={lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Breaking news'}>
      <div className="brk-label">
        {lang === 'bn' ? 'শিরোনাম' : 'BREAKING'}
      </div>
      <div className="brk-track-wrap">
        <div className="brk-track">
          {items.map((item, i) => (
            <span key={i} className="brk-item">
              <LogoDot />
              <button className="brk-link" onClick={() => go(item)} tabIndex={0}>
                {item?.title}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
