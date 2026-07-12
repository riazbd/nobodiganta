import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getLiveMatches } from '../../services/cricketService';
import Icon from '../Icon';

export default function CricketScoreWidget() {
  const { lang } = useApp();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getLiveMatches().then((res) => setMatches(res.data || []));
  }, []);

  if (!matches.length) return null;

  const match = matches[0];

  return (
    <div className="cricket-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="trophy" size={16} /> {lang === 'bn' ? 'ক্রিকেট স্কোর' : 'Cricket Score'}
        {match.status === 'live' && (
          <span className="live-badge" style={{ marginLeft: 'auto' }}>LIVE</span>
        )}
      </div>
      <div className="cricket-match">
        <div className="cricket-series" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          {lang === 'bn' ? (match.seriesBn || match.series) : match.series}
        </div>
        {match.teams?.map((team, i) => (
          <div key={i} className="cricket-team-row">
            <span className="cricket-team-name">{lang === 'bn' ? (team.nameBn || team.name) : team.name}</span>
            <span className="cricket-score">
              {team.score !== undefined ? `${team.score}${team.wickets !== undefined ? `/${team.wickets}` : ''} (${team.overs || 0})` : '—'}
            </span>
          </div>
        ))}
        <div className="cricket-status" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {lang === 'bn' ? (match.statusBn || match.statusText) : match.statusText}
        </div>
      </div>
    </div>
  );
}
