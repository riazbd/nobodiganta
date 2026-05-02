import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { getMostReadArticles, getMostCommentedArticles } from '../../services/newsService';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

export default function TrendingWidget() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const [tab, setTab] = useState('read');
  const [mostRead, setMostRead] = useState([]);
  const [mostCommented, setMostCommented] = useState([]);

  useEffect(() => {
    Promise.all([getMostReadArticles(5), getMostCommentedArticles(5)]).then(([rRes, cRes]) => {
      setMostRead(rRes.data || []);
      setMostCommented(cRes.data || []);
    });
  }, []);

  const items = tab === 'read' ? mostRead : mostCommented;
  const f = (item, field) => lang === 'en' ? (item[field + 'En'] || item[field] || '') : (item[field] || '');

  return (
    <div className="trending-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="flame" size={16} /> {lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Trending'}
      </div>
      <div className="tabs" style={{ marginBottom: 10 }}>
        <button className={`tbtn ${tab === 'read' ? 'on' : ''}`} onClick={() => setTab('read')}>
          {lang === 'bn' ? 'পঠিত' : 'Most Read'}
        </button>
        <button className={`tbtn ${tab === 'commented' ? 'on' : ''}`} onClick={() => setTab('commented')}>
          {lang === 'bn' ? 'মন্তব্যিত' : 'Most Commented'}
        </button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} className="trending-item" onClick={() => onNavigate('article', item.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onNavigate('article', item.id)}>
          <span className={`trending-num ${i === 0 ? 'hot' : ''}`}>
            {lang === 'bn' ? toBengaliNum(String(i + 1)) : i + 1}
          </span>
          <span className="trending-text">{f(item, 'title')}</span>
        </div>
      ))}
    </div>
  );
}
