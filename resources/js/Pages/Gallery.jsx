import { t } from '../translations';
import Icon from '../Components/Icon';
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getGalleryItems, getGalleryCategories } from '../services/mediaService';
import { ListSkeleton } from '../Components/ui/Skeleton';
import EmptyState from '../Components/ui/EmptyState';

const TABS = ['latest', 'bangladesh', 'nature', 'people', 'sports', 'special'];

export default function Gallery() {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });

  // Get current edition from URL (en/ prefix means English edition)
  const currentEdition = window.location.pathname.startsWith('/en') ? 'en' : 'bn';

  useEffect(() => {
    setLoading(true);
    getGalleryItems(TABS[activeTab], currentEdition, 1)
      .then((response) => { 
        setItems(response.data); 
        setPagination({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
        });
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [activeTab, currentEdition]);

  const tabLabels = TABS.map((tab) => t(`gallery.tabs.${tab}`, lang));

  return (
    <div className="sec" style={{ marginBottom: 14 }}>
      <div className="sec-hdr"><div className="sec-ttl">{t('gallery.title', lang)}</div></div>
      <div className="gallery-tab-bar">
        {tabLabels.map((tab, i) => (
          <div
            key={i}
            className={`tbtn ${i === activeTab ? 'on' : ''}`}
            style={{ textAlign: 'center', padding: '8px 5px', fontSize: 12, cursor: 'pointer' }}
            onClick={() => setActiveTab(i)}
            role="tab"
            aria-selected={i === activeTab}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(i)}
          >
            {tab}
          </div>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title={lang === 'bn' ? 'কোনো ছবি নেই' : 'No photos'}
          message={lang === 'bn' ? 'এই বিভাগে এখনো কোনো ছবি যোগ করা হয়নি।' : 'No photos added to this category yet.'}
        />
      ) : (
        <div className="gallery-grid">
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`gallery-item ${i === 0 ? 'big' : ''}`}
              onClick={() => setLightboxItem(it)}
              tabIndex={0}
              role="button"
              aria-label={lang === 'bn' ? it.caption : it.captionEn}
              onKeyDown={(e) => e.key === 'Enter' && setLightboxItem(it)}
            >
              <img
                src={it.src}
                alt={it.alt_text || it.caption || 'Gallery photo'}
                className={i === 0 ? 'gl-img-big' : 'gl-img'}
                style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div className="gl-overlay">
                <h5>{it.caption || it.alt_text || 'Photo'}</h5>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxItem && (
        <div
          id="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'bn' ? lightboxItem.caption : lightboxItem.captionEn}
          onClick={() => setLightboxItem(null)}
        >
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="lb-close"
              onClick={() => setLightboxItem(null)}
              aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            >
              <Icon name="close" size={28} />
            </button>
            <img
              src={lightboxItem.src}
              alt={lightboxItem.alt_text || lightboxItem.caption}
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
            <div className="lb-cap">{lightboxItem.caption || lightboxItem.alt_text}</div>
          </div>
        </div>
      )}
    </div>
  );
}
