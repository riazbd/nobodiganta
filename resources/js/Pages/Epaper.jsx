import { t } from '../translations';
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getEpaperEditions } from '../services/epaperService';
import EpaperViewer from '../Components/media/EpaperViewer';
import Modal from '../Components/ui/Modal';
import { WidgetSkeleton } from '../Components/ui/Skeleton';

export default function Epaper() {
  const { lang } = useApp();
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingEdition, setViewingEdition] = useState(null);

  useEffect(() => {
    getEpaperEditions()
      .then(({ data }) => { setEditions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const recent = editions.slice(0, 4);

  return (
    <div className="sec" style={{ marginBottom: 14 }}>
      <div className="sec-hdr"><div className="sec-ttl">{t('epaper.title', lang)}</div></div>

      {/* Date selector */}
      <div style={{ background: 'var(--light-bg)', padding: 14, borderRadius: 3, marginBottom: 18 }}>
        <p style={{ fontSize: 13, color: 'var(--light-text)', marginBottom: 10 }}>{t('epaper.date_label', lang)}</p>
        {loading ? (
          <WidgetSkeleton />
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recent.map((ed, i) => (
              <button
                key={ed.date}
                onClick={() => setViewingEdition(ed)}
                style={{
                  background: i === 0 ? 'var(--primary)' : '#fff',
                  color: i === 0 ? '#fff' : 'var(--black)',
                  border: '1px solid var(--border)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  borderRadius: 2,
                  fontFamily: "'Kalpurush','SolaimanLipi',sans-serif",
                  fontSize: '12.5px',
                }}
              >
                {lang === 'bn' ? ed.label : ed.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>

      <h3 style={{ fontFamily: "'Kalpurush','SolaimanLipi',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 14, color: 'var(--black)' }}>
        {t('epaper.choose', lang)}
      </h3>

      {loading ? (
        <WidgetSkeleton />
      ) : (
        <div className="epaper-grid">
          {editions.slice(0, 6).map((ed) => (
            <div
              key={ed.date}
              className="epaper-card"
              onClick={() => setViewingEdition(ed)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-label={lang === 'bn' ? ed.label : ed.labelEn}
              onKeyDown={(e) => e.key === 'Enter' && setViewingEdition(ed)}
            >
              <div className="ep-img">
                {ed.thumbnailUrl ? (
                  <img
                    src={ed.thumbnailUrl}
                    alt={lang === 'bn' ? ed.label : ed.labelEn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>📰</div>
                )}
              </div>
              <h4>{lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}</h4>
              <div className="ep-date">{lang === 'bn' ? ed.label : ed.labelEn}</div>
              <span className="ep-btn">{t('epaper.view_btn', lang)}</span>
            </div>
          ))}
        </div>
      )}

      {viewingEdition && (
        <Modal
          open={true}
          onClose={() => setViewingEdition(null)}
          title={lang === 'bn' ? viewingEdition.label : viewingEdition.labelEn}
        >
          {viewingEdition.pdfUrl ? (
            <EpaperViewer
              url={viewingEdition.pdfUrl}
              title={lang === 'bn' ? viewingEdition.label : viewingEdition.labelEn}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
              <p>{lang === 'bn' ? 'PDF লিংক এখনো যোগ করা হয়নি।' : 'PDF link not yet available.'}</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
