import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

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

const SHORT_PREDICTION = {
  bn: 'আজকের দিনটি ইতিবাচক হতে পারে। নতুন সুযোগ কাজে লাগান।',
  en: 'Today brings positive energy. Embrace new opportunities.',
};

export default function HoroscopeWidget() {
  const { lang } = useApp();
  const [selected, setSelected] = useState('aries');

  const sign = SIGNS.find((s) => s.key === selected);

  return (
    <div className="widget-block">
      <div className="widget-header">
        🔮 {lang === 'bn' ? 'রাশিফল' : 'Horoscope'}
      </div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          border: '1px solid var(--border)',
          borderRadius: 3,
          marginBottom: 10,
          fontFamily: "'Noto Sans Bengali', sans-serif",
          fontSize: 13,
          background: 'var(--white)',
          color: 'var(--black)',
        }}
        aria-label={lang === 'bn' ? 'রাশি নির্বাচন করুন' : 'Select zodiac sign'}
      >
        {SIGNS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.emoji} {lang === 'bn' ? s.bn : s.en}
          </option>
        ))}
      </select>
      {sign && (
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ fontSize: 22, marginBottom: 4, textAlign: 'center' }}>{sign.emoji}</div>
          <strong>{lang === 'bn' ? sign.bn : sign.en}</strong>
          <p style={{ marginTop: 6, color: 'var(--light-text)' }}>
            {SHORT_PREDICTION[lang]}
          </p>
        </div>
      )}
    </div>
  );
}
