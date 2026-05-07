import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CloudSun, Plus, Trash2, X, Save, RefreshCw, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function WeatherManagement({ weathers = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    city_bn: 'ঢাকা',
    city_en: 'Dhaka',
    date: new Date().toISOString().split('T')[0],
    temp_c: 30,
    condition_bn: 'রৌদ্রোজ্জ্বল',
    condition_en: 'Sunny',
    humidity: 60,
    wind_kph: 10,
    max_temp_c: 34,
    min_temp_c: 24,
    icon: 'sun'
  });

  const openAddModal = () => {
    setForm({
      city_bn: 'ঢাকা', city_en: 'Dhaka', date: new Date().toISOString().split('T')[0],
      temp_c: 30, condition_bn: 'রৌদ্রোজ্জ্বল', condition_en: 'Sunny',
      humidity: 60, wind_kph: 10, max_temp_c: 34, min_temp_c: 24, icon: 'sun'
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    setSaving(true);
    router.post(route('admin.weather.store'), form, {
      onSuccess: () => { setSaving(false); setShowModal(false); showToast('Weather updated'); },
      onError: () => setSaving(false)
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this record?')) {
      router.delete(route('admin.weather.destroy', id), {
        onSuccess: () => showToast('Record deleted')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Weather Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <CloudSun className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'আবহাওয়া ব্যবস্থাপনা' : 'Weather Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'শহরভিত্তিক আবহাওয়া আপডেট পরিচালনা করুন' : 'Manage city-wise weather updates'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন আপডেট' : 'New Update'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Temp</th>
              <th className="px-6 py-4">Condition</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {weathers.map(w => (
              <tr key={w.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                   <div className="font-bold text-gray-900">{lang === 'bn' ? w.city_bn : w.city_en}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-500">{w.date}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <Thermometer size={14} className="text-orange-500"/>
                      <span className="font-black text-gray-900">{w.temp_c}°C</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">({w.min_temp_c}-{w.max_temp_c})</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <Badge variant="blue">{lang === 'bn' ? w.condition_bn : w.condition_en}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => handleDelete(w.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <CloudSun className="text-[#263238]" size={22} />
                 Weather Update
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">City (BN/EN)</label>
                    <div className="flex gap-2">
                       <input type="text" value={form.city_bn} onChange={e => setForm({...form, city_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                       <input type="text" value={form.city_en} onChange={e => setForm({...form, city_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Current Temp</label>
                    <input type="number" value={form.temp_c} onChange={e => setForm({...form, temp_c: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Min Temp</label>
                    <input type="number" value={form.min_temp_c} onChange={e => setForm({...form, min_temp_c: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Max Temp</label>
                    <input type="number" value={form.max_temp_c} onChange={e => setForm({...form, max_temp_c: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Condition (BN)</label>
                    <input type="text" value={form.condition_bn} onChange={e => setForm({...form, condition_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Condition (EN)</label>
                    <input type="text" value={form.condition_en} onChange={e => setForm({...form, condition_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Humidity %</label>
                    <input type="number" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Wind Speed (kph)</label>
                    <input type="number" value={form.wind_kph} onChange={e => setForm({...form, wind_kph: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save Weather Data
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

