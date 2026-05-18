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

  return (
    <section className={`almnc${isRamadan ? ' is-ramadan' : ''}`}>

      {/* Masthead */}
      <div className="almnc-masthead">
        <div className="almnc-mast-left">
          <div className="almnc-eyebrow">
            {lang === 'bn' ? 'নামাজ ও আবহাওয়া' : 'Prayers & Weather'}
            <span className="almnc-bullet">·</span>
            {cityLabel}
          </div>
          {prayer && (
            <div className="almnc-dateline">
              {formatGregorian(prayer.date.gregorian, lang)}
              <span className="almnc-bullet">·</span>
              {lang === 'bn' ? prayer.date.hijri_bn : (prayer.date.hijri_en ?? prayer.date.hijri_bn)}
            </div>
          )}
        </div>
        <div className="almnc-mast-right">
          <div className="almnc-city-pill">
            <MapPin size={12} strokeWidth={2} />
            <select className="almnc-city-select" value={cityKey} onChange={e => handleCityChange(e.target.value)} disabled={loading}>
              <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
              </option>
              {CITY_OPTIONS.map(c => (
                <option key={c.key} value={c.key}>{lang === 'bn' ? c.bn : c.en}</option>
              ))}
            </select>
          </div>
          <button className="almnc-icon-btn" onClick={handleLocate} disabled={loading} aria-label={lang === 'bn' ? 'অবস্থান' : 'Locate'}>
            <NavIcon size={13} strokeWidth={2} />
          </button>
          <button className="almnc-link" onClick={() => onNavigate('prayerTimes')}>
            {lang === 'bn' ? 'সম্পূর্ণ সূচি' : 'Full schedule'}
            <ArrowRight size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Body — 3 columns: countdown · prayer list · weather */}
      <div className="almnc-body">
        {/* COUNTDOWN */}
        <div className="almnc-col almnc-col-countdown">
          <div className="almnc-section-label">
            {isRamadan && next?.name === 'Maghrib'
              ? (lang === 'bn' ? 'ইফতার বাকি' : 'Iftar in')
              : (lang === 'bn' && next ? `${prayerLabel(next.name, lang, isRamadan)} বাকি` : (next ? `${prayerLabel(next.name, lang, false)} in` : '—'))}
          </div>
          {next && prayer ? (
            <>
              <div className="almnc-countdown">{lang === 'bn' ? toBn(countdown) : countdown}</div>
              <div className="almnc-countdown-at">
                {lang === 'bn' ? 'সময়' : 'at'} {formatTime12h(prayer.timings[next.name], lang)}
              </div>
            </>
          ) : (
            <div className="almnc-loading">{lang === 'bn' ? '...' : '...'}</div>
          )}
        </div>

        {/* PRAYER LIST */}
        <div className="almnc-col almnc-col-list">
          <div className="almnc-section-label">{lang === 'bn' ? 'আজকের সূচি' : "Today's Schedule"}</div>
          {prayer ? (
            <ul className="almnc-list">
              {rows.map(key => {
                const time = prayer.timings[key];
                if (!time) return null;
                const isNext  = next?.name === key;
                const passed  = !isNext && key !== 'Imsak' && isPassed(time);
                const isIftar = isRamadan && key === 'Maghrib';
                const isSehri = isRamadan && key === 'Imsak';
                return (
                  <li key={key} className={`almnc-li${isNext ? ' is-next' : ''}${passed ? ' is-past' : ''}${isIftar ? ' is-iftar' : ''}${isSehri ? ' is-sehri' : ''}`}>
                    <span className="almnc-li-name">{prayerLabel(key, lang, isRamadan)}</span>
                    <span className="almnc-li-leader" />
                    <span className="almnc-li-time">{formatTime12h(time, lang)}</span>
                    {isNext && <span className="almnc-li-marker">{lang === 'bn' ? 'পরবর্তী' : 'NEXT'}</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="almnc-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
          )}
        </div>

        {/* WEATHER */}
        <div className="almnc-col almnc-col-weather">
          <div className="almnc-section-label">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</div>
          {weather ? (
            <>
              <div className="almnc-wx-main">
                <WeatherIcon code={weather.current.weather_code} size={40} />
                <div className="almnc-wx-temp">
                  {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}<span className="almnc-deg">°</span>
                </div>
              </div>
              <div className="almnc-wx-cond">{lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}</div>
              <div className="almnc-wx-meta">
                {lang === 'bn' ? 'আর্দ্রতা' : 'Hum'} {lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%
                <span className="almnc-bullet">·</span>
                {lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} km/h
              </div>

              <div className="almnc-wx-forecast">
                {weather.forecast.slice(1, 5).map(d => {
                  const dt = new Date(d.date);
                  return (
                    <div key={d.date} className="almnc-wx-day">
                      <div className="almnc-wx-day-name">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                      <WeatherIcon code={d.weather_code} size={14} />
                      <div className="almnc-wx-day-temp">{lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="almnc-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
          )}
        </div>
      </div>
    </section>
  );
}
