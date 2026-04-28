import { TrendingUp, Trophy, DollarSign, BarChart2, CloudSun, Star, Clock, Moon, Thermometer, Wind, Droplets, MapPin } from 'lucide-react';
import { Badge } from '../feedback/Badge';

export function StockWidget({ stocks = [], lang = 'bn' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
          <TrendingUp size={14} className="text-[#e8001e]" /> {lang === 'bn' ? 'শেয়ার বাজার' : 'Stock Market'}
        </h4>
      </div>
      <div className="divide-y divide-gray-50">
        {stocks.map(s => (
          <div key={s.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div>
              <div className="text-[12.5px] font-bold text-gray-800">{lang === 'bn' ? s.name_bn : s.name_en}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">{s.name_en}</div>
            </div>
            <div className="text-right">
              <div className="text-[12.5px] font-black text-gray-900 font-Inter">{s.value}</div>
              <div className={`text-[10px] font-bold ${s.is_up === true ? 'text-green-600' : s.is_up === false ? 'text-red-600' : 'text-gray-400'}`}>
                {s.is_up === true ? '▲' : s.is_up === false ? '▼' : '—'} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CricketWidget({ matches = [], lang = 'bn' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50">
        <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
          <Trophy size={14} className="text-[#e8001e]" /> {lang === 'bn' ? 'লাইভ ক্রিকেট' : 'Live Cricket'}
        </h4>
      </div>
      <div className="p-4 space-y-4">
        {matches.map(m => (
          <div key={m.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-[#e8001e] uppercase tracking-wider">{m.status}</span>
              <span className="text-[10px] text-gray-400 font-bold">{lang === 'bn' ? m.status_text_bn : m.status_text_en}</span>
            </div>
            <div className="space-y-2">
              {m.teams?.map((t, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">{lang === 'bn' ? t.name_bn : t.name_en}</span>
                  {m.status !== 'upcoming' && (
                    <span className="text-xs font-black text-gray-900 font-Inter">{t.score || 0}/{t.wickets || 0} <span className="text-[10px] text-gray-400 font-normal">({t.overs || 0})</span></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PriceWidget({ prices = [], lang = 'bn' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50">
        <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
          <DollarSign size={14} className="text-[#e8001e]" /> {lang === 'bn' ? 'বাজার দর' : 'Market Prices'}
        </h4>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {prices.map(p => (
          <div key={p.id} className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-[10px] font-black text-gray-400 uppercase mb-1">{lang === 'bn' ? p.title_bn : p.title_en}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-black text-gray-900 font-Inter">{p.amount}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">{p.currency}/{p.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PollWidget({ poll, lang = 'bn' }) {
  if (!poll) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
          <BarChart2 size={14} className="text-[#e8001e]" /> {lang === 'bn' ? 'জনমত জরিপ' : 'Current Poll'}
        </h4>
        <Badge variant="green" className="!text-[9px]">LIVE</Badge>
      </div>
      <div className="p-4">
        <p className="text-[12.5px] font-bold text-gray-800 mb-4">{lang === 'bn' ? poll.question_bn : poll.question_en}</p>
        <div className="space-y-3">
          {poll.options?.map(opt => (
            <div key={opt.id}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-bold text-gray-600">{lang === 'bn' ? opt.option_bn : opt.option_en}</span>
                <span className="font-black text-[#e8001e]">{poll.total_votes > 0 ? Math.round(opt.votes / poll.total_votes * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-[#e8001e] h-full rounded-full transition-all duration-500" style={{ width: `${poll.total_votes > 0 ? (opt.votes / poll.total_votes * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WeatherWidget({ weather, lang = 'bn' }) {
  if (!weather) return null;
  return (
    <div className="bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white rounded-xl shadow-sm overflow-hidden p-4 relative">
      <CloudSun className="absolute -bottom-2 -right-2 w-24 h-24 text-white/10" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
           <div className="text-[11px] font-black uppercase opacity-70 tracking-wider flex items-center gap-1">
             <MapPin size={10} /> {lang === 'bn' ? weather.city_bn : weather.city_en}
           </div>
           <div className="text-3xl font-black font-Inter mt-1">{weather.temp_c}°C</div>
           <div className="text-xs font-bold mt-1 opacity-90">{lang === 'bn' ? weather.condition_bn : weather.condition_en}</div>
        </div>
        <Badge variant="blue" className="bg-white/20 border-none text-white !text-[9px] backdrop-blur-md uppercase">{weather.date}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
         <div className="bg-white/10 rounded-lg p-2 text-center">
            <Droplets size={12} className="mx-auto mb-1 opacity-70" />
            <div className="text-[10px] font-black">{weather.humidity}%</div>
         </div>
         <div className="bg-white/10 rounded-lg p-2 text-center">
            <Wind size={12} className="mx-auto mb-1 opacity-70" />
            <div className="text-[10px] font-black">{weather.wind_kph}k/h</div>
         </div>
         <div className="bg-white/10 rounded-lg p-2 text-center">
            <Thermometer size={12} className="mx-auto mb-1 opacity-70" />
            <div className="text-[10px] font-black">{weather.max_temp_c}°</div>
         </div>
      </div>
    </div>
  );
}

export function PrayerTimeWidget({ prayerTime, lang = 'bn' }) {
  if (!prayerTime) return null;
  const PRAYERS = [
    { id: 'fajr', en: 'Fajr', bn: 'ফজর' },
    { id: 'dhuhr', en: 'Dhuhr', bn: 'জোহর' },
    { id: 'asr', en: 'Asr', bn: 'আসর' },
    { id: 'maghrib', en: 'Maghrib', bn: 'মাগরিব' },
    { id: 'isha', en: 'Isha', bn: 'এশা' }
  ];

  return (
    <div className="bg-[#0f1117] text-white rounded-xl shadow-sm overflow-hidden p-4 relative border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
           <Moon size={16} />
        </div>
        <div>
           <h4 className="text-xs font-black uppercase tracking-wider">{lang === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}</h4>
           <p className="text-[10px] font-bold text-gray-500 uppercase">{prayerTime.date}</p>
        </div>
      </div>
      <div className="space-y-2">
         {PRAYERS.map(p => (
           <div key={p.id} className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-[11px] font-bold text-gray-400">{lang === 'bn' ? p.bn : p.en}</span>
              <span className="text-[11px] font-black text-green-400 font-Inter">{prayerTime[p.id]}</span>
           </div>
         ))}
      </div>
    </div>
  );
}

export function HoroscopeWidget({ horoscopes = [], lang = 'bn' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50">
        <h4 className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
          <Star size={14} className="text-[#e8001e]" /> {lang === 'bn' ? 'রাশিফল' : 'Horoscope'}
        </h4>
      </div>
      <div className="p-4 space-y-3">
        {horoscopes.slice(0, 2).map(h => (
          <div key={h.id} className="group">
             <div className="text-[11px] font-black text-[#e8001e] uppercase tracking-wider mb-1">{lang === 'bn' ? h.sign_bn : h.sign}</div>
             <p className="text-[10.5px] text-gray-600 line-clamp-2 leading-relaxed">
                {lang === 'bn' ? h.prediction_bn : h.prediction_en}
             </p>
          </div>
        ))}
        <button className="w-full text-[10px] font-bold text-gray-400 uppercase pt-2 border-t border-gray-50 hover:text-[#e8001e] transition-colors">View All Signs →</button>
      </div>
    </div>
  );
}
