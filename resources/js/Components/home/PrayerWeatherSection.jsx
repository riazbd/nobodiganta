// resources/js/Components/home/PrayerWeatherSection.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { wmoEmoji } from '../../lib/wmo';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn } from '../../lib/prayerUtils';

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
  const next = prayer ? findNextPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;

  const displayRows = ['Imsak', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter(
    k => !isRamadan ? k !== 'Imsak' : true
  );

  return (
    <div className="pws-panel pws-prayer-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-icon">🕌</span>
        <span className="pws-panel-title">{lang === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}</span>
        {prayer && <span className="pws-date">{prayer.date.hijri_bn}</span>}
      </div>

      {isRamadan && (
        <div className="pws-ramadan-badge">🌙 {lang === 'bn' ? 'রমজান মোবারক' : 'Ramadan Mubarak'}</div>
      )}

      {prayer ? (
        <>
          <div className="pws-prayer-rows">
            {displayRows.map(key => {
              const time = prayer.timings[key];
              if (!time) return null;
              const isNext    = next?.name === key;
              const passed    = !isNext && isPassed(time);
              const isMaghrib = key === 'Maghrib';
              return (
                <div key={key} className={`pws-prayer-row${isNext ? ' next' : ''}${passed ? ' passed' : ''}${isRamadan && isMaghrib ? ' iftar' : ''}`}>
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
  const w = weather;
  if (!w) return <div className="pws-panel pws-weather-panel"><div className="pws-empty">...</div></div>;

  return (
    <div className="pws-panel pws-weather-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-icon">🌤</span>
        <span className="pws-panel-title">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</span>
        <span className="pws-date">{lang === 'bn' ? w.city_bn : w.city}</span>
      </div>

      <div className="pws-weather-main">
        <div className="pws-temp">
          {lang === 'bn' ? toBn(String(Math.round(w.current.temp_c))) : Math.round(w.current.temp_c)}°<span className="pws-temp-unit">C</span>
        </div>
        <div>
          <div className="pws-condition">{wmoEmoji(w.current.weather_code)} {lang === 'bn' ? w.current.condition_bn : w.current.condition_en}</div>
          <div className="pws-weather-meta">
            💧 {lang === 'bn' ? toBn(String(w.current.humidity)) : w.current.humidity}%
            &nbsp;·&nbsp;
            💨 {lang === 'bn' ? toBn(String(w.current.wind_kph)) : w.current.wind_kph} km/h
          </div>
          <div className="pws-weather-meta">
            {lang === 'bn' ? 'অনুভূতি' : 'Feels like'} {lang === 'bn' ? toBn(String(Math.round(w.current.feels_like_c))) : Math.round(w.current.feels_like_c)}°C
          </div>
        </div>
      </div>

      <div className="pws-forecast">
        {w.forecast.slice(0, 5).map((d, i) => {
          const dayLabel = i === 0
            ? (lang === 'bn' ? 'আজ' : 'Today')
            : new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' });
          return (
            <div key={d.date} className="pws-forecast-day">
              <div className="pws-forecast-label">{dayLabel}</div>
              <div className="pws-forecast-emoji">{wmoEmoji(d.weather_code)}</div>
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

export default function PrayerWeatherSection({ initialPrayer, initialWeather }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const [cityKey, setCityKey] = useState(() => localStorage.getItem('pws_city') || 'dhaka');
  const [prayer, setPrayer]   = useState(initialPrayer);
  const [weather, setWeather] = useState(initialWeather);
  const [loading, setLoading] = useState(false);

  const fetchCity = async (key) => {
    setLoading(true);
    try {
      const [pRes, wRes] = await Promise.all([
        fetch(`/api/prayer?city=${key}`).then(r => r.json()),
        fetch(`/api/weather?city=${key}`).then(r => r.json()),
      ]);
      setPrayer(pRes.data);
      setWeather(wRes.data);
    } catch (e) {
      console.error('Failed to fetch city data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (key) => {
    setCityKey(key);
    localStorage.setItem('pws_city', key);
    localStorage.removeItem('pws_lat');
    localStorage.removeItem('pws_lng');
    if (key !== 'dhaka' || !initialPrayer) fetchCity(key);
    else { setPrayer(initialPrayer); setWeather(initialWeather); }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setLoading(true);
      const { latitude: lat, longitude: lng } = pos.coords;
      localStorage.setItem('pws_lat', lat);
      localStorage.setItem('pws_lng', lng);
      const [pRes, wRes] = await Promise.all([
        fetch(`/api/prayer?lat=${lat}&lng=${lng}`).then(r => r.json()),
        fetch(`/api/weather?lat=${lat}&lng=${lng}`).then(r => r.json()),
      ]);
      if (pRes.data) { pRes.data.is_location = true; setPrayer(pRes.data); }
      if (wRes.data) setWeather(wRes.data);
      setCityKey('__location__');
      setLoading(false);
    }, () => {});
  };

  useEffect(() => {
    const savedCity = localStorage.getItem('pws_city');
    const savedLat  = localStorage.getItem('pws_lat');
    const savedLng  = localStorage.getItem('pws_lng');
    if (savedLat && savedLng) {
      handleLocate();
    } else if (savedCity && savedCity !== 'dhaka') {
      fetchCity(savedCity);
    }
  }, []);

  return (
    <div className={`pws-section${prayer?.is_ramadan ? ' pws-ramadan' : ''}`}>
      <div className="pws-inner">
        <div className="pws-header-row">
          <div className="pws-city-wrap">
            <select
              className="pws-city-select"
              value={cityKey === '__location__' ? '__location__' : cityKey}
              onChange={e => handleCityChange(e.target.value)}
              disabled={loading}
            >
              {cityKey === '__location__' && <option value="__location__">📍 {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}</option>}
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
            <button
              className="pws-locate-btn"
              onClick={handleLocate}
              title={lang === 'bn' ? 'আমার অবস্থান ব্যবহার করুন' : 'Use my location'}
            >
              📍
            </button>
          </div>
          <button className="pws-more-btn" onClick={() => onNavigate('prayer-times')}>
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
