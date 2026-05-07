import { useState } from 'react';
import { Mail, Send, Eye, Plus, Search, X as XIcon, Trash2 } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';

export default function Newsletter({ newsletters = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject_bn: '',
    subject_en: '',
    content_bn: '',
    content_en: '',
    status: 'draft',
  });

  const handleSubmit = () => {
    router.post(route('admin.newsletter.store'), formData, {
      onSuccess: () => {
        setShowModal(false);
        showToast('Newsletter saved');
      }
    });
  };

  const totalSubscribers = 12450; 

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] flex items-center gap-3">
             <Mail className="w-6 h-6 text-[#263238]" />
             {lang === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'নিউজলেটার তৈরি ও পাঠানো' : 'Create and send newsletters'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন নিউজলেটার' : 'New Newsletter'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{totalSubscribers.toLocaleString('en-IN')}</div>
          <div className="text-xs text-[var(--text-muted,#9ca3af)] mt-1">{lang === 'bn' ? 'মোট সাবস্ক্রাইবার' : 'Total Subscribers'}</div>
        </div>
        <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-xl shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#10b981] font-['Inter']">71.6%</div>
          <div className="text-xs text-[#059669] mt-1">{lang === 'bn' ? 'ওপেন রেট' : 'Open Rate'}</div>
        </div>
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#3b82f6] font-['Inter']">26.0%</div>
          <div className="text-xs text-[#2563eb] mt-1">{lang === 'bn' ? 'ক্লিক রেট' : 'Click Rate'}</div>
        </div>
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#f59e0b] font-['Inter']">{newsletters.filter(n => n.status === 'sent').length}</div>
          <div className="text-xs text-[#d97706] mt-1">{lang === 'bn' ? 'মোট পাঠানো' : 'Total Sent'}</div>
        </div>
      </div>

      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map(nl => (
              <tr key={nl.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-[12.5px] font-medium text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? nl.subject_bn : nl.subject_en}</span>
                </td>
                <td className="px-6 py-4 text-[12.5px] text-[var(--text-muted,#9ca3af)]">{nl.sent_at ? new Date(nl.sent_at).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4"><Badge variant={nl.status === 'sent' ? 'green' : 'gray'}>{nl.status.toUpperCase()}</Badge></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => showToast('Previewing...')} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-500"><Eye size={16} /></button>
                    <button onClick={() => { if(confirm('Delete?')) router.delete(route('admin.newsletter.destroy', nl.id)) }} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Mail className="text-[#263238]" size={22} />
                {lang === 'bn' ? 'নিউজলেটার তৈরি করুন' : 'Create Newsletter'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XIcon size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase">Subject (BN)</label>
                   <input type="text" value={formData.subject_bn} onChange={e => setFormData({...formData, subject_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#263238] outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase">Subject (EN)</label>
                   <input type="text" value={formData.subject_en} onChange={e => setFormData({...formData, subject_en: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#263238] outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase">Content (BN)</label>
                 <textarea value={formData.content_bn} onChange={e => setFormData({...formData, content_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm h-32 focus:border-[#263238] outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase">Content (EN)</label>
                 <textarea value={formData.content_en} onChange={e => setFormData({...formData, content_en: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm h-32 focus:border-[#263238] outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#263238] outline-none">
                   <option value="draft">Save as Draft</option>
                   <option value="sent">Send Immediately</option>
                 </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleSubmit} className="flex-1 bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95">Save Newsletter</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 text-gray-600 rounded-2xl py-4 text-base font-bold transition-all hover:bg-gray-100 active:scale-95">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
