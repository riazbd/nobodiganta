import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function EditorialCalendar() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const scheduled = [
    { day: 6, titleBn: 'সংসদে সাইবার আইন', titleEn: 'Cyber Law in Parliament', status: 'published', time: '10:30' },
    { day: 6, titleBn: 'বোরো ধানের ফলন', titleEn: 'Boro Rice Harvest', status: 'published', time: '08:15' },
    { day: 7, titleBn: 'বাংলাদেশ বনাম শ্রীলঙ্কা', titleEn: 'Bangladesh vs Sri Lanka', status: 'scheduled', time: '18:00' },
    { day: 8, titleBn: 'অর্থনীতি বিশ্লেষণ', titleEn: 'Economy Analysis', status: 'scheduled', time: '12:00' },
    { day: 10, titleBn: 'মেটার নতুন AI মডেল', titleEn: 'Meta New AI Model', status: 'scheduled', time: '14:00' },
    { day: 15, titleBn: 'শিক্ষা সংস্কার', titleEn: 'Education Reform', status: 'scheduled', time: '11:00' },
    { day: 20, titleBn: 'ক্রিকেট বিশ্বকাপ আপডেট', titleEn: 'Cricket World Cup Update', status: 'scheduled', time: '16:00' },
  ];

  const statusColorMap = { published: '#10b981', scheduled: '#3b82f6', draft: '#f59e0b' };
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Calendar className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'সম্পাদকীয় ক্যালেন্ডার' : 'Editorial Calendar'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'কন্টেন্ট পরিকল্পনা ও শিডিউলিং' : 'Content planning and scheduling'}</p>
        </div>
        <button onClick={() => showToast(lang === 'bn' ? 'নতুন সংবাদ শিডিউল করুন' : 'Schedule new article')} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন শিডিউল' : 'New Schedule'}
        </button>
      </div>
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-bold">{lang === 'bn' ? `${monthNamesBn[month]} ${year}` : `${monthNamesEn[month]} ${year}`}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7">
          {(lang === 'bn' ? dayNamesBn : dayNamesEn).map((d, i) => (
            <div key={i} className="px-3 py-2 text-center text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] border-b border-[var(--card-border,#e8ebf4)] bg-[var(--body-bg,#f0f2f8)]">{d}</div>
          ))}
          {cells.map((day, i) => {
            const dayArticles = day ? scheduled.filter(a => a.day === day) : [];
            return (
              <div key={i} className={`min-h-[80px] p-2 border-b border-r border-[#f3f4f6] ${day ? 'hover:bg-[#fafbff]' : 'bg-[#f9fafb]'}`}>
                {day && (
                  <>
                    <div className="text-xs font-semibold text-[var(--text-secondary,#6b7280)] mb-1">{day}</div>
                    {dayArticles.map((a, j) => (
                      <div key={j} className="text-[10px] p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80" style={{ backgroundColor: statusColorMap[a.status] + '20', color: statusColorMap[a.status], borderLeft: `2px solid ${statusColorMap[a.status]}` }}>
                        <div className="font-medium truncate">{lang === 'bn' ? a.titleBn : a.titleEn}</div>
                        <div className="flex items-center gap-0.5 opacity-70"><Clock className="w-2.5 h-2.5" />{a.time}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4.5 bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? '📊 মাসিক সারসংক্ষেপ' : '📊 Monthly Summary'}</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center"><div className="text-2xl font-bold text-[#10b981] font-['Inter']">2</div><div className="text-xs text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-[#3b82f6] font-['Inter']">5</div><div className="text-xs text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'নির্ধারিত' : 'Scheduled'}</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-[#f59e0b] font-['Inter']">3</div><div className="text-xs text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'ড্রাফট' : 'Drafts'}</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-[#8b5cf6] font-['Inter']">10</div><div className="text-xs text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'মোট' : 'Total'}</div></div>
        </div>
      </div>
    </div>
  );
}
