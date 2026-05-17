import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toBengaliNum } from '../../lib/formatters';
import { getActivePoll, submitPollVote } from '../../services/newsService';

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function BarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
    </svg>
  );
}

export default function PollWidget() {
  const { lang } = useApp();
  const [poll, setPoll]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({});
  const [voted, setVoted]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getActivePoll(lang).then(data => {
      if (!data) { setLoading(false); return; }
      setPoll(data);
      const savedVote = localStorage.getItem(`poll_voted_${data.id}`);
      setVoted(savedVote ? Number(savedVote) : null);
      const initCounts = {};
      data.options.forEach(o => { initCounts[o.id] = o.votes; });
      setCounts(initCounts);
      setLoading(false);
    });
  }, [lang]);

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const fmtNum = (n) => lang === 'bn' ? toBengaliNum(Number(n).toLocaleString('en-IN')) : Number(n).toLocaleString();

  const isClosed = poll?.end_date && new Date(poll.end_date) < new Date();

  const handleVote = async (optionId) => {
    if (voted || isClosed) return;
    const result = await submitPollVote(poll.id, optionId);
    if (result?.options) {
      const newCounts = {};
      result.options.forEach(o => { newCounts[o.id] = o.votes; });
      setCounts(newCounts);
    } else {
      setCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
    }
    setVoted(optionId);
    localStorage.setItem(`poll_voted_${poll.id}`, String(optionId));
  };

  const handleShare = () => {
    const text = poll?.question || '';
    if (navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        alert(lang === 'bn' ? 'লিংক কপি হয়েছে' : 'Link copied');
      });
    }
  };

  const winningOptionId = (() => {
    let best = null, bestV = -1;
    Object.entries(counts).forEach(([id, v]) => {
      if (v > bestV) { bestV = v; best = Number(id); }
    });
    return best;
  })();

  if (loading) {
    return (
      <div className="poll-widget poll-skeleton">
        <div className="poll-sk-img" />
        <div className="poll-sk-line" style={{ width: '80%' }} />
        <div className="poll-sk-line" style={{ width: '60%', marginBottom: 12 }} />
        <div className="poll-sk-line" style={{ height: 32, marginBottom: 8 }} />
        <div className="poll-sk-line" style={{ height: 32, marginBottom: 8 }} />
        <div className="poll-sk-line" style={{ height: 32 }} />
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="poll-widget htcs-poll-wrap">
      <div className="poll-hdr">
        <BarIcon />
        {lang === 'bn' ? 'অনলাইন জরিপ' : 'Online Poll'}
      </div>

      {poll.featured_image && (
        <img src={poll.featured_image} alt="" className="poll-img" />
      )}

      <div className="poll-meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockIcon />
          {poll.created_at
            ? new Date(poll.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : ''}
        </span>
        {isClosed && (
          <span className="poll-closed-badge">
            {lang === 'bn' ? 'ভোট শেষ' : 'Closed'}
          </span>
        )}
      </div>

      <p className="poll-q">{poll.question}</p>

      {poll.options.map(opt => {
        const pct   = totalVotes ? Math.round((counts[opt.id] / totalVotes) * 100) : 0;
        const isSelected = voted === opt.id;
        const isWinner   = opt.id === winningOptionId;
        return (
          <div key={opt.id}>
            <div
              className="poll-opt-row"
              onClick={() => handleVote(opt.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleVote(opt.id)}
            >
              <span className={`poll-radio-circle${isSelected ? ' checked' : ''}`} />
              <span className="poll-opt-lbl">{opt.option}</span>
              <span className="poll-opt-pct">
                {lang === 'bn' ? toBengaliNum(String(pct)) : pct}%
              </span>
            </div>
            <div className="poll-bar-wrap">
              <div
                className={`poll-bar-fill ${isWinner ? 'winner' : 'normal'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="poll-footer-row">
        <span className="poll-total">
          {lang === 'bn'
            ? `মোট ভোটদাতাঃ ${fmtNum(totalVotes)} জন`
            : `${fmtNum(totalVotes)} votes cast`}
        </span>
        <button className="poll-share-btn" onClick={handleShare} aria-label="Share poll">
          <ShareIcon />
        </button>
      </div>
    </div>
  );
}
