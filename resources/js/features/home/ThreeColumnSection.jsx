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
  const timerRef = useRef(null);
  const PER_PAGE = 3;

  useEffect(() => {
    fetch(`/api/opinions?limit=9&edition=${lang}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => { setOpinions(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  const totalPages = Math.ceil(opinions.length / PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => {
      setPage(p => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [totalPages]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => setPage(p => (p + 1) % totalPages), 5000);
  };

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
        <div onMouseEnter={pause} onMouseLeave={resume}>
          {visible.map(op => (
            <div
              key={op.id}
              className="htcs-op-card"
              onClick={() => goTo(op)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && goTo(op)}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div className="htcs-op-av">
                  {op.avatar
                    ? <img src={op.avatar} alt={op.name} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f0d0c0,#e0a090)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>👤</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="htcs-op-name">{op.name}</div>
                  <div className="htcs-op-desg">{op.desg}</div>
                  <div className="htcs-op-title">{op.title}</div>
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
function StoriesPanel({ stories, lang }) {
  const [activeStory, setActiveStory] = useState(null);
  const videoScrollRef = useRef(null);
  const photoScrollRef = useRef(null);

  const videoStories = stories.filter(s => s.slides?.some(sl => sl.is_video));
  const photoStories = stories.filter(s => !s.slides?.some(sl => sl.is_video));

  return (
    <div className="htcs-col">
      <div className="htcs-sec-hdr">
        <span className="htcs-sec-ttl">{lang === 'bn' ? 'স্টোরি' : 'Stories'}</span>
      </div>
      <StoryCarousel
        label={lang === 'bn' ? 'ভিডিও স্টোরি' : 'Video Story'}
        items={videoStories}
        isVideo={true}
        onClickItem={(_, idx) => setActiveStory(stories.indexOf(videoStories[idx]))}
        scrollRef={videoScrollRef}
      />
      <StoryCarousel
        label={lang === 'bn' ? 'ফটো স্টোরি' : 'Photo Story'}
        items={photoStories}
        isVideo={false}
        onClickItem={(_, idx) => setActiveStory(stories.indexOf(photoStories[idx]))}
        scrollRef={photoScrollRef}
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
        <div className="htcs-sec-hdr" style={{ visibility: 'hidden', marginBottom: 0, height: 0 }}>
          <span className="htcs-sec-ttl">Poll</span>
        </div>
        <PollWidget />
      </div>
      <StoriesPanel stories={stories} lang={lang} />
    </div>
  );
}
