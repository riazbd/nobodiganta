import { useState, useEffect } from 'react';
import { t } from '../translations';
import Icon from './Icon';
import AdSlot from './ui/AdSlot';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getTrendingArticles } from '../services/newsService';
import { getOpinions } from '../services/opinionService';
import { getAvatarImage } from '../helpers/images';

export default function PageSidebar() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const [trending, setTrending] = useState([]);
  const [opinions, setOpinions] = useState([]);

  useEffect(() => {
    Promise.all([
      getTrendingArticles(5, lang),
      getOpinions(3, lang),
    ]).then(([trendRes, opRes]) => {
      setTrending(trendRes.data || []);
      setOpinions(opRes.data || []);
    });
  }, [lang]);

  const f = (item, field) => {
    if (!item) return '';
    return lang === 'en' ? (item[field + 'En'] || item[field] || '') : (item[field] || '');
  };

  return (
    <aside className="right-col">
      {/* Opinion Section */}
      <div className="opinion-section">
        <div className="opinion-section-header">
          {lang === 'bn' ? 'সম্পাদকীয় ও মতামত' : 'Editorial & Opinion'}
        </div>
        {opinions.map((op) => (
          <div key={op.id || op.name} className="opinion-card" onClick={() => onNavigate('article', { categorySlug: op.categorySlug || 'opinion', articleSlug: op.slug })}>
            <div className="opinion-text">
              <div className="opinion-author">{op.name || ''}</div>
              <div className="opinion-cat">{op.desg || ''}</div>
              <div className="opinion-headline">{op.title || ''}</div>
            </div>
            <div className="opinion-illustration">
              <img src={getAvatarImage(op.avatar)} alt={op.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Trending Widget */}
      <div className="trending-widget">
        <div className="trending-header">
          <Icon name="flame" size={16} /> {lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending Now'}
        </div>
        {trending.map((item, i) => (
          <div key={item.id} className="trending-item" onClick={() => onNavigate('article', { categorySlug: item.category?.slug || 'bangladesh', articleSlug: item.slug })}>
            <span className={`trending-num ${i === 0 ? 'hot' : ''}`}>{i + 1}</span>
            <span className="trending-text">{item.title || ''}</span>
          </div>
        ))}
      </div>

      <div style={{ margin: '20px 0' }}>
        <AdSlot size="mrec" position="sidebar_top" />
      </div>

      <div style={{ margin: '20px 0' }}>
        <AdSlot size="half-page" position="sidebar_middle" />
      </div>
    </aside>
  );
}
