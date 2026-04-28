import { useState } from 'react';
import { Lightbulb, Plus, Check, X, Search, X as XIcon } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function PitchBoard() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [localPitches, setLocalPitches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const filtered = localPitches.filter(p =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (id) => {
    setLocalPitches(localPitches.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    showToast(lang === 'bn' ? 'পিচ অনুমোদিত হয়েছে' : 'Pitch approved');
  };

  const handleReject = (id) => {
    setLocalPitches(localPitches.filter(p => p.id !== id));
    showToast(lang === 'bn' ? 'পিচ প্রত্যাখ্যাত হয়েছে' : 'Pitch rejected');
  };

  const handleAdd = () => {
    if (!newTitle.trim()) { showToast(lang === 'bn' ? 'শিরোনাম প্রয়োজন!' : 'Title required!'); return; }
    setLocalPitches([...localPitches, { id: localPitches.length + 1, title: newTitle, titleEn: newTitle, author: lang === 'bn' ? 'রাফি আহমেদ' : 'Rafi Ahmed', authorEn: 'Rafi Ahmed', category: lang === 'bn' ? 'সাধারণ' : 'General', categoryEn: 'General', status: 'pending', date: new Date().toISOString().split('T')[0] }]);
    setNewTitle('');
    setShowModal(false);
    showToast(lang === 'bn' ? 'পিচ জমা হয়েছে' : 'Pitch submitted');
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">💡 {lang === 'bn' ? 'পিচ বোর্ড' : 'Pitch Board'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'সংবাদ আইডিয়া ও পিচ ব্যবস্থাপনা' : 'News ideas and pitch management'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন পিচ' : 'New Pitch'}
        </button>
      </div>
      <div className="flex items-center bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 gap-2 mb-4.5 max-w-sm">
        <Search className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
        <input type="text" placeholder={lang === 'bn' ? 'পিচ খুঁজুন...' : 'Search []...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-none bg-transparent outline-none text-sm w-full focus:outline-none focus:ring-0" />
        {searchQuery && <button onClick={() => setSearchQuery('')}><XIcon className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" /></button>}
      </div>
      <div className="grid grid-cols-3 gap-4.5">
        {filtered.map(pitch => (
          <div key={pitch.id} className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-[#f59e0b]" />
              <Badge variant={pitch.status === 'approved' ? 'green' : pitch.status === 'rejected' ? 'red' : 'orange'}>
                {pitch.status === 'approved' ? (lang === 'bn' ? 'অনুমোদিত' : 'Approved') : pitch.status === 'rejected' ? (lang === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected') : (lang === 'bn' ? 'অপেক্ষায়' : 'Pending')}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)] mb-1">{lang === 'bn' ? pitch.title : pitch.titleEn}</h3>
            <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mb-3">{pitch.date} · {lang === 'bn' ? pitch.author : pitch.authorEn}</div>
            <Badge variant="blue">{lang === 'bn' ? pitch.category : pitch.categoryEn}</Badge>
            {pitch.status === 'pending' && (
              <div className="flex items-center gap-2 pt-3 border-t border-[#f3f4f6] mt-3">
                <button onClick={() => handleApprove(pitch.id)} className="flex-1 bg-[#10b981] text-white text-[11px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-[#059669] transition-colors">
                  <Check className="w-3 h-3" /> {lang === 'bn' ? 'অনুমোদন' : 'Approve'}
                </button>
                <button onClick={() => handleReject(pitch.id)} className="flex-1 bg-white text-[#e8001e] border border-[#e8001e] text-[11px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-[#fff0f2] transition-colors">
                  <X className="w-3 h-3" /> {lang === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{lang === 'bn' ? 'নতুন পিচ জমা দিন' : 'Submit New Pitch'}</h3>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={lang === 'bn' ? 'পিচের শিরোনাম...' : 'Pitch title...'} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] mb-4" />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 bg-[#e8001e] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#b8001a]">{lang === 'bn' ? 'জমা দিন' : 'Submit'}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg py-2 text-sm font-semibold hover:bg-gray-50">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
