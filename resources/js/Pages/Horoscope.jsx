import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getHoroscopes } from '../services/horoscopeService';
import MetaTags from '../Components/seo/MetaTags';

const SIGNS = [
  { key: 'aries',       bn: 'মেষ',     en: 'Aries',       emoji: '♈' },
  { key: 'taurus',      bn: 'বৃষ',     en: 'Taurus',      emoji: '♉' },
  { key: 'gemini',      bn: 'মিথুন',   en: 'Gemini',      emoji: '♊' },
  { key: 'cancer',      bn: 'কর্কট',   en: 'Cancer',      emoji: '♋' },
  { key: 'leo',         bn: 'সিংহ',    en: 'Leo',         emoji: '♌' },
  { key: 'virgo',       bn: 'কন্যা',   en: 'Virgo',       emoji: '♍' },
  { key: 'libra',       bn: 'তুলা',    en: 'Libra',       emoji: '♎' },
  { key: 'scorpio',     bn: 'বৃশ্চিক', en: 'Scorpio',     emoji: '♏' },
  { key: 'sagittarius', bn: 'ধনু',     en: 'Sagittarius', emoji: '♐' },
  { key: 'capricorn',   bn: 'মকর',     en: 'Capricorn',   emoji: '♑' },
  { key: 'aquarius',    bn: 'কুম্ভ',   en: 'Aquarius',    emoji: '♒' },
  { key: 'pisces',      bn: 'মীন',     en: 'Pisces',      emoji: '♓' },
];

export default function Horoscope() {
  const { lang } = useApp();
  const [selected, setSelected] = useState('aries');
  const [predictions, setPredictions] = useState({});

  useEffect(() => {
    getHoroscopes().then((res) => {
      setPredictions(res.data || {});
    });
  }, []);

  const seo = {
    title: lang === 'bn' ? 'রাশিফল | নবদিগন্ত' : 'Horoscope | NoboDiganta',
    description: lang === 'bn' ? 'আজকের রাশিফল — সকল রাশির দৈনিক ভবিষ্যৎ' : "Today's horoscope for all zodiac signs",
    lang,
  };

  const sign = SIGNS.find((s) => s.key === selected);
  const currentPrediction = predictions[selected] ? predictions[selected].prediction : (lang === 'bn' ? 'আজকের পূর্বাভাস পাওয়া যায়নি।' : 'No prediction available for today.');

  return (
    <>
      <MetaTags seo={seo} />
      <div className="page-content">
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>
          ⭐ {lang === 'bn' ? 'রাশিফল' : 'Horoscope'}
        </h1>

        {/* Sign grid */}
        <div className="horoscope-sign-grid">
          {SIGNS.map((s) => (
            <button
              key={s.key}
              className={`horoscope-sign-btn${selected === s.key ? ' on' : ''}`}
              onClick={() => setSelected(s.key)}
            >
              <span className="horoscope-sign-emoji">{s.emoji}</span>
              <span className="horoscope-sign-label">{lang === 'bn' ? s.bn : s.en}</span>
            </button>
          ))}
        </div>

        {/* Prediction */}
        {sign && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 32, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>{sign.emoji}</div>
            <h2 style={{ textAlign: 'center', fontSize: 24, marginBottom: 24, color: '#1a1d2e', fontWeight: 'bold' }}>
              {lang === 'bn' ? sign.bn : sign.en}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#4b5563', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              {currentPrediction}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
