import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { prayerLabel, findNextPrayer, findCurrentPrayer, findNextSunEvent, formatCountdown, toBn, to12h, formatTime12h, PRAYER_ORDER } from '../../lib/prayerUtils';
import { fetchWeatherDirect } from '../../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, ArrowRight, Navigation as NavIcon, Sunrise, Sunset, Moon } from 'lucide-react';

// Each weather code maps to an icon + a true-to-life colour so the widget reads
// at a glance (sunny = amber, rain = blue, storm = violet, fog = slate).
const WMO_META = {
  0:  { Icon: Sun,            color: '#e3b14a' },
  1:  { Icon: Sun,            color: '#e3b14a' },
  2:  { Icon: CloudSun,       color: '#e3b14a' },
  3:  { Icon: Cloud,          color: '#64748b' },
  45: { Icon: CloudFog,       color: '#94a3b8' },
  48: { Icon: CloudFog,       color: '#94a3b8' },
  51: { Icon: CloudDrizzle,   color: '#0ea5e9' },
  53: { Icon: CloudDrizzle,   color: '#0ea5e9' },
  55: { Icon: CloudDrizzle,   color: '#0ea5e9' },
  61: { Icon: CloudRain,      color: '#2563eb' },
  63: { Icon: CloudRain,      color: '#2563eb' },
  65: { Icon: CloudRain,      color: '#2563eb' },
  80: { Icon: CloudRain,      color: '#2563eb' },
  81: { Icon: CloudRain,      color: '#2563eb' },
  82: { Icon: CloudRain,      color: '#2563eb' },
  95: { Icon: CloudLightning, color: '#7c3aed' },
  96: { Icon: CloudLightning, color: '#7c3aed' },
  99: { Icon: CloudLightning, color: '#7c3aed' },
};
function WeatherIcon({ code, size = 24 }) {
  const { Icon, color } = WMO_META[code] || { Icon: Cloud, color: '#64748b' };
  return <Icon size={size} strokeWidth={2} color={color} fill={color} fillOpacity={0.16} />;
}

function useCountdown(epochMs) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (!epochMs) return;
    const tick = () => setDisplay(formatCountdown(epochMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [epochMs]);
  return display;
}

const CITY_OPTIONS = [
  { key: 'dhaka',       bn: 'ঢাকা',          en: 'Dhaka' },
  { key: 'chittagong',  bn: 'চট্টগ্রাম',     en: 'Chittagong' },
  { key: 'sylhet',      bn: 'সিলেট',          en: 'Sylhet' },
  { key: 'rajshahi',    bn: 'রাজশাহী',        en: 'Rajshahi' },
  { key: 'khulna',      bn: 'খুলনা',          en: 'Khulna' },
  { key: 'barisal',     bn: 'বরিশাল',         en: 'Barisal' },
  { key: 'rangpur',     bn: 'রংপুর',          en: 'Rangpur' },
  { key: 'mymensingh',  bn: 'ময়মনসিংহ',      en: 'Mymensingh' },
  { key: 'comilla',     bn: 'কুমিল্লা',       en: 'Comilla' },
  { key: 'narayanganj', bn: 'নারায়ণগঞ্জ',    en: 'Narayanganj' },
  { key: 'gazipur',     bn: 'গাজীপুর',        en: 'Gazipur' },
  { key: 'jessore',     bn: 'যশোর',           en: 'Jessore' },
  { key: 'bogra',       bn: 'বগুড়া',         en: 'Bogra' },
  { key: 'coxsbazar',   bn: 'কক্সবাজার',     en: "Cox's Bazar" },
];

// ── Sun-path arc geometry (matches the mockup) ──────────────────────────────
// H (viewBox height) leaves room below the baseline for the in-SVG labels so
// they can't overflow and collide with the status row beneath the arc.
const ARC = { W: 400, H: 150, X0: 28, X1: 372, baseline: 100, amp: 76 };
const minutesOf = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const arcPt = (t) => [ARC.X0 + t * (ARC.X1 - ARC.X0), ARC.baseline - ARC.amp * Math.sin(Math.PI * t)];

// Short clock without the AM/PM suffix (e.g. "৩:৪৫"), localized.
const shortTime = (t, lang) => {
  if (!t) return '';
  const base = to12h(t).replace(/\s*(AM|PM)$/i, '');
  return lang === 'bn' ? toBn(base) : base;
};

export default function PrayerWeatherSection({ initialPrayer, initialWeather }) {
  const { lang }       = useApp();
  const { onNavigate } = useNavigation();
  const locateTimer    = useRef(null);

  const [cityKey,   setCityKey]   = useState('dhaka');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [prayer,    setPrayer]    = useState(initialPrayer || null);
  const [weather,   setWeather]   = useState(initialWeather || null);
  const [loading,   setLoading]   = useState(false);

  const load = async (key, coords) => {
    setLoading(true);
    try {
      const prayerUrl = coords ? `/api/prayer?lat=${coords.lat}&lng=${coords.lng}` : `/api/prayer?city=${key}`;
      const [pRes, wData] = await Promise.all([
        fetch(prayerUrl).then(r => r.json()),
        fetchWeatherDirect(key, coords?.lat, coords?.lng),
      ]);
      if (pRes.data) setPrayer(pRes.data);
      if (wData)     setWeather(wData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLat  = localStorage.getItem('pws_lat');
    const savedLng  = localStorage.getItem('pws_lng');
    const savedCity = localStorage.getItem('pws_city') || 'dhaka';
    if (savedLat && savedLng) {
      const coords = { lat: parseFloat(savedLat), lng: parseFloat(savedLng) };
      setCityKey('__location__');
      setGpsCoords(coords);
      load('dhaka', coords);
    } else {
      setCityKey(savedCity);
      if (initialPrayer && initialWeather && savedCity === 'dhaka') return;
      if (initialPrayer && savedCity === 'dhaka') {
        fetchWeatherDirect('dhaka').then(w => { if (w) setWeather(w); });
      } else {
        load(savedCity, null);
      }
    }
    return () => { if (locateTimer.current) clearTimeout(locateTimer.current); };
  }, []);

  const handleCityChange = (key) => {
    if (key === cityKey && !gpsCoords) return;
    setCityKey(key);
    setGpsCoords(null);
    localStorage.setItem('pws_city', key);
    localStorage.removeItem('pws_lat');
    localStorage.removeItem('pws_lng');
    load(key, null);
  };
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    locateTimer.current = setTimeout(() => setLoading(false), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (locateTimer.current) clearTimeout(locateTimer.current);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem('pws_lat', coords.lat);
        localStorage.setItem('pws_lng', coords.lng);
        setCityKey('__location__');
        setGpsCoords(coords);
        load('dhaka', coords);
      },
      () => { if (locateTimer.current) clearTimeout(locateTimer.current); setLoading(false); }
    );
  };

  const timings   = prayer?.timings || null;
  const next      = timings ? findNextPrayer(timings) : null;
  const current   = timings ? findCurrentPrayer(timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;
  const sunEvent  = timings ? findNextSunEvent(timings) : null;

  // The dot that gets the gold pulse: the running prayer, or (during a gap) the
  // upcoming one. The "next" dot is shown lighter unless it's already the gold one.
  const goldName = current?.name ?? next?.name ?? null;
  const nextName = next?.name ?? null;

  const nextLabel = next
    ? (isRamadan && next.name === 'Maghrib'
        ? (lang === 'bn' ? 'ইফতার' : 'Iftar')
        : prayerLabel(next.name, lang, isRamadan))
    : '—';

  const cityLabel = cityKey === '__location__'
    ? (lang === 'bn' ? 'আপনার অবস্থান' : 'Your location')
    : (CITY_OPTIONS.find(c => c.key === cityKey)?.[lang === 'bn' ? 'bn' : 'en']
       ?? (lang === 'bn' ? 'ঢাকা' : 'Dhaka'));

  // Build the arc (path + per-prayer dots/labels) from the live timings.
  let arc = null;
  if (timings && timings.Fajr && timings.Isha) {
    const fajrM = minutesOf(timings.Fajr);
    const ishaM = minutesOf(timings.Isha);
    const span  = Math.max(1, ishaM - fajrM);

    let d = `M 4 ${ARC.baseline} L ${ARC.X0} ${ARC.baseline}`;
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const [x, y] = arcPt(i / steps);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${ARC.W - 4} ${ARC.baseline}`;

    const dots = PRAYER_ORDER.filter(p => timings[p]).map(p => {
      const t = Math.min(1, Math.max(0, (minutesOf(timings[p]) - fajrM) / span));
      const [x, y] = arcPt(t);
      return { name: p, x, y, isGold: p === goldName, isNext: p === nextName && p !== goldName };
    });
    arc = { d, dots };
  }

  const statusText = current
    ? (lang === 'bn' ? `${prayerLabel(current.name, lang, isRamadan)} ওয়াক্ত চলছে` : `${prayerLabel(current.name, lang, isRamadan)} is ongoing`)
    : (next ? (lang === 'bn' ? `পরবর্তী ওয়াক্ত: ${nextLabel}` : `Up next: ${nextLabel}`) : '');

  return (
    <div className={`nw${isRamadan ? ' nw-ramadan' : ''}`}>
      {/* ── Hero ── */}
      <div className="nw-hero">
        <svg className="nw-medallion" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="18" y="18" width="64" height="64" rx="3" />
          <rect x="18" y="18" width="64" height="64" rx="3" transform="rotate(45 50 50)" />
          <circle cx="50" cy="50" r="20" />
        </svg>

        <div className="nw-hero-top">
          <div className="nw-brand">
            <Moon size={16} strokeWidth={0} fill="currentColor" />
            {lang === 'bn' ? 'নামাজ ও আবহাওয়া' : 'Prayer & Weather'}
          </div>
          <div className="nw-loc-pill">
            <MapPin size={12} strokeWidth={2} />
            <select className="nw-city-sel" value={cityKey} onChange={e => handleCityChange(e.target.value)} disabled={loading} aria-label={lang === 'bn' ? 'শহর' : 'City'}>
              <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
              </option>
              {CITY_OPTIONS.map(c => <option key={c.key} value={c.key}>{lang === 'bn' ? c.bn : c.en}</option>)}
            </select>
            <button type="button" className="nw-loc-btn" onClick={handleLocate} disabled={loading} aria-label={lang === 'bn' ? 'বর্তমান অবস্থান শনাক্ত করুন' : 'Use my location'}>
              <NavIcon size={12} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Sun-path arc */}
        <div className="nw-arc-wrap">
          <svg className="nw-arc" viewBox={`0 0 ${ARC.W} ${ARC.H}`} aria-hidden="true">
            <defs>
              <linearGradient id="nwSkyline" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a8d6b6" />
                <stop offset="34%" stopColor="#e3b14a" />
                <stop offset="68%" stopColor="#3f9163" />
                <stop offset="100%" stopColor="#15482f" />
              </linearGradient>
            </defs>
            {arc && (
              <>
                <path d={arc.d} fill="none" stroke="url(#nwSkyline)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                {arc.dots.map(dot => (
                  <g key={dot.name}>
                    {dot.isGold && (
                      <circle cx={dot.x} cy={dot.y} r="8" fill="none" stroke="#e3b14a" strokeWidth="2" className="nw-pulse-ring" />
                    )}
                    <circle
                      cx={dot.x} cy={dot.y}
                      r={dot.isGold ? 7 : (dot.isNext ? 5.5 : 4)}
                      fill={dot.isGold ? '#e3b14a' : (dot.isNext ? '#eef6ec' : 'rgba(238,246,236,0.55)')}
                      stroke={dot.isGold ? '#082316' : 'none'}
                      strokeWidth={dot.isGold ? 2 : 0}
                    />
                    <text textAnchor="middle">
                      <tspan x={dot.x} y={dot.y + 18} className={`nw-arc-name${dot.isGold ? ' cur' : ''}`}>
                        {prayerLabel(dot.name, lang, isRamadan)}
                      </tspan>
                      <tspan x={dot.x} y={dot.y + 30} className="nw-arc-time">
                        {shortTime(timings[dot.name], lang)}
                      </tspan>
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>

        {statusText && (
          <div className="nw-status-row"><span className="nw-status-dot" aria-hidden="true" />{statusText}</div>
        )}
        <div className="nw-cd-label">{lang === 'bn' ? `${nextLabel} বাকি` : `Time left · ${nextLabel}`}</div>
        <div className="nw-countdown" aria-live="polite">
          {next ? (lang === 'bn' ? toBn(countdown) : countdown) : '—'}
        </div>
        <div className="nw-next-line">
          {lang === 'bn' ? `${nextLabel} শুরু` : `${nextLabel} starts`} · <b>{next && timings ? formatTime12h(timings[next.name], lang) : '—'}</b>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="nw-body">
        {/* 5-waqt strip */}
        {timings ? (
          <div className="nw-waqt-strip">
            {PRAYER_ORDER.map(key => {
              if (!timings[key]) return null;
              const isCurrent = current?.name === key;
              const isNext    = !isCurrent && nextName === key;
              return (
                <div key={key} className={`nw-chip${isCurrent ? ' current' : ''}${isNext ? ' next' : ''}`}>
                  <div className="nw-chip-name">{prayerLabel(key, lang, isRamadan)}</div>
                  <div className="nw-chip-time">{shortTime(timings[key], lang)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="nw-load">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
        )}

        {weather && (
          <>
            <div className="nw-div" />
            <div className="nw-weather">
              <div className="nw-wx-temp">
                <WeatherIcon code={weather.current.weather_code} size={34} />
                <div>
                  <div className="nw-wx-num">
                    {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}°
                  </div>
                  <div className="nw-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
                </div>
              </div>
              <div className="nw-wx-stats">
                <span>{lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'} {lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%</span>
                <span>{lang === 'bn' ? 'বাতাস' : 'Wind'} {lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} {lang === 'bn' ? 'কিমি/ঘণ্টা' : 'km/h'}</span>
              </div>
            </div>
          </>
        )}

        {weather?.forecast?.length > 1 && (
          <>
            <div className="nw-div" />
            <div className="nw-forecast">
              {weather.forecast.slice(1, 4).map(d => {
                const dt = new Date(d.date);
                return (
                  <div key={d.date} className="nw-fday">
                    <div className="nw-fday-d">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                    <WeatherIcon code={d.weather_code} size={19} />
                    <div className="nw-fday-t">{lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="nw-foot">
        {sunEvent ? (
          <span className="nw-sun">
            {sunEvent.name === 'Sunrise'
              ? <Sunrise size={15} strokeWidth={2.2} color="#b9842b" />
              : <Sunset size={15} strokeWidth={2.2} color="#b9842b" />}
            {prayerLabel(sunEvent.name, lang)} {formatTime12h(sunEvent.time, lang)}
          </span>
        ) : <span />}
        <button className="nw-link" onClick={() => onNavigate('prayerTimes')}>
          {lang === 'bn' ? 'সম্পূর্ণ সূচি' : 'Full schedule'}
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
