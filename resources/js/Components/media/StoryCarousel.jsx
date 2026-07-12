import { useState } from 'react';
import Icon from '../Icon';

export default function StoryCarousel({ label, items, onClickItem, scrollRef }) {
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollAmount = () => (scrollRef.current?.offsetWidth ?? 200) * 0.8;
  const scrollLeft   = () => scrollRef.current?.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  const scrollRight  = () => scrollRef.current?.scrollBy({ left:  scrollAmount(), behavior: 'smooth' });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  return (
    <div className="hp-h3-carousel-sec">
      {label && (
        <div className="hp-h3-cs-hdr">
          <span className="hp-h3-cs-ttl">{label}</span>
        </div>
      )}
      <div className="hp-h3-stories">
        <div className="hp-h3-scroll" ref={scrollRef} onScroll={onScroll}>
          {items.length > 0 ? items.slice(0, 8).map((item, idx) => (
            <div
              key={item.id}
              className="hp-h3-scard"
              onClick={() => onClickItem(item, idx)}
              role="button"
              tabIndex={0}
              aria-label={item.title}
            >
              {(item.cover_thumbnail || item.cover || item.featured_image)
                ? <img src={item.cover_thumbnail || item.cover || item.featured_image} alt={item.title} loading="lazy" />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }} />}
              <div className="hp-h3-scard-grad" />
              {/* Per-story badge: show ▶ only on stories that contain a video slide. */}
              {item.slides?.some(sl => sl.is_video) && <div className="hp-h3-scard-play"><Icon name="play" size={16} /></div>}
              <div className="hp-h3-scard-title">{item.title}</div>
            </div>
          )) : (
            <div style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 12, fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>
              কোনো কন্টেন্ট নেই।
            </div>
          )}
        </div>
        {items.length > 1 && canScrollLeft && (
          <button className="hp-h3-arr hp-h3-arr-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
        )}
        {items.length > 1 && canScrollRight && (
          <button className="hp-h3-arr hp-h3-arr-right" onClick={scrollRight} aria-label="Scroll right">›</button>
        )}
      </div>
    </div>
  );
}
