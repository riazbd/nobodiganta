import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, PRAYER_ORDER } from '../lib/prayerUtils';

const DISPLAY_KEYS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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

function useLiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function PrayerTimes({ today: initialToday, calendar: initialCalendar, cities, cityKey: initialCityKey }) {
  const { lang } = useApp();
  const [cityKey, setCityKey]         = useState(initialCityKey || 'dhaka');
  const [today, setToday]             = useState(initialToday);
  const [calendar, setCalendar]       = useState(initialCalendar || []);
  const [calMonth, setCalMonth]       = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear]         = useState(new Date().getFullYear());
  const [expandedDay, setExpandedDay] = useState(null);
  const [locating, setLocating]       = useState(false);
  const clock                         = useLiveClock();
  const next                          = today ? findNextPrayer(today.timings) : null;
  const countdown                     = useCountdown(next?.epochMs);
  const isRamadan                     = today?.is_ramadan;

  const fetchCity = async (key) => {
    try {
      const res  = await fetch(`/api/prayer?city=${key}`);
      const json = await res.json();
      setToday(json.data);
    } catch (e) {
      console.error('Failed to fetch prayer times', e);
    }
  };

  const fetchCalendar = async (key, month, year) => {
    try {
      const res  = await fetch(`/api/prayer-monthly?city=${key}&month=${month}&year=${year}`);
      const json = await res.json();
      setCalendar(json.data || []);
    } catch (e) {
      console.error('Failed to fetch calendar', e);
    }
  };

  const handleCityChange = (key) => {
    setCityKey(key);
    localStorage.setItem('pws_city', key);
    localStorage.removeItem('pws_lat');
    localStorage.removeItem('pws_lng');
    fetchCity(key);
    fetchCalendar(key, calMonth, calYear);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      localStorage.setItem('pws_lat', lat);
      localStorage.setItem('pws_lng', lng);
      try {
        const res  = await fetch(`/api/prayer?lat=${lat}&lng=${lng}`);
        const json = await res.json();
        if (json.data) { setToday({ ...json.data, is_location: true }); setCityKey('__location__'); }
      } catch (e) {
        console.error('Failed to fetch prayer by coords', e);
      } finally {
        setLocating(false);
      }
    }, () => setLocating(false));
  };

  const changeCalMonth = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setCalMonth(m);
    setCalYear(y);
    fetchCalendar(cityKey === '__location__' ? 'dhaka' : cityKey, m, y);
  };

  const seo        = { title: lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times', lang };
  const displayRows = DISPLAY_KEYS.filter(k => !isRamadan ? k !== 'Imsak' : true);

  return (
    <>
      <MetaTags seo={seo} />
      <Head title={lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'} />

      <div className="pp-wrap">

        {/* ── HERO ── */}
        <div className={`pp-hero${isRamadan ? ' pp-hero-ramadan' : ''}`}>
          {isRamadan && today && (
            <div className="pp-ramadan-banner">
              🌙 {lang === 'bn' ? 'রমজান মোবারক — ' + today.date.hijri_bn : 'Ramadan Mubarak — ' + today.date.hijri_bn}
            </div>
          )}
          <div className="pp-hero-inner">
            <div className="pp-hero-left">
              <div className="pp-clock">{lang === 'bn' ? toBn(clock) : clock}</div>
              <div className="pp-hero-date">{today?.date.gregorian}</div>
              {today && <div className="pp-hero-hijri">{today.date.hijri_bn}</div>}
            </div>
            <div className="pp-hero-right">
              <div className="pp-city-row">
                <select className="pp-city-select" value={cityKey} onChange={e => handleCityChange(e.target.value)}>
                  {cityKey === '__location__' && (
                    <option value="__location__">📍 {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}</option>
                  )}
                  {Object.entries(cities || {}).map(([k, c]) => (
                    <option key={k} value={k}>{lang === 'bn' ? c.name_bn : c.name_en}</option>
                  ))}
                </select>
                <button className="pp-locate-btn" onClick={handleLocate} disabled={locating}>
                  {locating ? '⏳' : '📍'}
                </button>
              </div>
              {next && (
                <div className="pp-next-prayer">
                  <div className="pp-next-label">
                    {isRamadan && next.name === 'Maghrib'
                      ? (lang === 'bn' ? 'ইফতার বাকি' : 'Iftar in')
                      : (lang === 'bn'
                          ? 'পরবর্তী নামাজ: ' + prayerLabel(next.name, lang, isRamadan)
                          : 'Next: ' + prayerLabel(next.name, lang, isRamadan))}
                  </div>
                  <div className="pp-next-countdown">{lang === 'bn' ? toBn(countdown) : countdown}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pp-body">

          {/* ── TODAY'S TIMETABLE ── */}
          <section className="pp-section">
            <h2 className="pp-section-title">{lang === 'bn' ? 'আজকের নামাজের সময়' : "Today's Prayer Times"}</h2>
            <div className="pp-today-grid">
              {displayRows.map(key => {
                const time    = today?.timings[key];
                if (!time) return null;
                const isNext  = next?.name === key;
                const passed  = !isNext && key !== 'Imsak' && isPassed(time);
                const isIftar = isRamadan && key === 'Maghrib';
                const isSehri = isRamadan && key === 'Imsak';
                return (
                  <div key={key} className={`pp-prayer-card${isNext ? ' pp-next' : ''}${passed ? ' pp-passed' : ''}${isIftar ? ' pp-iftar' : ''}${isSehri ? ' pp-sehri' : ''}`}>
                    {isIftar && <div className="pp-iftar-badge">🌙 ইফতার</div>}
                    {isSehri && <div className="pp-sehri-badge">সেহরি</div>}
                    <div className="pp-prayer-name">{prayerLabel(key, lang, isRamadan)}</div>
                    <div className="pp-prayer-time">{lang === 'bn' ? toBn(time) : time}</div>
                    {isNext && <div className="pp-next-dot" />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── WEEKLY TIMETABLE ── */}
          {calendar.length > 0 && (
            <section className="pp-section">
              <h2 className="pp-section-title">{lang === 'bn' ? 'সাপ্তাহিক সময়সূচি' : 'Weekly Timetable'}</h2>
              <div className="pp-weekly-wrap">
                <table className="pp-weekly-table">
                  <thead>
                    <tr>
                      <th>{lang === 'bn' ? 'নামাজ' : 'Prayer'}</th>
                      {calendar.slice(0, 7).map(d => {
                        const dt      = new Date(d.date_gregorian.split('-').reverse().join('-'));
                        const isToday = dt.toDateString() === new Date().toDateString();
                        return (
                          <th key={d.day} className={isToday ? 'pp-today-col' : ''}>
                            {dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}
                            <br />
                            <span className="pp-week-day">{lang === 'bn' ? toBn(String(d.day)) : d.day}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {DISPLAY_KEYS.filter(k => k !== 'Imsak' || isRamadan).map(key => (
                      <tr key={key} className={isRamadan && key === 'Maghrib' ? 'pp-iftar-row' : ''}>
                        <td className="pp-row-label">{prayerLabel(key, lang, isRamadan)}</td>
                        {calendar.slice(0, 7).map(d => {
                          const dt      = new Date(d.date_gregorian.split('-').reverse().join('-'));
                          const isToday = dt.toDateString() === new Date().toDateString();
                          return (
                            <td key={d.day} className={isToday ? 'pp-today-col' : ''}>
                              {lang === 'bn' ? toBn(d.timings[key] || '') : (d.timings[key] || '—')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── MONTHLY CALENDAR ── */}
          {calendar.length > 0 && (
            <section className="pp-section">
              <div className="pp-cal-header">
                <button className="pp-cal-nav" onClick={() => changeCalMonth(-1)}>‹</button>
                <h2 className="pp-section-title" style={{ margin: 0 }}>
                  {new Date(calYear, calMonth - 1).toLocaleDateString(
                    lang === 'bn' ? 'bn-BD' : 'en-GB',
                    { month: 'long', year: 'numeric' }
                  )}
                </h2>
                <button className="pp-cal-nav" onClick={() => changeCalMonth(1)}>›</button>
              </div>
              <div className="pp-cal-grid">
                {calendar.map(d => {
                  const dt      = new Date(d.date_gregorian.split('-').reverse().join('-'));
                  const isToday = dt.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={d.day}
                      className={`pp-cal-cell${isToday ? ' pp-cal-today' : ''}${expandedDay === d.day ? ' pp-cal-expanded' : ''}`}
                      onClick={() => setExpandedDay(expandedDay === d.day ? null : d.day)}
                    >
                      <div className="pp-cal-day">{lang === 'bn' ? toBn(String(d.day)) : d.day}</div>
                      <div className="pp-cal-hijri">{d.hijri_day_bn}</div>
                      <div className="pp-cal-fajr">{lang === 'bn' ? toBn(d.timings.Fajr || '') : d.timings.Fajr}</div>
                      <div className={`pp-cal-maghrib${isRamadan ? ' pp-cal-iftar' : ''}`}>
                        {lang === 'bn' ? toBn(d.timings.Maghrib || '') : d.timings.Maghrib}
                      </div>
                      {expandedDay === d.day && (
                        <div className="pp-cal-expand">
                          {DISPLAY_KEYS.filter(k => k !== 'Imsak' || isRamadan).map(k =>
                            d.timings[k] ? (
                              <div key={k} className="pp-cal-expand-row">
                                <span>{prayerLabel(k, lang, isRamadan)}</span>
                                <span>{lang === 'bn' ? toBn(d.timings[k]) : d.timings[k]}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── ALL CITIES STRIP ── */}
          <section className="pp-section">
            <h2 className="pp-section-title">{lang === 'bn' ? 'বিভিন্ন শহরের সময়' : 'Times by City'}</h2>
            <p className="pp-cities-note">{lang === 'bn' ? 'আজকের ফজর ও মাগরিবের সময়' : "Today's Fajr & Maghrib"}</p>
            <div className="pp-cities-strip">
              {Object.entries(cities || {}).map(([k, c]) => (
                <button
                  key={k}
                  className={`pp-city-chip${k === cityKey ? ' active' : ''}`}
                  onClick={() => handleCityChange(k)}
                >
                  <div className="pp-city-chip-name">{lang === 'bn' ? c.name_bn : c.name_en}</div>
                  <div className="pp-city-chip-label">{lang === 'bn' ? 'ফজর · মাগরিব' : 'Fajr · Maghrib'}</div>
                </button>
              ))}
            </div>
          </section>

          <div className="pp-method">
            {lang === 'bn'
              ? 'হিসাব পদ্ধতি: মুসলিম ওয়ার্ল্ড লীগ · উৎস: Aladhan.com'
              : 'Method: Muslim World League · Source: Aladhan.com'}
          </div>

        </div>
      </div>
    </>
  );
}
