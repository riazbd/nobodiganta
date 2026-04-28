import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getPrayerTimes } from '../services/prayerService';
import MetaTags from '../Components/seo/MetaTags';
import { toBengaliNum } from '../lib/formatters';

const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const NAMES = {
  fajr:    { bn: 'ফজর',    en: 'Fajr' },
  sunrise: { bn: 'সূর্যোদয়', en: 'Sunrise' },
  dhuhr:   { bn: 'যোহর',   en: 'Dhuhr' },
  asr:     { bn: 'আসর',    en: 'Asr' },
  maghrib: { bn: 'মাগরিব', en: 'Maghrib' },
  isha:    { bn: 'এশা',    en: 'Isha' },
};

export default function PrayerTimes() {
  const { lang } = useApp();
  const today = new Date();
  const [todayTimes, setTodayTimes] = useState(null);

  useEffect(() => {
    getPrayerTimes(today).then((tRes) => {
      setTodayTimes(tRes.data || null);
    });
  }, []);

  const fmt = (t) => lang === 'bn' ? toBengaliNum(t || '') : (t || '');
  const pname = (key) => lang === 'bn' ? NAMES[key].bn : NAMES[key].en;

  const seo = {
    title: lang === 'bn' ? 'নামাজের সময়সূচী | নবদিগন্ত' : 'Prayer Times | NoboDiganta',
    description: lang === 'bn' ? 'ঢাকাসহ সারা বাংলাদেশের নামাজের সময়সূচী' : 'Prayer times for Dhaka and all of Bangladesh',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div className="page-content">
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>
          🕌 {lang === 'bn' ? 'নামাজের সময়সূচী' : 'Prayer Times'}
          <span style={{ fontSize: 14, color: '#888', fontWeight: 400, marginLeft: 10 }}>
            {lang === 'bn' ? 'ঢাকা' : 'Dhaka'}
          </span>
        </h1>

        {/* Today's times */}
        {todayTimes ? (
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14, color: '#e8001e' }}>
              {lang === 'bn' ? 'আজকের নামাজের সময়' : "Today's Prayer Times"}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {PRAYER_KEYS.map((key) => (
                <div key={key} style={{ textAlign: 'center', padding: '12px 8px', border: '1px solid #f0f0f0', borderRadius: 6 }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{pname(key)}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#222' }}>{fmt(todayTimes[key])}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: 8 }}>
            <p style={{ color: '#6b7280' }}>
              {lang === 'bn' ? 'আজকের নামাজের সময়সূচী পাওয়া যায়নি।' : 'Prayer times for today are not available.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
