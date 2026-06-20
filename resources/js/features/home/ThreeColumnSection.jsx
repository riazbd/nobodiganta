import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import StoryCarousel from '../../Components/media/StoryCarousel';
import StoryViewer from '../../Components/StoryViewer';
import PollWidget from '../../Components/widgets/PollWidget';

// ─── Opinion Column ────────────────────────────────────────────────────────────
function OpinionColumn({ lang, nav }) {
  const [opinions, setOpinions] = useState([]);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const PER_PAGE = 3;

  useEffect(() => {
    fetch(`/api/opinions?limit=9&edition=${lang}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => { setOpinions(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  const totalPages = Math.ceil(opinions.length / PER_PAGE);

  const visible = opinions.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const goTo = (op) => {
    nav('article', { categorySlug: op.categorySlug || 'opinion', articleSlug: op.slug });
  };

  return (
    <div className="htcs-col">
      <div className="htcs-sec-hdr">
        <span className="htcs-sec-ttl">{lang === 'bn' ? 'মতামত' : 'Opinion'}</span>
        <span className="htcs-sec-more" onClick={() => nav('category', 'opinion')}>
          {lang === 'bn' ? 'আরও »' : 'More »'}
        </span>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: '#f0f0f0', borderRadius: 2, marginBottom: 6 }} />
                <div style={{ height: 12, background: '#f0f0f0', borderRadius: 2, width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {visible.map(op => (
            <div
              key={op.id}
              className="htcs-op-card"
              onClick={() => goTo(op)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && goTo(op)}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div className="htcs-op-left">
                  <div className="htcs-op-av">
                    {op.avatar
                      ? <img src={op.avatar} alt={op.name} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f0d0c0,#e0a090)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>👤</div>}
                  </div>
                  <div className="htcs-op-name">{op.name}</div>
                  <div className="htcs-op-desg">{op.desg}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="htcs-op-title">{op.title}</div>
                  {op.excerpt && <div className="htcs-op-excerpt">{op.excerpt}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="htcs-op-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`htcs-op-dot${page === i ? ' on' : ''}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stories Panel ─────────────────────────────────────────────────────────────
// A story is just a story — it may hold photos, videos, or a mix. No photo/video
// split; everything shows in one carousel (video-containing stories get a ▶ badge).
function StoriesPanel({ stories, lang, nav }) {
  const [activeStory, setActiveStory] = useState(null);
  const scrollRef = useRef(null);

  return (
    <div className="htcs-col">
      <div className="htcs-sec-hdr">
        <span className="htcs-sec-ttl">{lang === 'bn' ? 'স্টোরি' : 'Story'}</span>
        <span className="htcs-sec-more" onClick={() => nav('stories')}>
          {lang === 'bn' ? 'আরও »' : 'More »'}
        </span>
      </div>

      <StoryCarousel
        items={stories}
        onClickItem={(_, idx) => setActiveStory(idx)}
        scrollRef={scrollRef}
      />

      {activeStory !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}

// ─── Three Column Section ──────────────────────────────────────────────────────
export default function ThreeColumnSection({ stories = [] }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  return (
    <div className="p-section htcs-wrap">
      <OpinionColumn lang={lang} nav={onNavigate} />
      <div className="htcs-col htcs-col-poll">
        <div className="htcs-sec-hdr" style={{ display: 'none' }}>
          <span className="htcs-sec-ttl">Poll</span>
        </div>
        <PollWidget />
      </div>
      <StoriesPanel stories={stories} lang={lang} nav={onNavigate} />
    </div>
  );
}
