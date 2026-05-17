import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BarChart2, Plus, Trash2, X, Save, RefreshCw, Activity, Calendar, Power, ImageIcon } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const EMPTY_OPTION = { option_bn: '', option_en: '', votes: '' };
const EMPTY_FORM = () => ({
  question_bn: '', question_en: '',
  is_active: true,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  featured_image: '',
  options: [{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }],
});

export default function PollManagement({ polls = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});
  const [form, setForm]           = useState(EMPTY_FORM());
  const [imgError, setImgError]   = useState(false);

  const openModal = () => { setForm(EMPTY_FORM()); setErrors({}); setImgError(false); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateOption = (idx, field, val) => {
    const next = form.options.map((o, i) => i === idx ? { ...o, [field]: val } : o);
    setForm(f => ({ ...f, options: next }));
  };

  const addOption    = () => setForm(f => ({ ...f, options: [...f.options, { ...EMPTY_OPTION }] }));
  const removeOption = (idx) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));

  const handleSubmit = () => {
    setSaving(true);
    setErrors({});
    const payload = {
      ...form,
      options: form.options.map(o => ({ ...o, votes: o.votes === '' ? 0 : Number(o.votes) })),
    };
    router.post(route('admin.polls.store'), payload, {
      onSuccess: () => { setSaving(false); closeModal(); showToast(lang === 'bn' ? 'জরিপ তৈরি হয়েছে' : 'Poll created'); },
      onError: (errs) => { setSaving(false); setErrors(errs); },
    });
  };

  const handleToggle = (id) => {
    router.patch(route('admin.polls.toggle', id), {}, {
      onSuccess: () => showToast(lang === 'bn' ? 'জরিপ আপডেট হয়েছে' : 'Poll updated'),
    });
  };

  const handleDelete = (id) => {
    const msg = lang === 'bn' ? 'এই জরিপটি মুছে ফেলবেন?' : 'Delete this poll?';
    if (confirm(msg)) {
      router.delete(route('admin.polls.destroy', id), {
        onSuccess: () => showToast(lang === 'bn' ? 'জরিপ মুছে ফেলা হয়েছে' : 'Poll deleted'),
      });
    }
  };

  return (
    <div className="p-6">
      <Head title={lang === 'bn' ? 'জনমত জরিপ' : 'Poll Management'} />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-[#263238]" />
            {lang === 'bn' ? 'জনমত জরিপ ব্যবস্থাপনা' : 'Poll Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'bn' ? 'পাঠকদের জরিপ ও ফলাফল পরিচালনা করুন' : 'Manage reader polls and results'}
          </p>
        </div>
        <button onClick={openModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন জরিপ' : 'New Poll'}
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">{lang === 'bn' ? 'কোনো জরিপ নেই' : 'No polls yet'}</p>
          <p className="text-sm mt-1">{lang === 'bn' ? 'নতুন জরিপ তৈরি করুন' : 'Create your first poll'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map(poll => {
            const total = poll.total_votes || 0;
            return (
              <div key={poll.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <Badge variant={poll.is_active ? 'green' : 'gray'} className="mb-2">
                      {poll.is_active ? (lang === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'INACTIVE')}
                    </Badge>
                    {poll.featured_image && (
                      <img src={poll.featured_image} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{lang === 'bn' ? poll.question_bn : poll.question_en}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {poll.start_date} – {poll.end_date || (lang === 'bn' ? 'চলমান' : 'Ongoing')}</span>
                      <span className="flex items-center gap-1"><Activity size={12} /> {total} {lang === 'bn' ? 'ভোট' : 'votes'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(poll.id)}
                      title={poll.is_active ? (lang === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate') : (lang === 'bn' ? 'সক্রিয় করুন' : 'Activate')}
                      className={`p-2 rounded-lg transition-colors ${poll.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      <Power size={18} />
                    </button>
                    <button onClick={() => handleDelete(poll.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {poll.options?.map(opt => {
                    const pct = total > 0 ? Math.round(opt.votes / total * 100) : 0;
                    return (
                      <div key={opt.id} className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-gray-700">{lang === 'bn' ? opt.option_bn : opt.option_en}</span>
                          <span className="font-black text-[#263238]">{pct}% <span className="font-normal text-gray-400">({opt.votes})</span></span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#263238] h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="text-[#263238]" size={22} />
                {lang === 'bn' ? 'নতুন জরিপ তৈরি' : 'Create New Poll'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto">
              {/* Questions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">প্রশ্ন (বাংলা) *</label>
                  <input type="text" value={form.question_bn} onChange={e => setField('question_bn', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238] ${errors.question_bn ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.question_bn && <p className="text-red-500 text-xs mt-1">{errors.question_bn}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Question (English) *</label>
                  <input type="text" value={form.question_en} onChange={e => setField('question_en', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238] ${errors.question_en ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.question_en && <p className="text-red-500 text-xs mt-1">{errors.question_en}</p>}
                </div>
              </div>

              {/* Featured image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase flex items-center gap-1"><ImageIcon size={12} /> Featured Image URL</label>
                <input type="url" value={form.featured_image} onChange={e => { setField('featured_image', e.target.value); setImgError(false); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" placeholder="https://..." />
                {form.featured_image && !imgError && (
                  <img src={form.featured_image} alt="preview" onError={() => setImgError(true)}
                    className="mt-2 w-full h-28 object-cover rounded-xl border border-gray-100" />
                )}
                {imgError && <p className="text-orange-500 text-xs mt-1">{lang === 'bn' ? 'ছবি লোড হচ্ছে না' : 'Image failed to load'}</p>}
              </div>

              {/* Dates + Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শুরুর তারিখ' : 'Start Date'} *</label>
                  <input type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শেষের তারিখ' : 'End Date'}</label>
                  <input type="date" value={form.end_date} onChange={e => setField('end_date', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setField('is_active', !form.is_active)}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {form.is_active ? (lang === 'bn' ? 'সক্রিয় করে প্রকাশ করুন' : 'Publish as active') : (lang === 'bn' ? 'নিষ্ক্রিয় রাখুন' : 'Save as inactive')}
                </span>
              </label>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'বিকল্পসমূহ' : 'Options'}</h4>
                  <button onClick={addOption} className="text-xs font-bold text-[#263238] hover:underline">+ {lang === 'bn' ? 'বিকল্প যোগ করুন' : 'Add Option'}</button>
                </div>
                <div className="space-y-3">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input type="text" value={opt.option_bn} onChange={e => updateOption(idx, 'option_bn', e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#263238]"
                          placeholder={`${lang === 'bn' ? 'বিকল্প' : 'Option'} ${idx + 1} (বাং)`} />
                        <input type="text" value={opt.option_en} onChange={e => updateOption(idx, 'option_en', e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#263238]"
                          placeholder={`Option ${idx + 1} (EN)`} />
                      </div>
                      <input type="number" value={opt.votes} min="0" onChange={e => updateOption(idx, 'votes', e.target.value)}
                        className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#263238] text-center"
                        placeholder="0" title={lang === 'bn' ? 'প্রাথমিক ভোট' : 'Seed votes'} />
                      {form.options.length > 2 && (
                        <button onClick={() => removeOption(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.options && <p className="text-red-500 text-xs mt-2">{errors.options}</p>}
                <p className="text-xs text-gray-400 mt-2">{lang === 'bn' ? 'ডান কলামে প্রাথমিক ভোট সংখ্যা দিন' : 'Right column: seed vote count per option'}</p>
              </div>

              <button onClick={handleSubmit} disabled={saving}
                className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                {lang === 'bn' ? 'জরিপ প্রকাশ করুন' : 'Launch Poll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
