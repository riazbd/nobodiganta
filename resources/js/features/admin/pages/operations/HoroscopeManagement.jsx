import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Star, Plus, Trash2, X, Save, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function HoroscopeManagement({ horoscopes = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const SIGNS = [
    { en: 'Aries', bn: 'মেষ' }, { en: 'Taurus', bn: 'বৃষ' }, { en: 'Gemini', bn: 'মিথুন' },
    { en: 'Cancer', bn: 'কর্কট' }, { en: 'Leo', bn: 'সিংহ' }, { en: 'Virgo', bn: 'কন্যা' },
    { en: 'Libra', bn: 'তুলা' }, { en: 'Scorpio', bn: 'বৃশ্চিক' }, { en: 'Sagittarius', bn: 'ধনু' },
    { en: 'Capricorn', bn: 'মকর' }, { en: 'Aquarius', bn: 'কুম্ভ' }, { en: 'Pisces', bn: 'মীন' }
  ];

  const [form, setForm] = useState({
    sign: 'Aries',
    sign_bn: 'মেষ',
    date: new Date().toISOString().split('T')[0],
    prediction_en: '',
    prediction_bn: ''
  });

  const openAddModal = () => {
    setForm({
      sign: 'Aries', sign_bn: 'মেষ', 
      date: new Date().toISOString().split('T')[0],
      prediction_en: '', prediction_bn: ''
    });
    setShowModal(true);
  };

  const handleSignChange = (e) => {
    const sign = SIGNS.find(s => s.en === e.target.value);
    setForm({ ...form, sign: sign.en, sign_bn: sign.bn });
  };

  const handleSubmit = () => {
    setSaving(true);
    router.post(route('admin.horoscope.store'), form, {
      onSuccess: () => { setSaving(false); setShowModal(false); showToast('Horoscope saved'); },
      onError: () => setSaving(false)
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this horoscope?')) {
      router.delete(route('admin.horoscope.destroy', id), {
        onSuccess: () => showToast('Deleted successfully')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Horoscope Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <Star className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'রাশিফল ব্যবস্থাপনা' : 'Horoscope Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'দৈনিক রাশিফল ও ভাগ্যফল পরিচালনা করুন' : 'Manage daily horoscopes and predictions'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন রাশিফল' : 'New Entry'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {horoscopes.map(h => (
          <div key={h.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#263238]">
                     <Sparkles size={20}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{lang === 'bn' ? h.sign_bn : h.sign}</h3>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{h.date}</div>
                  </div>
               </div>
               <button onClick={() => handleDelete(h.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
               <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-[10px] font-black text-gray-400 uppercase mb-2">English Prediction</div>
                  <p className="text-gray-600 leading-relaxed italic">{h.prediction_en}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-[10px] font-black text-gray-400 uppercase mb-2">বাংলা পূর্বাভাস</div>
                  <p className="text-gray-600 leading-relaxed font-Bengali">{h.prediction_bn}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Star className="text-[#263238]" size={22} />
                 Daily Horoscope
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Zodiac Sign</label>
                    <select value={form.sign} onChange={handleSignChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]">
                       {SIGNS.map(s => <option key={s.en} value={s.en}>{s.en} ({s.bn})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Prediction (EN)</label>
                  <textarea value={form.prediction_en} onChange={e => setForm({...form, prediction_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238] h-24" placeholder="Write in English..."></textarea>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Prediction (BN)</label>
                  <textarea value={form.prediction_bn} onChange={e => setForm({...form, prediction_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238] h-24" placeholder="বাংলায় লিখুন..."></textarea>
               </div>

               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save Horoscope
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

