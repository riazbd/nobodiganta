import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn } from '../../lib/prayerUtils';
import { fetchWeatherDirect } from '../../lib/bangladeshCities';

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

function PrayerPanel({ prayer, lang }) {
  const next      = prayer ? findNextPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;
  const rows      = ['Imsak','Fajr','Dhuhr','Asr','Maghrib','Isha'].filter(k => isRamadan || k !== 'Imsak');

  return (
    <div className="pws-panel pws-prayer-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-title">{lang === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}</span>
        {prayer && <span className="pws-date">{prayer.date.hijri_bn}</span>}
      </div>
      {isRamadan && <div className="pws-ramadan-badge">{lang === 'bn' ? 'রমজান মোবারক' : 'Ramadan Mubarak'}</div>}
      {prayer ? (
        <>
          <div className="pws-prayer-rows">
            {rows.map(key => {
              const time = prayer.timings[key];
              if (!time) return null;
              const isNext = next?.name === key;
              const passed = !isNext && isPassed(time);
              return (
                <div key={key} className={`pws-prayer-row${isNext ? ' next' : ''}${passed ? ' passed' : ''}${isRamadan && key === 'Maghrib' ? ' iftar' : ''}`}>
                  <span className="pws-prayer-name">{prayerLabel(key, lang, isRamadan)}</span>
                  <span className="pws-prayer-time">{lang === 'bn' ? toBn(time) : time}</span>
                  {isNext && <span className="pws-pulse" />}
                </div>
              );
            })}
          </div>
          <div className="pws-countdown">
            <span className="pws-countdown-label">
              {isRamadan && next?.name === 'Maghrib'
                ? (lang === 'bn' ? 'ইফতার বাকি' : 'Iftar in')
                : (lang === 'bn' ? 'পরবর্তী নামাজ' : 'Next prayer')}
            </span>
            <span className="pws-countdown-time">{countdown}</span>
          </div>
        </>
      ) : (
        <div className="pws-empty">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
      )}
    </div>
  );
}

function WeatherPanel({ weather, lang }) {
  if (!weather) return (
    <div className="pws-panel pws-weather-panel">
      <div className="pws-panel-hdr"><span className="pws-panel-title">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</span></div>
      <div className="pws-empty">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
    </div>
  );
  const w = weather;
  return (
    <div className="pws-panel pws-weather-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-title">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</span>
        <span className="pws-date">{lang === 'bn' ? w.city_bn : w.city}</span>
      </div>
      <div className="pws-weather-main">
        <div className="pws-temp">
          {lang === 'bn' ? toBn(String(Math.round(w.current.temp_c))) : Math.round(w.current.temp_c)}°<span className="pws-temp-unit">C</span>
        </div>
        <div>
          <div className="pws-condition">{lang === 'bn' ? w.current.condition_bn : w.current.condition_en}</div>
          <div className="pws-weather-meta">
            {lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'}: {lang === 'bn' ? toBn(String(w.current.humidity)) : w.current.humidity}%
            &nbsp;·&nbsp;
            {lang === 'bn' ? 'বায়ু' : 'Wind'}: {lang === 'bn' ? toBn(String(w.current.wind_kph)) : w.current.wind_kph} km/h
          </div>
          <div className="pws-weather-meta">
            {lang === 'bn' ? 'অনুভূতি' : 'Feels like'} {lang === 'bn' ? toBn(String(Math.round(w.current.feels_like_c))) : Math.round(w.current.feels_like_c)}°C
          </div>
        </div>
      </div>
      <div className="pws-forecast">
        {w.forecast.slice(0, 5).map((d, i) => {
          const day = i === 0
            ? (lang === 'bn' ? 'আজ' : 'Today')
            : new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' });
          return (
            <div key={d.date} className="pws-forecast-day">
              <div className="pws-forecast-label">{day}</div>
              <div className="pws-forecast-temp">
                {lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°
                <span className="pws-forecast-min">/{lang === 'bn' ? toBn(String(Math.round(d.min_c))) : Math.round(d.min_c)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrayerWeatherSection({ initialPrayer }) {
  const { lang }        = useApp();
  const { onNavigate }  = useNavigation();

  // cityKey: named city key or '__location__' when using GPS
  const [cityKey,  setCityKey]  = useState('dhaka');
  const [gpsCoords, setGpsCoords] = useState(null);   // { lat, lng } when using location
  const [prayer,   setPrayer]   = useState(initialPrayer || null);
  const [weather,  setWeather]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  // Core load function — always called with explicit city or coords
  const load = async (key, coords) => {
    setLoading(true);
    try {
      const prayerUrl = coords
        ? `/api/prayer?lat=${coords.lat}&lng=${coords.lng}`
        : `/api/prayer?city=${key}`;

      // Prayer from Laravel server, weather directly from Open-Meteo in browser
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

  // On mount: restore saved city/coords and load weather (server gave us prayer)
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
      // If server already gave us prayer for Dhaka, only fetch weather
      if (initialPrayer && savedCity === 'dhaka') {
        fetchWeatherDirect('dhaka').then(w => { if (w) setWeather(w); });
      } else {
        load(savedCity, null);
      }
    }
  }, []);

  const handleCityChange = (key) => {
    if (key === cityKey && !gpsCoords) return; // no-op if same city
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem('pws_lat', coords.lat);
        localStorage.setItem('pws_lng', coords.lng);
        setCityKey('__location__');
        setGpsCoords(coords);
        load('dhaka', coords);
      },
      () => setLoading(false)
    );
  };

  return (
    <div className={`pws-section${prayer?.is_ramadan ? ' pws-ramadan' : ''}`}>
      <div className="pws-inner">
        <div className="pws-header-row">
          <div className="pws-city-wrap">
            <select
              className="pws-city-select"
              value={cityKey}
              onChange={e => handleCityChange(e.target.value)}
              disabled={loading}
            >
              {/* __location__ option always present so select value always matches */}
              <option value="__location__" disabled={cityKey !== '__location__'} style={{ display: cityKey === '__location__' ? '' : 'none' }}>
                {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}
              </option>
              <option value="dhaka">{lang === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
              <option value="chittagong">{lang === 'bn' ? 'চট্টগ্রাম' : 'Chittagong'}</option>
              <option value="sylhet">{lang === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
              <option value="rajshahi">{lang === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
              <option value="khulna">{lang === 'bn' ? 'খুলনা' : 'Khulna'}</option>
              <option value="barisal">{lang === 'bn' ? 'বরিশাল' : 'Barisal'}</option>
              <option value="rangpur">{lang === 'bn' ? 'রংপুর' : 'Rangpur'}</option>
              <option value="mymensingh">{lang === 'bn' ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
              <option value="comilla">{lang === 'bn' ? 'কুমিল্লা' : 'Comilla'}</option>
              <option value="narayanganj">{lang === 'bn' ? 'নারায়ণগঞ্জ' : 'Narayanganj'}</option>
              <option value="gazipur">{lang === 'bn' ? 'গাজীপুর' : 'Gazipur'}</option>
              <option value="jessore">{lang === 'bn' ? 'যশোর' : 'Jessore'}</option>
              <option value="bogra">{lang === 'bn' ? 'বগুড়া' : 'Bogra'}</option>
              <option value="coxsbazar">{lang === 'bn' ? 'কক্সবাজার' : "Cox's Bazar"}</option>
            </select>
            <button className="pws-locate-btn" onClick={handleLocate} disabled={loading}>
              {lang === 'bn' ? 'অবস্থান' : 'Locate'}
            </button>
          </div>
          <button className="pws-more-btn" onClick={() => onNavigate('prayerTimes')}>
            {lang === 'bn' ? 'বিস্তারিত সময়সূচি »' : 'Full timetable »'}
          </button>
        </div>
        <div className="pws-panels">
          <PrayerPanel prayer={prayer} lang={lang} />
          <WeatherPanel weather={weather} lang={lang} />
        </div>
      </div>
    </div>
  );
}
