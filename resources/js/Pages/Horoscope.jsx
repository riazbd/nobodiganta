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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
          {SIGNS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelected(s.key)}
              style={{
                padding: '10px 4px',
                border: selected === s.key ? '2px solid #e8001e' : '1px solid #e8ebf4',
                borderRadius: 12,
                background: selected === s.key ? '#fff5f5' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 12,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 24 }}>{s.emoji}</div>
              <div style={{ marginTop: 6, fontWeight: selected === s.key ? 'bold' : 'normal', color: selected === s.key ? '#e8001e' : '#6b7280' }}>{lang === 'bn' ? s.bn : s.en}</div>
            </button>
          ))}
        </div>

        {/* Prediction */}
        {sign && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e8ebf4' }}>
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
