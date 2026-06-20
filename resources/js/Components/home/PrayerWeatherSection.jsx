import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { prayerLabel, findNextPrayer, findCurrentPrayer, findNextSunEvent, formatCountdown, toBn, formatTime12h, PRAYER_ORDER } from '../../lib/prayerUtils';
import { fetchWeatherDirect } from '../../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, ArrowRight, Navigation as NavIcon, Sunrise, Sunset } from 'lucide-react';

// Each weather code maps to an icon + a true-to-life colour so the widget reads
// at a glance (sunny = amber, rain = blue, storm = violet, fog = slate).
const WMO_META = {
  0:  { Icon: Sun,            color: '#f59e0b' },
  1:  { Icon: Sun,            color: '#f59e0b' },
  2:  { Icon: CloudSun,       color: '#f59e0b' },
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

  const next      = prayer ? findNextPrayer(prayer.timings) : null;
  const current   = prayer ? findCurrentPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;
  const sunEvent  = prayer ? findNextSunEvent(prayer.timings) : null;

  // Hero shows the active prayer; during a gap (no prayer running, e.g. after
  // sunrise before Dhuhr) it falls back to the upcoming/future prayer.
  const heroPrayer = current
    ?? (next && prayer ? { name: next.name, time: prayer.timings[next.name] } : null);

  // Show the next 3 prayers starting with the upcoming one (wraps to tomorrow
  // after Isha). The full daily schedule stays behind "সম্পূর্ণ সূচি".
  const startIdx = next ? PRAYER_ORDER.indexOf(next.name) : 0;
  const rows     = (startIdx >= 0
    ? Array.from({ length: 3 }, (_, i) => PRAYER_ORDER[(startIdx + i) % PRAYER_ORDER.length])
    : PRAYER_ORDER.slice(0, 3));
  const cityLabel = cityKey === '__location__'
    ? (lang === 'bn' ? 'আপনার অবস্থান' : 'Your location')
    : (CITY_OPTIONS.find(c => c.key === cityKey)?.[lang === 'bn' ? 'bn' : 'en']
       ?? (lang === 'bn' ? 'ঢাকা' : 'Dhaka'));

  const nextLabel = next
    ? (isRamadan && next.name === 'Maghrib'
        ? (lang === 'bn' ? 'ইফতার' : 'Iftar')
        : prayerLabel(next.name, lang, isRamadan))
    : '—';

  return (
    <div className={`pw${isRamadan ? ' pw-ramadan' : ''}`}>

      {/* Header */}
      <div className="pw-head">
        <span className="pw-head-title">{lang === 'bn' ? 'নামাজ ও আবহাওয়া' : 'Prayer & Weather'}</span>
        <div className="pw-head-right">
          <span className="pw-city">
            <MapPin size={11} strokeWidth={2.2} />
            <select className="pw-city-sel" value={cityKey} onChange={e => handleCityChange(e.target.value)} disabled={loading}>
              <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
              </option>
              {CITY_OPTIONS.map(c => (
                <option key={c.key} value={c.key}>{lang === 'bn' ? c.bn : c.en}</option>
              ))}
            </select>
          </span>
          <button className="pw-loc" onClick={handleLocate} disabled={loading} aria-label={lang === 'bn' ? 'অবস্থান' : 'Locate'}>
            <NavIcon size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Top — active prayer (left) + countdown to next (right).
          During a gap between two prayers (no prayer running), the left side
          shows the upcoming/future prayer instead. */}
      <div className="pw-top">
        <div className="pw-nextp">
          <div className="pw-nextp-name">{heroPrayer ? prayerLabel(heroPrayer.name, lang, isRamadan) : '—'}</div>
          <div className="pw-nextp-time">{heroPrayer ? formatTime12h(heroPrayer.time, lang) : '—'}</div>
        </div>
        <div className="pw-next">
          <div className="pw-next-label">{lang === 'bn' ? `${nextLabel} বাকি` : `${nextLabel} in`}</div>
          <div className="pw-next-cd">{next ? (lang === 'bn' ? toBn(countdown) : countdown) : '—'}</div>
        </div>
      </div>

      {/* Prayer times — compact 3-column grid */}
      {prayer ? (
        <div className="pw-grid">
          {rows.map((key, i) => {
            const time = prayer.timings[key];
            if (!time) return null;
            // Only the leading cell is the upcoming prayer; the rest are later
            // today or tomorrow — none are "past" in a next-3 view.
            const isNext  = i === 0;
            const isIftar = isRamadan && key === 'Maghrib';
            return (
              <div key={key} className={`pw-cell${isNext ? ' is-next' : ''}${isIftar ? ' is-iftar' : ''}`}>
                <span className="pw-cell-name">{prayerLabel(key, lang, isRamadan)}</span>
                <span className="pw-cell-time">{formatTime12h(time, lang)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pw-mini-load pw-grid-load">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
      )}

      {/* Current weather — temp/condition (left) + humidity/wind (right) */}
      {weather && (
        <div className="pw-wx-row">
          <div className="pw-wx">
            <WeatherIcon code={weather.current.weather_code} size={30} />
            <div className="pw-wx-info">
              <div className="pw-wx-temp">
                {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}<span className="pw-deg">°</span>
              </div>
              <div className="pw-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
            </div>
          </div>
          <div className="pw-wx-meta">
            {lang === 'bn' ? 'আর্দ্রতা' : 'Hum'} {lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%
            <span className="pw-dot">·</span>
            {lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} {lang === 'bn' ? 'কিমি/ঘণ্টা' : 'km/h'}
          </div>
        </div>
      )}

      {/* 3-day forecast strip */}
      {weather?.forecast?.length > 1 && (
        <div className="pw-fc">
          {weather.forecast.slice(1, 4).map(d => {
            const dt = new Date(d.date);
            return (
              <div key={d.date} className="pw-fc-day">
                <span className="pw-fc-name">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</span>
                <WeatherIcon code={d.weather_code} size={16} />
                <span className="pw-fc-temp">{lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer — next sun event (left) + full schedule link (right) */}
      <div className="pw-foot">
        {sunEvent ? (
          <span className="pw-meta">
            <span className="pw-sun">
              {sunEvent.name === 'Sunrise'
                ? <Sunrise size={14} strokeWidth={2.2} color="#f59e0b" />
                : <Sunset size={14} strokeWidth={2.2} color="#ea7317" />}
              {prayerLabel(sunEvent.name, lang)} {formatTime12h(sunEvent.time, lang)}
            </span>
          </span>
        ) : <span />}
        <button className="pw-link" onClick={() => onNavigate('prayerTimes')}>
          {lang === 'bn' ? 'সম্পূর্ণ সূচি' : 'Full schedule'}
          <ArrowRight size={11} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
