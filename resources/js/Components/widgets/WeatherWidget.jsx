import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getWeather } from '../../services/weatherService';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

export default function WeatherWidget() {
  const { lang } = useApp();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getWeather('dhaka').then((res) => setWeather(res.data));
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

  return (
    <div className="weather widget-block">
      <div className="w-city"><Icon name="mapPin" size={14} /> {lang === 'bn' ? 'ঢাকা' : 'Dhaka'}</div>
      <div className="w-main">
        <div>
          <div className="w-temp">{fmt(weather.temp)}°C</div>
          <div className="w-desc">{lang === 'bn' ? weather.conditionBn : weather.condition}</div>
        </div>
        <div className="w-icon"><Icon name="sun" size={44} /></div>
      </div>
      <div className="w-grid">
        <div>{lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'}: {fmt(weather.humidity)}%</div>
        <div>{lang === 'bn' ? 'বায়ু' : 'Wind'}: {fmt(weather.wind)} km/h</div>
        <div>{lang === 'bn' ? 'সর্বোচ্চ' : 'Max'}: {fmt(weather.maxTemp)}°</div>
        <div>{lang === 'bn' ? 'সর্বনিম্ন' : 'Min'}: {fmt(weather.minTemp)}°</div>
      </div>
    </div>
  );
}
