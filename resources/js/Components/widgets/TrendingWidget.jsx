import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { getLatestArticles, getMostReadArticles } from '../../services/newsService';

export default function TrendingWidget() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const [tab, setTab] = useState('recent');
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getLatestArticles(7, lang), getMostReadArticles(7, lang)]).then(([lRes, pRes]) => {
      setLatest(lRes.data || []);
      setPopular(pRes.data || []);
      setLoading(false);
    });
  }, [lang]);

  const items = tab === 'recent' ? latest : popular;
  const go = (item) => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug });

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', marginBottom: 20, borderRadius: 5 }}>

      {/* Tabs */}
      <div style={{ display: 'flex' }}>
        {[
          { key: 'recent',  labelBn: 'সর্বশেষ',  labelEn: 'Most Recent'  },
          { key: 'popular', labelBn: 'জনপ্রিয়', labelEn: 'Most Popular' },
        ].map(({ key, labelBn, labelEn }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderBottom: active ? '3px solid var(--primary)' : '3px solid var(--border)',
                background: active ? 'var(--primary-light)' : '#f5f5f5',
                color: active ? 'var(--primary)' : '#888',
                fontFamily: 'SolaimanLipi, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {lang === 'bn' ? labelBn : labelEn}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ flex: 1, height: 13, background: '#f0f0f0', borderRadius: 2 }} />
                <div style={{ width: 68, height: 50, background: '#f0f0f0', borderRadius: 2, flexShrink: 0 }} />
              </div>
            ))
          : items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => go(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && go(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderBottom: i < items.length - 1 ? '1px solid #f5f5f5' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'SolaimanLipi, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    color: '#111',
                    marginBottom: 4,
                  }}>
                    {item.title || ''}
                  </div>
                </div>

                {item.featured_image ? (
                  <img
                    src={item.featured_image}
                    alt={item.title || ''}
                    loading="lazy"
                    style={{ flexShrink: 0, width: 68, height: 50, objectFit: 'cover', borderRadius: 2 }}
                  />
                ) : (
                  <div style={{ flexShrink: 0, width: 68, height: 50, background: '#f0f0f0', borderRadius: 2 }} />
                )}
              </div>
            ))
        }
      </div>
    </div>
  );
}
