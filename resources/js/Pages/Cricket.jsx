import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getAllMatches } from '../services/cricketService';
import MetaTags from '../Components/seo/MetaTags';
import { toBengaliNum } from '../lib/formatters';

const STATUS_COLORS = { live: '#c00', upcoming: '#0055a5', completed: '#888' };

export default function Cricket() {
  const { lang } = useApp();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getAllMatches().then((res) => setMatches(res.data || []));
  }, []);

  const seo = {
    title: lang === 'bn' ? 'ক্রিকেট স্কোর | নবদিগন্ত' : 'Cricket Scores | NoboDiganta',
    description: lang === 'bn' ? 'বাংলাদেশ ক্রিকেটের সর্বশেষ স্কোর ও ফিক্সচার' : 'Latest Bangladesh cricket scores and fixtures',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div className="page-content">
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>
          🏏 {lang === 'bn' ? 'ক্রিকেট' : 'Cricket'}
        </h1>
        {matches.map((match) => (
          <div key={match.id} style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ background: STATUS_COLORS[match.status] || '#888', color: '#fff', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                {match.status === 'live' ? (lang === 'bn' ? 'লাইভ' : 'LIVE')
                 : match.status === 'upcoming' ? (lang === 'bn' ? 'আসন্ন' : 'UPCOMING')
                 : (lang === 'bn' ? 'সম্পন্ন' : 'COMPLETED')}
              </span>
              <span style={{ fontSize: 13, color: '#888' }}>
                {lang === 'bn' ? (match.seriesBn || match.series) : match.series}
              </span>
            </div>
            {match.teams?.map((team, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i === 0 ? '1px solid #f0f0f0' : 'none' }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                  {lang === 'bn' ? (team.nameBn || team.name) : team.name}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {team.score !== undefined
                    ? `${lang === 'bn' ? toBengaliNum(String(team.score)) : team.score}${team.wickets !== undefined ? `/${lang === 'bn' ? toBengaliNum(String(team.wickets)) : team.wickets}` : ''} (${lang === 'bn' ? toBengaliNum(String(team.overs || 0)) : team.overs || 0})`
                    : '—'}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
              {lang === 'bn' ? (match.statusBn || match.statusText) : match.statusText}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
