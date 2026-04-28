import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BarChart2, Plus, Edit3, Trash2, X, Save, RefreshCw, Activity, Calendar } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function PollManagement({ polls = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    question_bn: '',
    question_en: '',
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    options: [
      { option_bn: '', option_en: '' },
      { option_bn: '', option_en: '' }
    ]
  });

  const openAddModal = () => {
    setForm({
      question_bn: '', question_en: '', is_active: true, 
      start_date: new Date().toISOString().split('T')[0], end_date: '',
      options: [{ option_bn: '', option_en: '' }, { option_bn: '', option_en: '' }]
    });
    setShowModal(true);
  };

  const updateOption = (idx, field, val) => {
    const next = [...form.options];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, options: next });
  };

  const addOption = () => setForm({ ...form, options: [...form.options, { option_bn: '', option_en: '' }] });

  const handleSubmit = () => {
    setSaving(true);
    router.post(route('admin.polls.store'), form, {
      onSuccess: () => { setSaving(false); setShowModal(false); showToast('Poll created'); },
      onError: () => setSaving(false)
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this poll?')) {
      router.delete(route('admin.polls.destroy', id), {
        onSuccess: () => showToast('Poll deleted')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Poll Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'জনমত জরিপ ব্যবস্থাপনা' : 'Poll Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'পাঠকদের জরিপ ও ফলাফল পরিচালনা করুন' : 'Manage reader polls and results'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন জরিপ' : 'New Poll'}
        </button>
      </div>

      <div className="space-y-6">
        {polls.map(poll => (
          <div key={poll.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                 <Badge variant={poll.is_active ? 'green' : 'gray'} className="mb-2">
                    {poll.is_active ? (lang === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'INACTIVE')}
                 </Badge>
                 <h3 className="text-lg font-bold text-gray-900">{lang === 'bn' ? poll.question_bn : poll.question_en}</h3>
                 <div className="flex gap-4 mt-2 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {poll.start_date} - {poll.end_date || 'Ongoing'}</span>
                    <span className="flex items-center gap-1"><Activity size={12}/> {poll.total_votes} {lang === 'bn' ? 'ভোট' : 'votes'}</span>
                 </div>
              </div>
              <button onClick={() => handleDelete(poll.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {poll.options?.map(opt => (
                 <div key={opt.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-bold text-gray-700">{lang === 'bn' ? opt.option_bn : opt.option_en}</span>
                       <span className="font-black text-[#e8001e]">{opt.votes}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className="bg-[#e8001e] h-full transition-all duration-500" 
                         style={{ width: `${poll.total_votes > 0 ? (opt.votes / poll.total_votes * 100) : 0}%` }}
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <BarChart2 className="text-[#e8001e]" size={22} />
                 Create New Poll
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Question (BN)</label>
                    <input type="text" value={form.question_bn} onChange={e => setForm({...form, question_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Question (EN)</label>
                    <input type="text" value={form.question_en} onChange={e => setForm({...form, question_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">End Date (Optional)</label>
                    <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Options</h4>
                    <button onClick={addOption} className="text-xs font-bold text-[#e8001e] hover:underline">+ Add Option</button>
                  </div>
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4">
                       <input type="text" value={opt.option_bn} onChange={e => updateOption(idx, 'option_bn', e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder={`Option ${idx+1} (BN)`} />
                       <input type="text" value={opt.option_en} onChange={e => updateOption(idx, 'option_en', e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder={`Option ${idx+1} (EN)`} />
                    </div>
                  ))}
               </div>

               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#e8001e] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#b8001a] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Launch Poll
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

