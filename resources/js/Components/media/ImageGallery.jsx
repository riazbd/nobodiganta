import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function ImageGallery({ images = [], onClose }) {
  const { lang } = useApp();
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  if (!images.length) return null;
  const img = images[current];

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'bn' ? 'ছবির গ্যালারি' : 'Image gallery'}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <button className="gallery-close" onClick={onClose} aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}>×</button>
      <button className="gallery-prev" onClick={prev} aria-label={lang === 'bn' ? 'আগের ছবি' : 'Previous image'}>‹</button>
      <div className="gallery-content">
        <img
          src={img.src || img.url || img}
          alt={img.caption || img.alt || (lang === 'bn' ? 'গ্যালারি ছবি' : 'Gallery image')}
          style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
        />
        {img.caption && <div className="gallery-caption">{img.caption}</div>}
        <div className="gallery-counter">
          {lang === 'bn'
            ? `${current + 1} / ${images.length}`
            : `${current + 1} of ${images.length}`}
        </div>
      </div>
      <button className="gallery-next" onClick={next} aria-label={lang === 'bn' ? 'পরের ছবি' : 'Next image'}>›</button>
    </div>
  );
}
