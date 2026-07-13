import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import ArticleThumb from '../Components/ui/ArticleThumb';

export default function Video({ videos = [] }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const openArticle = (v) => {
    if (v?.categorySlug && v?.articleSlug) {
      onNavigate('article', { categorySlug: v.categorySlug, articleSlug: v.articleSlug });
    }
  };

  const feat = videos[0];
  const rest = videos.slice(1);

  return (
    <div className="g-side">
      <div>
        <div className="sec-hdr"><div className="sec-ttl">{t('video.title', lang)}</div></div>

        {feat ? (
          <>
            {/* Hero — same as category hero */}
            <article
              className="card"
              style={{ marginBottom: 14 }}
              onClick={() => openArticle(feat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openArticle(feat)}
            >
              <ArticleThumb src={feat.thumbnail} alt={feat.title} isVideo aspectRatio="16/9" style={{ width: '100%', maxHeight: 480 }} />
              <div className="cb">
                <h3>{feat.title}</h3>
              </div>
            </article>

            {/* Rest — same cards as category non-hero (art-bottom-card grid) */}
            {rest.length > 0 && (
              <div className="art-bottom-grid" style={{ marginBottom: 20 }}>
                {rest.map((v) => (
                  <div
                    key={v.id}
                    className="art-bottom-card"
                    onClick={() => openArticle(v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openArticle(v)}
                  >
                    <div className="art-bottom-card-img" style={{ position: 'relative' }}>
                      {v.thumbnail
                        ? <img src={v.thumbnail} alt={v.title || ''} loading="lazy" />
                        : <div className="ph" style={{ width: '100%', height: '100%' }}><Icon name="cinema" size={28} /></div>}
                      <div className="play-btn"><Icon name="play" size={16} /></div>
                    </div>
                    <div className="art-bottom-card-body">
                      <div className="art-bottom-card-title">{v.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p>{lang === 'bn' ? 'কোনো ভিডিও নেই।' : 'No videos found.'}</p>
        )}
      </div>
      <PageSidebar />
    </div>
  );
}
