import { useState, useEffect } from 'react';
import { Sunrise, Sunset, Sun, Moon, CloudSun } from 'lucide-react';
import { prayerLabel, toBn, formatTime12h } from '../../lib/prayerUtils';

const ICONS = {
  Imsak: Moon, Fajr: Sunrise, Sunrise: Sun, Dhuhr: Sun,
  Asr: CloudSun, Maghrib: Sunset, Isha: Moon,
};

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
}

export default function PrayerTrack({ prayer, next, lang, size = 'md' }) {
  useMinuteTick();
  if (!prayer?.timings) return null;

  const isRamadan = prayer.is_ramadan;
  const keys = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    .filter(k => isRamadan || k !== 'Imsak');
  const stops = keys
    .map(k => ({ key: k, time: prayer.timings[k], mins: timeToMinutes(prayer.timings[k]) }))
    .filter(p => p.time);
  if (stops.length === 0) return null;

  const dayStart = stops[0].mins - 30;
  const dayEnd   = stops[stops.length - 1].mins + 60;
  const range    = dayEnd - dayStart;

  const now      = new Date();
  const nowMins  = now.getHours() * 60 + now.getMinutes();
  const nowPct   = Math.max(0, Math.min(100, ((nowMins - dayStart) / range) * 100));
  const pctFor   = (mins) => Math.max(0, Math.min(100, ((mins - dayStart) / range) * 100));

  return (
    <div className={`pt-track pt-track-${size}`}>
      <div className="pt-rail">
        <div className="pt-rail-base" />
        <div className="pt-rail-fill" style={{ width: `${nowPct}%` }} />

        {stops.map(p => {
          const isNext = next?.name === p.key;
          const isPast = !isNext && p.mins < nowMins;
          const isIftar = isRamadan && p.key === 'Maghrib';
          const isSehri = isRamadan && p.key === 'Imsak';
          const Icon = ICONS[p.key];
          return (
            <div
              key={p.key}
              className={`pt-stop${isNext ? ' is-next' : ''}${isPast ? ' is-past' : ''}${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}
              style={{ left: `${pctFor(p.mins)}%` }}
            >
              <div className="pt-stop-name">{prayerLabel(p.key, lang, isRamadan)}</div>
              <div className="pt-stop-dot">
                {Icon && <Icon size={size === 'lg' ? 14 : 11} strokeWidth={2.5} />}
              </div>
              <div className="pt-stop-time">{formatTime12h(p.time, lang)}</div>
            </div>
          );
        })}

        <div className="pt-now-marker" style={{ left: `${nowPct}%` }}>
          <div className="pt-now-line" />
          <div className="pt-now-pin">{lang === 'bn' ? 'এখন' : 'NOW'}</div>
        </div>
      </div>
    </div>
  );
}
