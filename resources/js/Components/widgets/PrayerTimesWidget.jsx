import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, formatTime12h } from '../../lib/prayerUtils';
import Icon from '../Icon';

function useCountdown(epochMs) {
  const [display, setDisplay] = useState('--:--:--');
  useEffect(() => {
    if (!epochMs) return;
    const tick = () => setDisplay(formatCountdown(epochMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [epochMs]);
  return display;
}

const DISPLAY_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function PrayerTimesWidget() {
  const { lang } = useApp();
  const [prayer, setPrayer] = useState(null);

  useEffect(() => {
    fetch('/api/prayer?city=dhaka')
      .then(r => r.json())
      .then(json => setPrayer(json.data))
      .catch(() => {});
  }, []);

  const next = prayer ? findNextPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);

  return (
    <div className="prayer-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="moon" size={16} /> {lang === 'bn' ? 'নামাজের সময়সূচী' : 'Prayer Times'}
        <span style={{ fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 'auto' }}>
          {lang === 'bn' ? 'ঢাকা' : 'Dhaka'}
        </span>
      </div>
      {!prayer ? (
        <div style={{ padding: '12px 0', color: '#999', fontSize: 13 }}>
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </div>
      ) : (
        <>
          <div className="prayer-grid">
            {DISPLAY_KEYS.map(key => {
              const time = prayer.timings[key];
              if (!time) return null;
              const isNext = next?.name === key;
              const passed = !isNext && isPassed(time);
              return (
                <div key={key} className={`prayer-row ${isNext ? 'active' : ''}`}>
                  <span className="prayer-name" style={{ opacity: passed ? 0.5 : 1 }}>
                    {prayerLabel(key, lang)}
                  </span>
                  <span className="prayer-time" style={{ opacity: passed ? 0.5 : 1 }}>
                    {formatTime12h(time, lang)}
                  </span>
                  {isNext && <span className="pws-pulse" style={{ marginLeft: 6 }} />}
                </div>
              );
            })}
          </div>
          {next && (
            <div style={{
              marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12
            }}>
              <span style={{ color: '#999' }}>
                {lang === 'bn' ? 'পরবর্তী:' : 'Next:'} {prayerLabel(next.name, lang)}
              </span>
              <span style={{ fontWeight: 700, color: '#263238', fontVariantNumeric: 'tabular-nums' }}>
                {countdown}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
