import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import PageSidebar from '../Components/PageSidebar';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, formatTime12h, formatGregorian } from '../lib/prayerUtils';
import { fetchWeatherDirect } from '../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, Navigation as NavIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DISPLAY_KEYS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const WMO_ICON = {
  0: Sun, 1: Sun, 2: CloudSun, 3: Cloud,
  45: CloudFog, 48: CloudFog,
  51: CloudDrizzle, 53: CloudDrizzle, 55: CloudDrizzle,
  61: CloudRain, 63: CloudRain, 65: CloudRain,
  80: CloudRain, 81: CloudRain, 82: CloudRain,
  95: CloudLightning, 96: CloudLightning, 99: CloudLightning,
};
function WeatherIcon({ code, size = 24 }) {
  const Icon = WMO_ICON[code] || Cloud;
  return <Icon size={size} strokeWidth={1.5} />;
}

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

export default function PrayerTimes({ today: initialToday, calendar: initialCalendar, cities, cityKey: initialCityKey }) {
  const { lang } = useApp();
  const [cityKey, setCityKey]   = useState(initialCityKey || 'dhaka');
  const [today, setToday]       = useState(initialToday);
  const [calendar, setCalendar] = useState(initialCalendar || []);
  const [weather, setWeather]   = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear]   = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [locating, setLocating] = useState(false);
  const next      = today ? findNextPrayer(today.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = today?.is_ramadan;
  const rows      = DISPLAY_KEYS.filter(k => isRamadan || k !== 'Imsak');

  useEffect(() => {
    fetchWeatherDirect(cityKey === '__location__' ? 'dhaka' : cityKey).then(w => { if (w) setWeather(w); });
  }, [cityKey]);

  const fetchCity = async (key) => {
    try {
      const res  = await fetch(`/api/prayer?city=${key}`);
      const json = await res.json();
      if (json.data) setToday(json.data);
    } catch (e) { console.error(e); }
  };
  const fetchCalendar = async (key, m, y) => {
    try {
      const res  = await fetch(`/api/prayer-monthly?city=${key}&month=${m}&year=${y}`);
      const json = await res.json();
      setCalendar(json.data || []);
    } catch (e) { console.error(e); }
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
      } catch (e) { console.error(e); }
      finally { setLocating(false); }
    }, () => setLocating(false));
  };
  const changeCalMonth = (delta) => {
    let m = calMonth + delta, y = calYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setCalMonth(m); setCalYear(y);
    fetchCalendar(cityKey === '__location__' ? 'dhaka' : cityKey, m, y);
  };

  const seo = { title: lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times', lang };
  const cityLabel = cityKey === '__location__'
    ? (lang === 'bn' ? 'আপনার অবস্থান' : 'Your location')
    : (cities?.[cityKey]?.[lang === 'bn' ? 'name_bn' : 'name_en'] ?? (lang === 'bn' ? 'ঢাকা' : 'Dhaka'));

  return (
    <>
      <MetaTags seo={seo} />
      <Head title={lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'} />

      <div className="article-layout">
        <div className="article-main">

          {/* ═══════ MASTHEAD ═══════ */}
          <header className={`almnc-page-mast${isRamadan ? ' is-ramadan' : ''}`}>
            <div className="almnc-pm-eyebrow">{lang === 'bn' ? 'নামাজ ও আবহাওয়া' : 'PRAYERS & WEATHER'}</div>
            <h1 className="almnc-pm-title">
              {lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'}
            </h1>
            <div className="almnc-pm-dateline">
              {today && (
                <>
                  <span>{formatGregorian(today.date.gregorian, lang)}</span>
                  <span className="almnc-bullet">·</span>
                  <span>{lang === 'bn' ? today.date.hijri_bn : today.date.hijri_en}</span>
                  <span className="almnc-bullet">·</span>
                </>
              )}
              <span className="almnc-pm-city">
                <MapPin size={11} strokeWidth={2.5} /> {cityLabel}
              </span>
            </div>

            <div className="almnc-pm-controls">
              <div className="almnc-city-pill">
                <MapPin size={12} strokeWidth={2} />
                <select className="almnc-city-select" value={cityKey} onChange={e => handleCityChange(e.target.value)}>
                  <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                    {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
                  </option>
                  {Object.entries(cities || {}).map(([k, c]) => (
                    <option key={k} value={k}>{lang === 'bn' ? c.name_bn : c.name_en}</option>
                  ))}
                </select>
              </div>
              <button className="almnc-icon-btn" onClick={handleLocate} disabled={locating}>
                <NavIcon size={13} strokeWidth={2} />
              </button>
            </div>
          </header>

          {isRamadan && (
            <div className="almnc-ramadan">
              {lang === 'bn' ? 'রমজান মোবারক — ' + today.date.hijri_bn : 'Ramadan Mubarak — ' + today.date.hijri_bn}
            </div>
          )}

          {/* ═══════ COUNTDOWN HERO ═══════ */}
          {next && today && (
            <section className="almnc-cd-hero">
              <div className="almnc-cd-rule" />
              <div className="almnc-cd-label">
                {isRamadan && next.name === 'Maghrib'
                  ? (lang === 'bn' ? 'ইফতার পর্যন্ত বাকি' : 'Iftar in')
                  : (lang === 'bn' ? `${prayerLabel(next.name, lang, isRamadan)} পর্যন্ত বাকি` : `${prayerLabel(next.name, lang, false)} in`)}
              </div>
              <div className="almnc-cd-time">{lang === 'bn' ? toBn(countdown) : countdown}</div>
              <div className="almnc-cd-meta">
                {lang === 'bn'
                  ? `পরবর্তী নামাজ ${prayerLabel(next.name, lang, isRamadan)} — সময় ${formatTime12h(today.timings[next.name], lang)}`
                  : `Next prayer ${prayerLabel(next.name, lang, false)} — at ${formatTime12h(today.timings[next.name], lang)}`}
              </div>
              <div className="almnc-cd-rule" />
            </section>
          )}

          {/* ═══════ TODAY + WEATHER SIDE BY SIDE ═══════ */}
          <section className="almnc-twin">
            {/* Today's schedule — vertical leader-dot list */}
            <div className="almnc-twin-col almnc-twin-today">
              <h2 className="almnc-h2">{lang === 'bn' ? 'আজকের সূচি' : "Today's Schedule"}</h2>
              <ul className="almnc-list almnc-list-lg">
                {rows.map(key => {
                  const time = today?.timings[key];
                  if (!time) return null;
                  const isNext  = next?.name === key;
                  const passed  = !isNext && key !== 'Imsak' && isPassed(time);
                  const isIftar = isRamadan && key === 'Maghrib';
                  const isSehri = isRamadan && key === 'Imsak';
                  return (
                    <li key={key} className={`almnc-li${isNext ? ' is-next' : ''}${passed ? ' is-past' : ''}${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}>
                      <span className="almnc-li-name">
                        {prayerLabel(key, lang, isRamadan)}
                        {isIftar && <span className="almnc-tag almnc-tag-iftar">{lang === 'bn' ? 'ইফতার' : 'Iftar'}</span>}
                        {isSehri && <span className="almnc-tag almnc-tag-sehri">{lang === 'bn' ? 'সেহরি' : 'Suhoor'}</span>}
                      </span>
                      <span className="almnc-li-leader" />
                      <span className="almnc-li-time">{formatTime12h(time, lang)}</span>
                      {isNext && <span className="almnc-li-marker">{lang === 'bn' ? 'পরবর্তী' : 'NEXT'}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Weather almanac */}
            <aside className="almnc-twin-col almnc-twin-wx">
              <h2 className="almnc-h2">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</h2>
              {weather ? (
                <>
                  <div className="almnc-wx-main almnc-wx-main-lg">
                    <WeatherIcon code={weather.current.weather_code} size={48} />
                    <div>
                      <div className="almnc-wx-temp-lg">
                        {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}<span className="almnc-deg">°</span>
                      </div>
                      <div className="almnc-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
                    </div>
                  </div>
                  <dl className="almnc-wx-dl">
                    <div><dt>{lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'}</dt><dd>{lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%</dd></div>
                    <div><dt>{lang === 'bn' ? 'বায়ু' : 'Wind'}</dt><dd>{lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} {lang === 'bn' ? 'কিমি/ঘণ্টা' : 'km/h'}</dd></div>
                    <div><dt>{lang === 'bn' ? 'অনুভূতি' : 'Feels'}</dt><dd>{lang === 'bn' ? toBn(String(Math.round(weather.current.feels_like_c))) : Math.round(weather.current.feels_like_c)}°</dd></div>
                  </dl>
                  <div className="almnc-wx-outlook">
                    <div className="almnc-wx-outlook-ttl">{lang === 'bn' ? '৫ দিনের পূর্বাভাস' : '5-Day Outlook'}</div>
                    <div className="almnc-wx-days">
                      {weather.forecast.slice(1, 6).map(d => {
                        const dt = new Date(d.date);
                        return (
                          <div key={d.date} className="almnc-wx-day-lg">
                            <div className="almnc-wx-day-name">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                            <WeatherIcon code={d.weather_code} size={18} />
                            <div className="almnc-wx-day-temps">
                              <strong>{lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°</strong>
                              <span>{lang === 'bn' ? toBn(String(Math.round(d.min_c))) : Math.round(d.min_c)}°</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : <div className="almnc-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>}
            </aside>
          </section>

          {/* ═══════ WEEKLY ═══════ */}
          {calendar.length >= 7 && (
            <section className="almnc-block">
              <h2 className="almnc-h2">{lang === 'bn' ? 'সাপ্তাহিক সূচি' : 'This Week'}</h2>
              <div className="almnc-week">
                <table className="almnc-week-tbl">
                  <thead>
                    <tr>
                      <th>{lang === 'bn' ? 'নামাজ' : 'Prayer'}</th>
                      {calendar.slice(0, 7).map(d => {
                        const [dd, mm, yyyy] = d.date_gregorian.split('-');
                        const dt = new Date(+yyyy, +mm - 1, +dd);
                        const isToday = dt.toDateString() === new Date().toDateString();
                        return (
                          <th key={d.day} className={isToday ? 'is-today' : ''}>
                            <div className="almnc-wk-day">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                            <div className="almnc-wk-num">{lang === 'bn' ? toBn(String(d.day)) : d.day}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(key => (
                      <tr key={key} className={isRamadan && key === 'Maghrib' ? 'is-iftar' : ''}>
                        <td className="almnc-wk-label">{prayerLabel(key, lang, isRamadan)}</td>
                        {calendar.slice(0, 7).map(d => {
                          const [dd, mm, yyyy] = d.date_gregorian.split('-');
                          const dt = new Date(+yyyy, +mm - 1, +dd);
                          const isToday = dt.toDateString() === new Date().toDateString();
                          return (
                            <td key={d.day} className={isToday ? 'is-today' : ''}>
                              {formatTime12h(d.timings[key], lang) || '—'}
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

          {/* ═══════ MONTHLY ═══════ */}
          {calendar.length >= 7 && (() => {
            const hijriMonths = [...new Map(
              calendar.map(d => [d.hijri_month_number, { bn: `${d.hijri_month_bn} ${d.hijri_year_bn}`, en: `${d.hijri_month_en} ${d.hijri_year}` }])
            ).values()];
            return (
            <section className="almnc-block">
              <div className="almnc-cal-hdr">
                <div>
                  <h2 className="almnc-h2">{lang === 'bn' ? 'মাসিক ক্যালেন্ডার' : 'Monthly Calendar'}</h2>
                  <div className="almnc-cal-hijri-sub">
                    {hijriMonths.map((m, i) => (
                      <span key={i}>{lang === 'bn' ? m.bn : m.en}{i < hijriMonths.length - 1 ? ' – ' : ''}</span>
                    ))}
                  </div>
                </div>
                <div className="almnc-cal-nav">
                  <button onClick={() => changeCalMonth(-1)}><ChevronLeft size={14} /></button>
                  <span>{new Date(calYear, calMonth - 1).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => changeCalMonth(1)}><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="almnc-cal">
                {calendar.map(d => {
                  const [dd, mm, yyyy] = d.date_gregorian.split('-');
                  const dt = new Date(+yyyy, +mm - 1, +dd);
                  const isToday = dt.toDateString() === new Date().toDateString();
                  const isSelected = selectedDay === d.day;
                  return (
                    <button
                      type="button"
                      key={d.day}
                      className={`almnc-cal-cell${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                      onClick={() => setSelectedDay(selectedDay === d.day ? null : d.day)}
                      aria-pressed={isSelected}
                    >
                      <div className="almnc-cal-num">
                        <span className="almnc-cal-d">{lang === 'bn' ? toBn(String(d.day)) : d.day}</span>
                        <span className="almnc-cal-h">{lang === 'bn' ? d.hijri_day_bn : d.hijri_day}</span>
                      </div>
                      <div className="almnc-cal-times">
                        <div><span>{lang === 'bn' ? 'ফজ' : 'F'}</span><strong>{formatTime12h(d.timings.Fajr, lang)}</strong></div>
                        <div className={isRamadan ? 'is-iftar' : ''}>
                          <span>{lang === 'bn' ? (isRamadan ? 'ইফ' : 'মা') : (isRamadan ? 'I' : 'M')}</span>
                          <strong>{formatTime12h(d.timings.Maghrib, lang)}</strong>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected day detail */}
              {selectedDay && (() => {
                const d = calendar.find(x => x.day === selectedDay);
                if (!d) return null;
                const [dd, mm, yyyy] = d.date_gregorian.split('-');
                const dt = new Date(+yyyy, +mm - 1, +dd);
                const dateLabel = dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div className="almnc-cal-detail">
                    <div className="almnc-cal-detail-hdr">
                      <div>
                        <div className="almnc-cal-detail-eyebrow">{lang === 'bn' ? 'নির্বাচিত দিন' : 'Selected Day'}</div>
                        <div className="almnc-cal-detail-date">
                          {dateLabel}
                          <span className="almnc-bullet">·</span>
                          <span className="almnc-cal-detail-hijri">
                            {lang === 'bn'
                              ? `${d.hijri_day_bn} ${d.hijri_month_bn} ${d.hijri_year_bn}`
                              : `${d.hijri_day} ${d.hijri_month_en} ${d.hijri_year}`}
                          </span>
                        </div>
                      </div>
                      <button className="almnc-cal-detail-close" onClick={() => setSelectedDay(null)} aria-label="Close">×</button>
                    </div>
                    <ul className="almnc-list almnc-list-detail">
                      {rows.map(key => {
                        const time = d.timings[key];
                        if (!time) return null;
                        const isIftar = isRamadan && key === 'Maghrib';
                        const isSehri = isRamadan && key === 'Imsak';
                        return (
                          <li key={key} className={`almnc-li${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}>
                            <span className="almnc-li-name">
                              {prayerLabel(key, lang, isRamadan)}
                              {isIftar && <span className="almnc-tag almnc-tag-iftar">{lang === 'bn' ? 'ইফতার' : 'Iftar'}</span>}
                              {isSehri && <span className="almnc-tag almnc-tag-sehri">{lang === 'bn' ? 'সেহরি' : 'Suhoor'}</span>}
                            </span>
                            <span className="almnc-li-leader" />
                            <span className="almnc-li-time">{formatTime12h(time, lang)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}
            </section>
          );})()}

          {/* ═══════ CITIES ═══════ */}
          <section className="almnc-block">
            <h2 className="almnc-h2">{lang === 'bn' ? 'অন্যান্য শহর' : 'Other Cities'}</h2>
            <div className="almnc-cities">
              {Object.entries(cities || {}).map(([k, c]) => (
                <button key={k} className={`almnc-city-chip${k === cityKey ? ' is-active' : ''}`} onClick={() => handleCityChange(k)}>
                  {lang === 'bn' ? c.name_bn : c.name_en}
                </button>
              ))}
            </div>
          </section>

          <p className="almnc-footnote">
            {lang === 'bn'
              ? 'হিসাব পদ্ধতি: মুসলিম ওয়ার্ল্ড লীগ · উৎস: Aladhan ও Open-Meteo'
              : 'Method: Muslim World League · Source: Aladhan & Open-Meteo'}
          </p>
        </div>

        <PageSidebar />
      </div>
    </>
  );
}
