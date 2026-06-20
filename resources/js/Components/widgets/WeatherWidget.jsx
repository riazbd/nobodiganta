import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

export default function WeatherWidget() {
  const { lang } = useApp();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('/api/weather?city=dhaka')
      .then(r => r.json())
      .then(json => setWeather(json.data))
      .catch(() => {});
  }, []);

  const fmt = (n) => lang === 'bn' ? toBengaliNum(String(n)) : String(n);

  if (!weather) {
    return (
      <div className="weather widget-block">
        <div className="widget-header"><Icon name="sun" size={16} /> {lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</div>
        <div style={{ color: '#999', fontSize: 13, padding: '8px 0' }}>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
      </div>
    );
  }

  const cur = weather.current;
  const todayFc = weather.forecast?.[0];
  const cityName = lang === 'bn' ? (weather.city_bn || 'ঢাকা') : (weather.city || 'Dhaka');

  return (
    <div className="weather widget-block">
      <div className="w-city"><Icon name="mapPin" size={14} /> {cityName}</div>
      <div className="w-main">
        <div>
          <div className="w-temp">{fmt(Math.round(cur.temp_c))}°C</div>
          <div className="w-desc">{lang === 'bn' ? cur.condition_bn : cur.condition_en}</div>
        </div>
        <div className="w-icon"><Icon name="sun" size={44} /></div>
      </div>
      <div className="w-grid">
        <div>{lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'}: {fmt(cur.humidity)}%</div>
        <div>{lang === 'bn' ? 'বাতাস' : 'Wind'}: {fmt(Math.round(cur.wind_kph))} {lang === 'bn' ? 'কিমি/ঘণ্টা' : 'km/h'}</div>
        {todayFc && (
          <>
            <div>{lang === 'bn' ? 'সর্বোচ্চ' : 'Max'}: {fmt(Math.round(todayFc.max_c))}°</div>
            <div>{lang === 'bn' ? 'সর্বনিম্ন' : 'Min'}: {fmt(Math.round(todayFc.min_c))}°</div>
          </>
        )}
      </div>
    </div>
  );
}
