import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getPrayerTimes } from '../../services/prayerService';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

const PRAYER_NAMES = {
  fajr:    { bn: 'ফজর',   en: 'Fajr' },
  sunrise: { bn: 'সূর্যোদয়', en: 'Sunrise' },
  dhuhr:   { bn: 'যোহর',  en: 'Dhuhr' },
  asr:     { bn: 'আসর',   en: 'Asr' },
  maghrib: { bn: 'মাগরিব', en: 'Maghrib' },
  isha:    { bn: 'এশা',   en: 'Isha' },
};

function getCurrentPrayer(times) {
  if (!times) return null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let current = null;
  
  for (const key of order) {
    if (!times[key]) continue;
    const match = times[key].match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
      
      if (nowMins >= h * 60 + m) {
        current = key;
      }
    }
  }
  return current || 'isha';
}

export default function PrayerTimesWidget() {
  const { lang } = useApp();
  const [times, setTimes] = useState(null);

  useEffect(() => {
    getPrayerTimes(new Date()).then((res) => setTimes(res.data));
  }, []);

  const currentPrayer = getCurrentPrayer(times);
  const label = (key) => lang === 'bn' ? PRAYER_NAMES[key]?.bn : PRAYER_NAMES[key]?.en;
  const formatTime = (t) => {
    if (!t) return '';
    if (lang !== 'bn') return t;
    return toBengaliNum(t);
  };

  return (
    <div className="prayer-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="moon" size={16} /> {lang === 'bn' ? 'নামাজের সময়সূচী' : 'Prayer Times'}
        <span style={{ fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 'auto' }}>
          {lang === 'bn' ? 'ঢাকা' : 'Dhaka'}
        </span>
      </div>
      {!times ? (
        <div style={{ padding: '12px 0', color: '#999', fontSize: 13 }}>
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </div>
      ) : (
        <div className="prayer-grid">
          {Object.entries(PRAYER_NAMES).map(([key]) => (
            <div key={key} className={`prayer-row ${currentPrayer === key ? 'active' : ''}`}>
              <span className="prayer-name">{label(key)}</span>
              <span className="prayer-time">{formatTime(times[key] || '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
