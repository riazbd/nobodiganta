import { useState } from 'react';
import { CalendarDays, Plus, Search, X as XIcon, User, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function AssignmentBoard() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([
    { id: 1, titleBn: 'সংসদে নতুন বিল', titleEn: 'New Bill in Parliament', reporter: 'সানাউল্লাহ মাহমুদ', reporterEn: 'Sanaullah Mahmud', deadline: '2026-04-07', status: 'in_progress', priority: 'high' },
    { id: 2, titleBn: 'ক্রিকেট ম্যাচ রিপোর্ট', titleEn: 'Cricket Match Report', reporter: 'শফিউল আলম', reporterEn: 'Shafiul Alam', deadline: '2026-04-06', status: 'completed', priority: 'medium' },
    { id: 3, titleBn: 'অর্থনীতি বিশ্লেষণ', titleEn: 'Economy Analysis', reporter: 'ড. নাজমুল হক', reporterEn: 'Dr. Nazmul Haque', deadline: '2026-04-08', status: 'pending', priority: 'low' },
    { id: 4, titleBn: 'প্রযুক্তি আপডেট', titleEn: 'Technology Update', reporter: 'মেহজাবিন রহমান', reporterEn: 'Mehjabin Rahman', deadline: '2026-04-07', status: 'in_progress', priority: 'medium' },
    { id: 5, titleBn: 'আন্তর্জাতিক সংবাদ', titleEn: 'International News', reporter: 'রাবেয়া খানম', reporterEn: 'Rabeya Khanam', deadline: '2026-04-06', status: 'completed', priority: 'high' },
  ]);

  const filtered = assignments.filter(a =>
    !searchQuery || a.titleBn.includes(searchQuery) || a.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusMap = {
    pending: { bn: 'অপেক্ষায়', en: 'Pending', variant: 'gray' },
    in_progress: { bn: 'চলমান', en: 'In Progress', variant: 'blue' },
    completed: { bn: 'সম্পন্ন', en: 'Completed', variant: 'green' },
  };

  const priorityMap = {
    high: { bn: 'জরুরি', en: 'Urgent', color: '#e8001e' },
    medium: { bn: 'মাঝারি', en: 'Medium', color: '#f59e0b' },
    low: { bn: 'নিম্ন', en: 'Low', color: '#3b82f6' },
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <ClipboardList className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'অ্যাসাইনমেন্ট বোর্ড' : 'Assignment Board'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'সাংবাদিকদের কাজ বরাদ্দ ও ট্র্যাকিং' : 'Reporter task assignment and tracking'}</p>
        </div>
        <button onClick={() => showToast(lang === 'bn' ? 'নতুন অ্যাসাইনমেন্ট যোগ করুন' : 'Add new assignment')} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignment'}
        </button>
      </div>
      <div className="flex items-center bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 gap-2 mb-4.5 max-w-sm">
        <Search className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
        <input type="text" placeholder={lang === 'bn' ? 'অ্যাসাইনমেন্ট খুঁজুন...' : 'Search assignments...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-none bg-transparent outline-none text-sm w-full focus:outline-none focus:ring-0" />
        {searchQuery && <button onClick={() => setSearchQuery('')}><XIcon className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" /></button>}
      </div>
      <div className="space-y-3">
        {filtered.map(a => {
          const status = statusMap[a.status];
          const priority = priorityMap[a.priority];
          return (
            <div key={a.id} className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e8001e] to-[#ff6b6b] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {(lang === 'bn' ? a.reporter : a.reporterEn).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? a.titleBn : a.titleEn}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[var(--text-muted,#9ca3af)] flex items-center gap-1"><User className="w-3 h-3" />{lang === 'bn' ? a.reporter : a.reporterEn}</span>
                  <span className="text-[11px] text-[var(--text-muted,#9ca3af)] flex items-center gap-1"><Clock className="w-3 h-3" />{a.deadline}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant}>{lang === 'bn' ? status.bn : status.en}</Badge>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priority.color }} title={lang === 'bn' ? priority.bn : priority.en} />
              </div>
              {a.status === 'pending' && (
                <button onClick={() => { setAssignments(assignments.map(x => x.id === a.id ? { ...x, status: 'in_progress' } : x)); showToast(lang === 'bn' ? 'শুরু হয়েছে' : 'Started'); }} className="bg-[#e8001e] text-white text-[11px] font-semibold px-3 py-1.5 rounded-md hover:bg-[#b8001a] transition-colors">
                  {lang === 'bn' ? 'শুরু করুন' : 'Start'}
                </button>
              )}
              {a.status === 'in_progress' && (
                <button onClick={() => { setAssignments(assignments.map(x => x.id === a.id ? { ...x, status: 'completed' } : x)); showToast(lang === 'bn' ? 'সম্পন্ন হয়েছে!' : 'Completed!'); }} className="bg-[#10b981] text-white text-[11px] font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#059669] transition-colors">
                  <CheckCircle className="w-3 h-3" /> {lang === 'bn' ? 'সম্পন্ন' : 'Complete'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
