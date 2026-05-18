import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import PageSidebar from '../Components/PageSidebar';
import PrayerTrack from '../Components/prayer/PrayerTrack';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, formatTime12h, formatGregorian } from '../lib/prayerUtils';
import { fetchWeatherDirect } from '../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, Wind, Droplets, Navigation as NavIcon, ChevronLeft, ChevronRight, Sunrise, Sunset, Moon } from 'lucide-react';

const DISPLAY_KEYS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_ICONS = {
  Imsak: Moon, Fajr: Sunrise, Sunrise: Sun, Dhuhr: Sun,
  Asr: CloudSun, Maghrib: Sunset, Isha: Moon,
};

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
  return <Icon size={size} strokeWidth={1.8} />;
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
  const [cityKey, setCityKey]     = useState(initialCityKey || 'dhaka');
  const [today, setToday]         = useState(initialToday);
  const [calendar, setCalendar]   = useState(initialCalendar || []);
  const [weather, setWeather]     = useState(null);
  const [calMonth, setCalMonth]   = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear]     = useState(new Date().getFullYear());
  const [locating, setLocating]   = useState(false);
  const next      = today ? findNextPrayer(today.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = today?.is_ramadan;
  const displayRows = DISPLAY_KEYS.filter(k => isRamadan || k !== 'Imsak');

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

  return (
    <>
      <MetaTags seo={seo} />
      <Head title={lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'} />

      <div className="article-layout">
        <div className="article-main">

          {/* ═══════ HERO DASHBOARD ═══════ */}
          <section className={`pdb-hero${isRamadan ? ' is-ramadan' : ''}`}>

            {/* Title strip */}
            <div className="pdb-titlebar">
              <div>
                <h1 className="pdb-title">{lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'}</h1>
                {today && (
                  <div className="pdb-meta">
                    {formatGregorian(today.date.gregorian, lang)}
                    <span className="pws-dot" />
                    {today.date.hijri_bn}
                  </div>
                )}
              </div>
              <div className="pdb-controls">
                <div className="pws-city-pill">
                  <MapPin size={13} strokeWidth={2.2} />
                  <select className="pws-city-select" value={cityKey} onChange={e => handleCityChange(e.target.value)}>
                    <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                      {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
                    </option>
                    {Object.entries(cities || {}).map(([k, c]) => (
                      <option key={k} value={k}>{lang === 'bn' ? c.name_bn : c.name_en}</option>
                    ))}
                  </select>
                </div>
                <button className="pws-icon-btn" onClick={handleLocate} disabled={locating} title={lang === 'bn' ? 'অবস্থান' : 'Locate'}>
                  <NavIcon size={14} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Ramadan banner */}
            {isRamadan && (
              <div className="pdb-ramadan-bar">
                {lang === 'bn' ? 'রমজান মোবারক — ' + today.date.hijri_bn : 'Ramadan Mubarak — ' + today.date.hijri_bn}
              </div>
            )}

            {/* Countdown + Weather split */}
            <div className="pdb-split">
              {/* Countdown big */}
              {next && today && (
                <div className="pdb-countdown">
                  <div className="pdb-cd-label">
                    {isRamadan && next.name === 'Maghrib'
                      ? (lang === 'bn' ? 'ইফতার পর্যন্ত' : 'Iftar in')
                      : (lang === 'bn' ? `${prayerLabel(next.name, lang, isRamadan)} পর্যন্ত` : `${prayerLabel(next.name, lang, isRamadan)} in`)}
                  </div>
                  <div className="pdb-cd-time">{lang === 'bn' ? toBn(countdown) : countdown}</div>
                  <div className="pdb-cd-at">
                    {lang === 'bn' ? 'সময়: ' : 'at '}
                    {formatTime12h(today.timings[next.name], lang)}
                  </div>
                </div>
              )}

              {/* Weather */}
              <div className="pdb-weather">
                {weather ? (
                  <>
                    <div className="pdb-weather-row">
                      <WeatherIcon code={weather.current.weather_code} size={48} />
                      <div>
                        <div className="pdb-wx-temp">
                          {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}°<span style={{ fontSize: 18, color: 'var(--lighter-text)' }}>C</span>
                        </div>
                        <div className="pdb-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
                      </div>
                    </div>
                    <div className="pdb-wx-stats">
                      <span><Droplets size={11} /> {lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%</span>
                      <span><Wind size={11} /> {lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} km/h</span>
                      <span>{lang === 'bn' ? 'অনুভব ' : 'Feels '}{lang === 'bn' ? toBn(String(Math.round(weather.current.feels_like_c))) : Math.round(weather.current.feels_like_c)}°</span>
                    </div>
                    <div className="pdb-wx-fc">
                      {weather.forecast.slice(1, 6).map(d => {
                        const dt = new Date(d.date);
                        return (
                          <div key={d.date} className="pdb-wx-fc-day">
                            <div className="pdb-fc-name">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                            <WeatherIcon code={d.weather_code} size={18} />
                            <div className="pdb-fc-temp">
                              <strong>{lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°</strong>
                              <span>{lang === 'bn' ? toBn(String(Math.round(d.min_c))) : Math.round(d.min_c)}°</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="pws-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
                )}
              </div>
            </div>

            {/* Large prayer timeline */}
            {today && <PrayerTrack prayer={today} next={next} lang={lang} size="lg" />}
          </section>

          {/* ═══════ DAILY DETAIL ═══════ */}
          <section className="pdb-card">
            <div className="pdb-card-hdr">
              <h2 className="pdb-card-ttl">{lang === 'bn' ? 'আজকের বিস্তারিত' : "Today's Detail"}</h2>
            </div>
            <div className="pdb-rows">
              {displayRows.map(key => {
                const time   = today?.timings[key];
                if (!time) return null;
                const isNext = next?.name === key;
                const passed = !isNext && key !== 'Imsak' && isPassed(time);
                const isIftar = isRamadan && key === 'Maghrib';
                const isSehri = isRamadan && key === 'Imsak';
                const Icon = PRAYER_ICONS[key];
                return (
                  <div key={key} className={`pdb-row${isNext ? ' is-next' : ''}${passed ? ' is-past' : ''}${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}>
                    <div className="pdb-row-icon">{Icon && <Icon size={18} strokeWidth={1.8} />}</div>
                    <div className="pdb-row-name">
                      {prayerLabel(key, lang, isRamadan)}
                      {isIftar && <span className="pdb-tag pdb-tag-iftar">{lang === 'bn' ? 'ইফতার' : 'Iftar'}</span>}
                      {isSehri && <span className="pdb-tag pdb-tag-sehri">{lang === 'bn' ? 'সেহরি' : 'Suhoor'}</span>}
                    </div>
                    <div className="pdb-row-time">{formatTime12h(time, lang)}</div>
                    <div className="pdb-row-status">
                      {isNext ? (lang === 'bn' ? 'পরবর্তী' : 'Next')
                        : passed ? (lang === 'bn' ? 'শেষ' : 'Passed')
                        : (lang === 'bn' ? 'আসছে' : 'Upcoming')}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════ WEEKLY HEATMAP ═══════ */}
          {calendar.length >= 7 && (
            <section className="pdb-card">
              <div className="pdb-card-hdr">
                <h2 className="pdb-card-ttl">{lang === 'bn' ? 'সাপ্তাহিক সূচি' : 'Weekly Schedule'}</h2>
              </div>
              <div className="pdb-week">
                <div className="pdb-week-grid">
                  <div className="pdb-week-cell pdb-week-corner">{lang === 'bn' ? 'নামাজ' : 'Prayer'}</div>
                  {calendar.slice(0, 7).map(d => {
                    const [dd, mm, yyyy] = d.date_gregorian.split('-');
                    const dt = new Date(+yyyy, +mm - 1, +dd);
                    const isToday = dt.toDateString() === new Date().toDateString();
                    return (
                      <div key={d.day} className={`pdb-week-cell pdb-week-day${isToday ? ' is-today' : ''}`}>
                        <span className="pdb-wkn">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</span>
                        <span className="pdb-wkd">{lang === 'bn' ? toBn(String(d.day)) : d.day}</span>
                      </div>
                    );
                  })}
                  {displayRows.map(key => (
                    <>
                      <div key={`l-${key}`} className={`pdb-week-cell pdb-week-label${isRamadan && key === 'Maghrib' ? ' is-iftar' : ''}`}>
                        {prayerLabel(key, lang, isRamadan)}
                      </div>
                      {calendar.slice(0, 7).map(d => {
                        const [dd, mm, yyyy] = d.date_gregorian.split('-');
                        const dt = new Date(+yyyy, +mm - 1, +dd);
                        const isToday = dt.toDateString() === new Date().toDateString();
                        return (
                          <div key={`${d.day}-${key}`} className={`pdb-week-cell pdb-week-time${isToday ? ' is-today' : ''}${isRamadan && key === 'Maghrib' ? ' is-iftar' : ''}`}>
                            {formatTime12h(d.timings[key], lang) || '—'}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══════ MONTHLY CALENDAR ═══════ */}
          {calendar.length >= 7 && (
            <section className="pdb-card">
              <div className="pdb-card-hdr pdb-cal-hdr">
                <h2 className="pdb-card-ttl">{lang === 'bn' ? 'মাসিক ক্যালেন্ডার' : 'Monthly Calendar'}</h2>
                <div className="pdb-cal-nav">
                  <button onClick={() => changeCalMonth(-1)}><ChevronLeft size={16} /></button>
                  <span className="pdb-cal-month">
                    {new Date(calYear, calMonth - 1).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => changeCalMonth(1)}><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="pdb-cal">
                {calendar.map(d => {
                  const [dd, mm, yyyy] = d.date_gregorian.split('-');
                  const dt = new Date(+yyyy, +mm - 1, +dd);
                  const isToday = dt.toDateString() === new Date().toDateString();
                  return (
                    <div key={d.day} className={`pdb-cal-cell${isToday ? ' is-today' : ''}`}>
                      <div className="pdb-cal-num">
                        <span className="pdb-cal-greg">{lang === 'bn' ? toBn(String(d.day)) : d.day}</span>
                        <span className="pdb-cal-hijri">{d.hijri_day_bn}</span>
                      </div>
                      <div className="pdb-cal-times">
                        <div className="pdb-cal-tline"><Sunrise size={10} /> {formatTime12h(d.timings.Fajr, lang)}</div>
                        <div className={`pdb-cal-tline${isRamadan ? ' is-iftar' : ''}`}><Sunset size={10} /> {formatTime12h(d.timings.Maghrib, lang)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══════ CITY BROWSER ═══════ */}
          <section className="pdb-card">
            <div className="pdb-card-hdr">
              <h2 className="pdb-card-ttl">{lang === 'bn' ? 'বিভিন্ন শহর' : 'Other Cities'}</h2>
            </div>
            <div className="pdb-cities">
              {Object.entries(cities || {}).map(([k, c]) => (
                <button key={k} className={`pdb-city${k === cityKey ? ' is-active' : ''}`} onClick={() => handleCityChange(k)}>
                  <MapPin size={11} strokeWidth={2.2} />
                  {lang === 'bn' ? c.name_bn : c.name_en}
                </button>
              ))}
            </div>
          </section>

          <div className="pdb-attribution">
            {lang === 'bn' ? 'হিসাব পদ্ধতি: মুসলিম ওয়ার্ল্ড লীগ · উৎস: Aladhan & Open-Meteo' : 'Method: Muslim World League · Source: Aladhan & Open-Meteo'}
          </div>
        </div>

        <PageSidebar />
      </div>
    </>
  );
}
