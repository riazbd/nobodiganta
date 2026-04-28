import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trophy, Plus, Edit3, Trash2, X, Save, Search, RefreshCw, Activity, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function CricketManagement({ matches = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    series_bn: '',
    series_en: '',
    status: 'upcoming',
    status_text_bn: '',
    status_text_en: '',
    teams: [
      { name_bn: '', name_en: '', score: '', wickets: '', overs: '' },
      { name_bn: '', name_en: '', score: '', wickets: '', overs: '' }
    ],
    sort_order: 0
  });

  const openAddModal = () => {
    setEditingMatch(null);
    setForm({
      series_bn: '', series_en: '', status: 'upcoming', status_text_bn: '', status_text_en: '',
      teams: [
        { name_bn: '', name_en: '', score: '', wickets: '', overs: '' },
        { name_bn: '', name_en: '', score: '', wickets: '', overs: '' }
      ],
      sort_order: 0
    });
    setShowModal(true);
  };

  const openEditModal = (match) => {
    setEditingMatch(match);
    setForm({
      series_bn: match.series_bn,
      series_en: match.series_en,
      status: match.status,
      status_text_bn: match.status_text_bn || '',
      status_text_en: match.status_text_en || '',
      teams: match.teams,
      sort_order: match.sort_order
    });
    setShowModal(true);
  };

  const updateTeam = (idx, field, val) => {
    const next = [...form.teams];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, teams: next });
  };

  const handleSubmit = () => {
    setSaving(true);
    if (editingMatch) {
      router.put(route('admin.cricket.update', editingMatch.id), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Match updated'); },
        onError: () => setSaving(false)
      });
    } else {
      router.post(route('admin.cricket.store'), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Match added'); },
        onError: () => setSaving(false)
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Cricket Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <Trophy className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'ক্রিকেট স্কোর ব্যবস্থাপনা' : 'Cricket Score Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'লাইভ ক্রিকেট স্কোর ও শিডিউল পরিচালনা করুন' : 'Manage live cricket scores and schedules'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন ম্যাচ' : 'Add Match'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map(match => (
          <div key={match.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 group hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                 <Badge variant={match.status === 'live' ? 'red' : match.status === 'upcoming' ? 'blue' : 'gray'} className="mb-2">
                    {match.status.toUpperCase()}
                 </Badge>
                 <h3 className="font-bold text-gray-900">{lang === 'bn' ? match.series_bn : match.series_en}</h3>
                 <div className="text-xs text-gray-400 font-medium mt-1">{lang === 'bn' ? match.status_text_bn : match.status_text_en}</div>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => openEditModal(match)} className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Edit3 size={16} /></button>
                 <button onClick={() => { if(confirm('Delete?')) router.delete(route('admin.cricket.destroy', match.id)) }} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-[#e8001e] transition-all"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="space-y-4">
               {match.teams.map((team, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {team.name_en?.substring(0, 3).toUpperCase()}
                       </div>
                       <span className="font-bold text-sm text-gray-700">{lang === 'bn' ? team.name_bn : team.name_en}</span>
                    </div>
                    {match.status !== 'upcoming' && (
                      <div className="flex items-baseline gap-1">
                         <span className="text-lg font-black text-gray-900 font-Inter">{team.score || 0}</span>
                         <span className="text-xs font-bold text-gray-400">/{team.wickets || 0}</span>
                         <span className="text-[10px] text-gray-400 ml-1">({team.overs || 0})</span>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Trophy className="text-[#e8001e]" size={22} />
                 {editingMatch ? 'Edit Match' : 'Add New Match'}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Series (BN)</label>
                    <input type="text" value={form.series_bn} onChange={e => setForm({...form, series_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Series (EN)</label>
                    <input type="text" value={form.series_en} onChange={e => setForm({...form, series_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]">
                       <option value="live">Live</option>
                       <option value="upcoming">Upcoming</option>
                       <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Status Text (e.g. Day 1, Stumps)</label>
                    <div className="grid grid-cols-2 gap-2">
                       <input type="text" value={form.status_text_bn} onChange={e => setForm({...form, status_text_bn: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" placeholder="Bangla" />
                       <input type="text" value={form.status_text_en} onChange={e => setForm({...form, status_text_en: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" placeholder="English" />
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Teams & Scores</h4>
                  {form.teams.map((team, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <input type="text" value={team.name_bn} onChange={e => updateTeam(idx, 'name_bn', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder={`Team ${idx+1} Name (BN)`} />
                          <input type="text" value={team.name_en} onChange={e => updateTeam(idx, 'name_en', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder={`Team ${idx+1} Name (EN)`} />
                       </div>
                       {form.status !== 'upcoming' && (
                         <div className="grid grid-cols-3 gap-4">
                            <input type="text" value={team.score} onChange={e => updateTeam(idx, 'score', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder="Score" />
                            <input type="text" value={team.wickets} onChange={e => updateTeam(idx, 'wickets', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder="Wickets" />
                            <input type="text" value={team.overs} onChange={e => updateTeam(idx, 'overs', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e8001e]" placeholder="Overs" />
                         </div>
                       )}
                    </div>
                  ))}
               </div>

               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#e8001e] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#b8001a] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save Match Details
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
