import { t } from '../translations';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { toBengaliNum } from '../lib/formatters';
import EmptyState from '../Components/ui/EmptyState';
import Pagination from '../Components/ui/Pagination';

function GallerySkeleton() {
  return (
    <div className="gallery-grid">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`gallery-item ${i === 0 ? 'big' : ''}`} style={{ background: '#f3f4f6' }}>
          <div
            className={i === 0 ? 'gl-img-big' : 'gl-img'}
            style={{ background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.4s ease-in-out infinite' }}
          />
        </div>
      ))}
    </div>
  );
}

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
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });
  const sectionRef                  = useRef(null);

  // Lightbox state: { gallery, photoIndex }
  const [lightbox, setLightbox]   = useState(null);
  const lbCloseRef                = useRef(null);
  const lbPrevFocusRef            = useRef(null);

  const edition = lang === 'en' ? 'en' : 'bn';

  useEffect(() => {
    setPage(1);
  }, [edition]);

  useEffect(() => {
    setLoading(true);
    fetchGalleries(edition, page)
      .then(res => {
        setGalleries(res.data);
        setPagination({ currentPage: res.meta.current_page, lastPage: res.meta.last_page });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [edition, page]);

  const handlePageChange = (p) => {
    setPage(p);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLightbox = (gallery, idx = 0) => {
    lbPrevFocusRef.current = document.activeElement;
    setLightbox({ gallery, idx });
  };
  const closeLightbox = () => {
    setLightbox(null);
    lbPrevFocusRef.current?.focus();
  };

  const prevPhoto = useCallback(() => {
    if (!lightbox) return;
    setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.gallery.photos.length) % lb.gallery.photos.length }));
  }, [lightbox]);

  const nextPhoto = useCallback(() => {
    if (!lightbox) return;
    setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.gallery.photos.length }));
  }, [lightbox]);

  useEffect(() => {
    if (lightbox && lbCloseRef.current) lbCloseRef.current.focus();
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
    <div className="sec gallery-sec" style={{ marginBottom: 14 }} ref={sectionRef}>
      <div className="sec-hdr">
        <div className="sec-ttl">{t('gallery.title', lang)}</div>
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : galleries.length === 0 ? (
        <EmptyState
          title={lang === 'bn' ? 'কোনো ফটো গ্যালারি নেই' : 'No photo galleries'}
          message={lang === 'bn' ? 'এখনো কোনো ফটো গ্যালারি প্রকাশিত হয়নি।' : 'No photo galleries have been published yet.'}
        />
      ) : (
        <>
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
                    loading="lazy"
                  />
                ) : gallery.photos[0]?.url ? (
                  <img
                    src={gallery.photos[0].url}
                    alt={gallery.title}
                    className={i === 0 ? 'gl-img-big' : 'gl-img'}
                    loading="lazy"
                  />
                ) : (
                  <div className={`gl-placeholder ${i === 0 ? 'gl-img-big' : 'gl-img'}`}>
                    <span>📷</span>
                  </div>
                )}

                {gallery.photo_count > 0 && (
                  <span className="gl-badge">
                    📷 {lang === 'bn' ? toBengaliNum(String(gallery.photo_count)) : gallery.photo_count}
                  </span>
                )}

                <div className="gl-overlay">
                  <h5>{gallery.title}</h5>
                  {gallery.photo_count > 0 && (
                    <span className="gl-overlay-meta">
                      {lang === 'bn' ? toBengaliNum(String(gallery.photo_count)) : gallery.photo_count} {lang === 'bn' ? 'টি ছবি' : `photo${gallery.photo_count > 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {/* Lightbox */}
      {lightbox && currentPhoto && (
        <div
          id="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.gallery.title}
          onClick={closeLightbox}
          onKeyDown={e => {
            if (e.key !== 'Tab') return;
            const lb = document.getElementById('lightbox');
            if (!lb) return;
            const focusable = Array.from(lb.querySelectorAll('button:not([disabled])'));
            if (!focusable.length) return;
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
              e.preventDefault();
              (e.shiftKey ? last : first).focus();
            }
          }}
        >
          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button ref={lbCloseRef} className="lb-close" onClick={closeLightbox} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}>
              ✕
            </button>

            {/* Gallery title */}
            <div className="lb-title">{lightbox.gallery.title}</div>

            {/* Main photo */}
            <img
              src={currentPhoto.url}
              alt={currentCaption || ''}
              className="lb-photo"
            />

            {/* Caption */}
            {currentCaption && <div className="lb-cap">{currentCaption}</div>}

            {/* Counter */}
            <div className="lb-counter">
              {lang === 'bn' ? toBengaliNum(String(lightbox.idx + 1)) : lightbox.idx + 1} / {lang === 'bn' ? toBengaliNum(String(lightbox.gallery.photos.length)) : lightbox.gallery.photos.length}
            </div>

            {/* Prev / Next — absolute inside lb-inner (position:relative) so top:50% works correctly */}
            {lightbox.gallery.photos.length > 1 && <>
              <button
                onClick={e => { e.stopPropagation(); prevPhoto(); }}
                aria-label={lang === 'bn' ? 'আগের ছবি' : 'Previous photo'}
                className="lb-nav lb-nav-prev"
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); nextPhoto(); }}
                aria-label={lang === 'bn' ? 'পরের ছবি' : 'Next photo'}
                className="lb-nav lb-nav-next"
              >›</button>
            </>}

            {/* Thumbnail strip */}
            {lightbox.gallery.photos.length > 1 && (
              <div className="lb-thumbs">
                {lightbox.gallery.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p.url}
                    alt=""
                    className={`lb-thumb ${i === lightbox.idx ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, idx: i })); }}
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
