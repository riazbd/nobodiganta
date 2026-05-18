import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { prayerLabel, findNextPrayer, formatCountdown, toBn, formatTime12h, formatGregorian } from '../../lib/prayerUtils';
import { fetchWeatherDirect } from '../../lib/bangladeshCities';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, CloudDrizzle, CloudSun, MapPin, Wind, Droplets, ArrowRight, Navigation as NavIcon } from 'lucide-react';
import PrayerTrack from '../prayer/PrayerTrack';

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
      console.error('PrayerWeather load failed', e);
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
  const cityLabel = cityKey === '__location__'
    ? (lang === 'bn' ? 'আপনার অবস্থান' : 'Your location')
    : (CITY_OPTIONS.find(c => c.key === cityKey)?.[lang === 'bn' ? 'bn' : 'en']
       ?? (lang === 'bn' ? 'ঢাকা' : 'Dhaka'));

  return (
    <section className={`pws-block${isRamadan ? ' is-ramadan' : ''}`}>

      {/* HEAD: title strip with city + meta */}
      <header className="pws-head">
        <div className="pws-head-left">
          <h2 className="pws-head-title">
            {lang === 'bn' ? 'আজকের সময়সূচি' : 'Today’s Schedule'}
          </h2>
          {prayer && (
            <div className="pws-head-meta">
              {formatGregorian(prayer.date.gregorian, lang)}
              <span className="pws-dot" />
              {prayer.date.hijri_bn}
            </div>
          )}
        </div>
        <div className="pws-head-right">
          <div className="pws-city-pill">
            <MapPin size={13} strokeWidth={2.2} />
            <select
              className="pws-city-select"
              value={cityKey}
              onChange={e => handleCityChange(e.target.value)}
              disabled={loading}
            >
              <option value="__location__" style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
              </option>
              {CITY_OPTIONS.map(c => (
                <option key={c.key} value={c.key}>{lang === 'bn' ? c.bn : c.en}</option>
              ))}
            </select>
          </div>
          <button className="pws-icon-btn" onClick={handleLocate} disabled={loading} title={lang === 'bn' ? 'অবস্থান' : 'Locate'}>
            <NavIcon size={14} strokeWidth={2.2} />
          </button>
          <button className="pws-full-link" onClick={() => onNavigate('prayerTimes')}>
            {lang === 'bn' ? 'সম্পূর্ণ সূচি' : 'Full schedule'}
            <ArrowRight size={13} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* BODY: countdown hero + weather panel */}
      <div className="pws-body">
        {/* Countdown + Track */}
        <div className="pws-prayer-zone">
          {next && prayer ? (
            <div className="pws-countdown-hero">
              <div className="pws-countdown-label">
                {isRamadan && next.name === 'Maghrib'
                  ? (lang === 'bn' ? 'ইফতার পর্যন্ত' : 'Iftar in')
                  : (lang === 'bn' ? `${prayerLabel(next.name, lang, isRamadan)} পর্যন্ত` : `${prayerLabel(next.name, lang, isRamadan)} in`)}
              </div>
              <div className="pws-countdown-time">
                {lang === 'bn' ? toBn(countdown) : countdown}
              </div>
              <div className="pws-countdown-at">
                {lang === 'bn' ? 'সময়:' : 'at'} {formatTime12h(prayer.timings[next.name], lang)}
              </div>
            </div>
          ) : (
            <div className="pws-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
          )}

          {prayer && (
            <PrayerTrack prayer={prayer} next={next} lang={lang} size="md" />
          )}
        </div>

        {/* Weather */}
        <aside className="pws-weather-zone">
          {weather ? (
            <>
              <div className="pws-weather-card">
                <div className="pws-weather-icon">
                  <WeatherIcon code={weather.current.weather_code} size={44} />
                </div>
                <div className="pws-weather-info">
                  <div className="pws-weather-temp">
                    {lang === 'bn' ? toBn(String(Math.round(weather.current.temp_c))) : Math.round(weather.current.temp_c)}<span className="pws-deg">°</span>
                  </div>
                  <div className="pws-weather-city">{cityLabel}</div>
                  <div className="pws-weather-cond">
                    {lang === 'bn' ? weather.current.condition_bn : weather.current.condition_en}
                  </div>
                </div>
              </div>
              <div className="pws-weather-stats">
                <div className="pws-stat">
                  <Droplets size={12} strokeWidth={1.8} />
                  <span>{lang === 'bn' ? toBn(String(weather.current.humidity)) : weather.current.humidity}%</span>
                </div>
                <div className="pws-stat">
                  <Wind size={12} strokeWidth={1.8} />
                  <span>{lang === 'bn' ? toBn(String(Math.round(weather.current.wind_kph))) : Math.round(weather.current.wind_kph)} km/h</span>
                </div>
                <div className="pws-stat pws-stat-feel">
                  {lang === 'bn' ? 'অনুভব ' : 'Feels '}
                  {lang === 'bn' ? toBn(String(Math.round(weather.current.feels_like_c))) : Math.round(weather.current.feels_like_c)}°
                </div>
              </div>
              <div className="pws-forecast">
                {weather.forecast.slice(1, 5).map(d => {
                  const dt = new Date(d.date);
                  return (
                    <div key={d.date} className="pws-fc">
                      <div className="pws-fc-day">{dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}</div>
                      <WeatherIcon code={d.weather_code} size={16} />
                      <div className="pws-fc-temp">
                        {lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="pws-loading">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
          )}
        </aside>
      </div>
    </section>
  );
}
