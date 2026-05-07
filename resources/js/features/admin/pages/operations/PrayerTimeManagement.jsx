import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Clock, Plus, Trash2, X, Save, RefreshCw, Calendar, Moon } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function PrayerTimeManagement({ times = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', sunset: '', isha: '', isha_end: ''
  });

  const openAddModal = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', sunset: '', isha: '', isha_end: ''
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    setSaving(true);
    router.post(route('admin.prayer-times.store'), form, {
      onSuccess: () => { setSaving(false); setShowModal(false); showToast('Times saved'); },
      onError: () => setSaving(false)
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete these records?')) {
      router.delete(route('admin.prayer-times.destroy', id), {
        onSuccess: () => showToast('Deleted successfully')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Prayer Times Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <Moon className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'নামাজের সময়সূচী ব্যবস্থাপনা' : 'Prayer Times Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'দৈনিক নামাজের ওয়াক্ত ও সময়সূচী পরিচালনা করুন' : 'Manage daily prayer times and schedules'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন সময়সূচী' : 'Add Times'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Fajr</th>
              <th className="px-6 py-4 text-center">Dhuhr</th>
              <th className="px-6 py-4 text-center">Asr</th>
              <th className="px-6 py-4 text-center">Maghrib</th>
              <th className="px-6 py-4 text-center">Isha</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {times.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-bold text-gray-900">{t.date}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{t.fajr}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{t.dhuhr}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{t.asr}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{t.maghrib}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{t.isha}</td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Clock className="text-[#263238]" size={22} />
                 Set Prayer Times
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'sunset', 'isha', 'isha_end'].map(field => (
                    <div key={field}>
                       <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">{field.replace('_', ' ')}</label>
                       <input 
                         type="text" 
                         value={form[field]} 
                         onChange={e => setForm({...form, [field]: e.target.value})} 
                         className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#263238]" 
                         placeholder="00:00 AM"
                       />
                    </div>
                  ))}
               </div>

               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save All Times
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

