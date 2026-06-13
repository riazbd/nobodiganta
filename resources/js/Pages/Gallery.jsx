import { t } from '../translations';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { ListSkeleton } from '../Components/ui/Skeleton';
import EmptyState from '../Components/ui/EmptyState';

async function fetchGalleries(edition, page = 1) {
  const params = new URLSearchParams({ edition, page, per_page: 12 });
  const res = await fetch(`/api/gallery?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function Gallery() {
  const { lang } = useApp();
  const [galleries, setGalleries]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });

  // Lightbox state: { gallery, photoIndex }
  const [lightbox, setLightbox] = useState(null);

  const edition = window.location.pathname.startsWith('/en') ? 'en' : 'bn';

  useEffect(() => {
    setLoading(true);
    fetchGalleries(edition, 1)
      .then(res => {
        setGalleries(res.data);
        setPagination({ currentPage: res.meta.current_page, lastPage: res.meta.last_page });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [edition]);

  const openLightbox  = (gallery, idx = 0) => setLightbox({ gallery, idx });
  const closeLightbox = () => setLightbox(null);

  const prevPhoto = useCallback(() => {
    if (!lightbox) return;
    setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.gallery.photos.length) % lb.gallery.photos.length }));
  }, [lightbox]);

  const nextPhoto = useCallback(() => {
    if (!lightbox) return;
    setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.gallery.photos.length }));
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape')     closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prevPhoto, nextPhoto]);

  const currentPhoto = lightbox ? lightbox.gallery.photos[lightbox.idx] : null;
  const currentCaption = currentPhoto
    ? (lang === 'en' ? (currentPhoto.caption_en || currentPhoto.caption_bn) : (currentPhoto.caption_bn || currentPhoto.caption_en))
    : null;

  return (
    <div className="sec" style={{ marginBottom: 14 }}>
      <div className="sec-hdr">
        <div className="sec-ttl">{t('gallery.title', lang)}</div>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : galleries.length === 0 ? (
        <EmptyState
          title={lang === 'bn' ? 'কোনো ফটো গ্যালারি নেই' : 'No photo galleries'}
          message={lang === 'bn' ? 'এখনো কোনো ফটো গ্যালারি প্রকাশিত হয়নি।' : 'No photo galleries have been published yet.'}
        />
      ) : (
        <div className="gallery-grid">
          {galleries.map((gallery, i) => (
            <div
              key={gallery.id}
              className={`gallery-item ${i === 0 ? 'big' : ''}`}
              onClick={() => openLightbox(gallery, 0)}
              tabIndex={0}
              role="button"
              aria-label={gallery.title}
              onKeyDown={e => e.key === 'Enter' && openLightbox(gallery, 0)}
            >
              {gallery.cover ? (
                <img
                  src={gallery.cover}
                  alt={gallery.title}
                  className={i === 0 ? 'gl-img-big' : 'gl-img'}
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              ) : gallery.photos[0]?.url ? (
                <img
                  src={gallery.photos[0].url}
                  alt={gallery.title}
                  className={i === 0 ? 'gl-img-big' : 'gl-img'}
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              ) : (
                <div className={i === 0 ? 'gl-img-big' : 'gl-img'} style={{ background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 32 }}>📷</span>
                </div>
              )}

              <div className="gl-overlay">
                <h5>{gallery.title}</h5>
                {gallery.photo_count > 0 && (
                  <span style={{ fontSize: 11, opacity: 0.85, display: 'block', marginTop: 2 }}>
                    📷 {gallery.photo_count} {lang === 'bn' ? 'ছবি' : 'photos'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && currentPhoto && (
        <div
          id="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div className="lb-inner" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            {/* Close */}
            <button className="lb-close" onClick={closeLightbox} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}>
              ✕
            </button>

            {/* Gallery title */}
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '0 0 8px', opacity: 0.7, textAlign: 'center' }}>
              {lightbox.gallery.title}
            </div>

            {/* Main photo */}
            <img
              src={currentPhoto.url}
              alt={currentCaption || ''}
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block', borderRadius: 6 }}
            />

            {/* Caption */}
            {currentCaption && <div className="lb-cap">{currentCaption}</div>}

            {/* Counter */}
            <div style={{ color: '#fff', fontSize: 12, textAlign: 'center', marginTop: 6, opacity: 0.6 }}>
              {lightbox.idx + 1} / {lightbox.gallery.photos.length}
            </div>

            {/* Prev / Next */}
            {lightbox.gallery.photos.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prevPhoto(); }}
                  aria-label="Previous"
                  style={{
                    position: 'absolute', left: -48, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, color: '#fff', fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >‹</button>
                <button
                  onClick={e => { e.stopPropagation(); nextPhoto(); }}
                  aria-label="Next"
                  style={{
                    position: 'absolute', right: -48, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, color: '#fff', fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >›</button>
              </>
            )}

            {/* Thumbnail strip */}
            {lightbox.gallery.photos.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', padding: '0 2px' }}>
                {lightbox.gallery.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p.url}
                    alt=""
                    onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, idx: i })); }}
                    style={{
                      width: 54, height: 38, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                      border: i === lightbox.idx ? '2px solid #fff' : '2px solid transparent',
                      opacity: i === lightbox.idx ? 1 : 0.55,
                      transition: 'opacity 0.15s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
