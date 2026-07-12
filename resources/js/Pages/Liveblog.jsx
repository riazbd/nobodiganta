import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { getLiveblogUpdates } from '../services/newsService';
import PageSidebar from '../Components/PageSidebar';
import { toBengaliNum } from '../lib/formatters';
import Icon from '../Components/Icon';

export default function Liveblog({ article, initialUpdates = [] }) {
  const { lang } = useApp();
  const [updates, setUpdates] = useState(initialUpdates);
  const [newCount, setNewCount] = useState(0);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const knownIds = useRef(new Set(initialUpdates.map(u => u.id)));

  const fetchUpdates = async () => {
    const lastId = updates.length > 0 ? Math.max(...updates.map(u => u.id)) : null;
    const res = await getLiveblogUpdates(article.id, lastId);
    const incoming = res.data || [];
    const fresh = incoming.filter((u) => !knownIds.current.has(u.id));
    
    if (fresh.length > 0) {
      setHasNewUpdates(true);
      setNewCount((c) => c + fresh.length);
      fresh.forEach((u) => knownIds.current.add(u.id));
      setUpdates(prev => [...fresh, ...prev]);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchUpdates, 30_000); // Poll every 30s
    return () => clearInterval(interval);
  }, [article.id, updates]);

  const showNew = () => {
    setHasNewUpdates(false);
    setNewCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayTitle = article.title;
  
  return (
    <>
      <Head title={`${displayTitle || (lang === 'bn' ? 'লাইভ আপডেট' : 'Live Updates')} | ${lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}`} />
      <div className="article-layout">
        <div className="article-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ background: '#c00', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="radio" size={12} /> {lang === 'bn' ? 'লাইভ' : 'LIVE'}
            </span>
            <h1 style={{ fontSize: 22 }}>{displayTitle}</h1>
          </div>

          {hasNewUpdates && (
            <button
              onClick={showNew}
              style={{ width: '100%', padding: '10px', background: '#0055a5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}
            >
              {lang === 'bn'
                ? `${toBengaliNum(String(newCount))}টি নতুন আপডেট দেখুন ↑`
                : `Show ${newCount} new update${newCount > 1 ? 's' : ''} ↑`}
            </button>
          )}

          {updates.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'bn' ? 'কোনো আপডেট পাওয়া যায়নি' : 'No updates found'}
            </div>
          ) : (
            <div className="liveblog-feed">
              {updates.map((update) => (
                <div key={update.id} className="liveblog-update">
                  <div className="liveblog-time">
                    {update.time || update.timestamp}
                  </div>
                  {update.headline && (
                    <h3 className="liveblog-headline">{update.headline}</h3>
                  )}
                  <div
                    className="liveblog-body"
                    dangerouslySetInnerHTML={{ __html: update.body || '' }}
                  />
                  {update.author && (
                    <div className="liveblog-author">— {update.author}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
