import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toBengaliNum } from '../lib/formatters';

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

  const fmtViews = (n) => {
    const s = Number(n).toLocaleString('en-IN');
    return lang === 'bn' ? toBengaliNum(s) : s;
  };

  return (
    <div className="g-side">
      <div>
        <div className="sec-hdr"><div className="sec-ttl">{t('video.title', lang)}</div></div>

        {feat ? (
          <div className="sec" style={{ marginBottom: 14 }}>
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => openArticle(feat)}
              role="button"
              tabIndex={0}
              aria-label={feat.title}
              onKeyDown={(e) => e.key === 'Enter' && openArticle(feat)}
            >
              <div className="ph" style={{ width: '100%', height: 380 }}>
                {feat.thumbnail ? (
                  <img
                    src={feat.thumbnail}
                    alt={feat.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Icon name="cinema" size={60} />
                )}
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 70, height: 70, background: 'rgba(232,0,30,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Icon name="play" size={28} />
              </div>
              {feat.duration && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '2px 7px', borderRadius: 2 }}>
                  {lang === 'bn' ? toBengaliNum(feat.duration) : feat.duration}
                </div>
              )}
            </div>
            <div style={{ padding: 12 }}>
              <h3 style={{ fontFamily: "'Kalpurush','SolaimanLipi',sans-serif", fontSize: 19, fontWeight: 700, marginBottom: 8, lineHeight: 1.45 }}>
                {feat.title}
              </h3>
              <div className="meta">
                <span>{feat.time}</span>
                <span className="views">
                  <Icon name="eye" size={12} /> {fmtViews(feat.views)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p>{lang === 'bn' ? 'কোনো ভিডিও নেই।' : 'No videos found.'}</p>
        )}

        <div className="sec">
          <div className="sec-hdr"><div className="sec-ttl" style={{ fontSize: 16 }}>{t('video.more', lang)}</div></div>
          <div className="g2">
            {rest.map((v) => (
              <div
                key={v.id}
                onClick={() => openArticle(v)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={v.title}
                onKeyDown={(e) => e.key === 'Enter' && openArticle(v)}
              >
                <div className="vid-thumb">
                  <div className="ph" style={{ width: '100%', height: 140 }}>
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <Icon name="cinema" size={28} />
                    )}
                  </div>
                  <div className="play-btn"><Icon name="play" size={16} /></div>
                  {v.duration && <div className="vid-dur">{lang === 'bn' ? toBengaliNum(v.duration) : v.duration}</div>}
                </div>
                <div className="vid-info">
                  <h4>{v.title}</h4>
                  <div className="meta">
                    <span>{v.time}</span>
                    <span className="views"><Icon name="eye" size={12} /> {fmtViews(v.views)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PageSidebar />
    </div>
  );
}
