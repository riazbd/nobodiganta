import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

const POLL = {
  id: 1,
  questionBn: 'দেশের সবচেয়ে বড় চ্যালেঞ্জ কোনটি?',
  questionEn: "What's the country's biggest challenge?",
  options: [
    { key: 'economy',  bn: 'অর্থনীতি', en: 'Economy',  votes: 4520 },
    { key: 'security', bn: 'নিরাপত্তা', en: 'Security', votes: 3210 },
    { key: 'education',bn: 'শিক্ষা',    en: 'Education',votes: 2890 },
    { key: 'health',   bn: 'স্বাস্থ্য', en: 'Health',   votes: 1836 },
  ],
};

export default function PollWidget() {
  const { lang } = useApp();
  const storageKey = `poll_vote_${POLL.id}`;
  const [voted, setVoted] = useState(() => localStorage.getItem(storageKey));
  const [counts, setCounts] = useState(() => {
    const saved = localStorage.getItem(`poll_counts_${POLL.id}`);
    return saved ? JSON.parse(saved) : POLL.options.reduce((acc, o) => ({ ...acc, [o.key]: o.votes }), {});
  });

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const fmt = (n) => lang === 'bn' ? toBengaliNum(Number(n).toLocaleString('en-IN')) : Number(n).toLocaleString();

  const handleVote = (key) => {
    if (voted) return;
    const newCounts = { ...counts, [key]: (counts[key] || 0) + 1 };
    setCounts(newCounts);
    setVoted(key);
    localStorage.setItem(storageKey, key);
    localStorage.setItem(`poll_counts_${POLL.id}`, JSON.stringify(newCounts));
  };

  return (
    <div className="poll-widget widget-block">
      <div className="poll-header">
        <Icon name="barChart" size={16} /> {lang === 'bn' ? 'আজকের জরিপ' : "Today's Poll"}
      </div>
      <p className="poll-question">
        {lang === 'bn' ? POLL.questionBn : POLL.questionEn}
      </p>
      {POLL.options.map((opt) => {
        const pct = totalVotes ? Math.round((counts[opt.key] / totalVotes) * 100) : 0;
        const isSelected = voted === opt.key;
        return (
          <div
            key={opt.key}
            className={`poll-option ${voted ? 'voted' : ''}`}
            onClick={() => handleVote(opt.key)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleVote(opt.key)}
          >
            <span className={`poll-radio ${isSelected ? 'checked' : ''}`}></span>
            <span style={{ flex: 1 }}>{lang === 'bn' ? opt.bn : opt.en}</span>
            {voted && (
              <span style={{ fontSize: 12, color: '#888' }}>
                {lang === 'bn' ? toBengaliNum(String(pct)) : pct}%
              </span>
            )}
            {voted && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${pct}%`,
                  background: isSelected ? 'rgba(200,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 4,
                  zIndex: 0,
                  transition: 'width 0.5s ease',
                }}
              />
            )}
          </div>
        );
      })}
      <div className="poll-footer">
        {lang === 'bn' ? `${fmt(totalVotes)} ভোট দেওয়া হয়েছে` : `${fmt(totalVotes)} votes cast`}
      </div>
    </div>
  );
}
