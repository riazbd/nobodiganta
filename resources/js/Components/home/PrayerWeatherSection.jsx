import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, formatTime12h, formatGregorian } from '../../lib/prayerUtils';
import { fetchWeatherDirect } from '../../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, ArrowRight, Navigation as NavIcon } from 'lucide-react';

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
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;
  const rows      = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter(k => isRamadan || k !== 'Imsak');
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

      {/* Top — weather + next prayer countdown side by side */}
      <div className="pw-top">
        <div className="pw-wx">
          {weather ? (
            <>
              <WeatherIcon code={weather.current.weather_code} size={30} />
              <div className="pw-wx-info">
                <div className="pw-wx-temp">
                  {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}<span className="pw-deg">°</span>
                </div>
                <div className="pw-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
              </div>
            </>
          ) : <span className="pw-mini-load">···</span>}
        </div>
        <div className="pw-next">
          <div className="pw-next-label">{lang === 'bn' ? `${nextLabel} বাকি` : `${nextLabel} in`}</div>
          <div className="pw-next-cd">{next ? (lang === 'bn' ? toBn(countdown) : countdown) : '—'}</div>
        </div>
      </div>

      {/* Prayer times — compact 3-column grid */}
      {prayer ? (
        <div className="pw-grid">
          {rows.map(key => {
            const time = prayer.timings[key];
            if (!time) return null;
            const isNext  = next?.name === key;
            const passed  = !isNext && key !== 'Imsak' && isPassed(time);
            const isIftar = isRamadan && key === 'Maghrib';
            const isSehri = isRamadan && key === 'Imsak';
            return (
              <div key={key} className={`pw-cell${isNext ? ' is-next' : ''}${passed ? ' is-past' : ''}${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}>
                <span className="pw-cell-name">{prayerLabel(key, lang, isRamadan)}</span>
                <span className="pw-cell-time">{formatTime12h(time, lang)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pw-mini-load pw-grid-load">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
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

      {/* Footer — weather meta + full schedule link */}
      <div className="pw-foot">
        {weather ? (
          <span className="pw-meta">
            {lang === 'bn' ? 'আর্দ্রতা' : 'Hum'} {lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%
            <span className="pw-dot">·</span>
            {lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} km/h
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
