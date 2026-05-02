import { Newspaper, Users, MessageSquare, TrendingUp, PenLine, FileText, Clock, BarChart3, CalendarDays, Calendar, AlertTriangle, Send, ListChecks, ClipboardList, Zap, Activity, CheckSquare } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { QuickActions } from '../../components/widgets/QuickActions';
import { TodoList } from '../../components/widgets/TodoList';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function ManagingEditorDashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const pendingCount = [].filter(a => a.status === 'pending' || a.status === 'in_review').length;
  const draftCount = [].filter(a => a.status === 'draft').length;

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <ClipboardList className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'ব্যবস্থাপনা সম্পাদক ড্যাশবোর্ড' : 'Managing Editor Dashboard'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'দৈনন্দিন সম্পাদকীয় পরিচালনা ও ওয়ার্কফ্লো ব্যবস্থাপনা' : 'Day-to-day editorial operations and workflow management'}</p>
        </div>
        <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={ListChecks} label={lang === 'bn' ? 'ওয়ার্কফ্লো পাইপলাইন' : 'Workflow Pipeline'} value={String(pendingCount + draftCount)} change={lang === 'bn' ? `${pendingCount} অনুমোদন` : `${pendingCount} approvals`} changeUp={false} linkText={lang === 'bn' ? 'পাইপলাইন দেখুন →' : 'View pipeline →'} onLinkClick={() => showToast(lang === 'bn' ? 'ওয়ার্কফ্লো পাইপলাইন' : 'Workflow pipeline')} color="blue" />
        <StatCard icon={Clock} label={lang === 'bn' ? 'ডেডলাইন সতর্কতা' : 'Deadline Alerts'} value="5" change={lang === 'bn' ? '▲ ২ জরুরি' : '▲ 2 urgent'} changeUp={false} linkText={lang === 'bn' ? 'দেখুন →' : 'View →'} onLinkClick={() => showToast(lang === 'bn' ? 'ডেডলাইন সতর্কতা' : 'Deadline alerts')} color="orange" />
        <StatCard icon={Send} label={lang === 'bn' ? 'আজ প্রকাশিত' : 'Published Today'} value="24" change="12.4%" changeUp={true} linkText={t('viewAll')} onLinkClick={() => onNavigate?.('news')} color="green" />
        <StatCard icon={Users} label={lang === 'bn' ? 'সক্রিয় সাংবাদিক' : 'Active Reporters'} value="8" change={lang === 'bn' ? '৩ জন অনলাইন' : '3 online'} changeUp={true} linkText={lang === 'bn' ? 'টিম দেখুন →' : 'View team →'} onLinkClick={() => onNavigate?.('dashboard')} color="purple" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={FileText} value="12" label={lang === 'bn' ? 'ড্রাফট অপেক্ষায়' : 'Drafts Pending'} change={lang === 'bn' ? '▲ ৪ আজ' : '▲ 4 today'} changeColor="orange" iconBg="bg-[#ecfeff]" />
        <MiniStat icon={MessageSquare} value="47" label={lang === 'bn' ? 'মন্তব্য অপেক্ষায়' : 'Comments Pending'} change={lang === 'bn' ? '▲ ১২ নতুন' : '▲ 12 new'} changeColor="red" iconBg="bg-[#eff6ff]" />
        <MiniStat icon={BarChart3} value="89K" label={lang === 'bn' ? 'শীর্ষ পাঠক' : 'Top Readers'} change={lang === 'bn' ? '▲ ক্রিকেট' : '▲ Cricket'} changeColor="green" iconBg="bg-[#ecfdf5]" />
        <MiniStat icon={CalendarDays} value="8" label={lang === 'bn' ? 'নির্ধারিত প্রকাশ' : 'Scheduled Posts'} change={lang === 'bn' ? '▲ আজকে' : '▲ Today'} changeColor="green" iconBg="bg-[#f5f3ff]" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'ট্র্যাফিক ওভারভিউ' : 'Traffic Overview'}
            </h3>
            <select className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
              <option>{lang === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</option>
              <option>{lang === 'bn' ? 'এই মাস' : 'This Month'}</option>
            </select>
          </div>
          <div className="px-5 pt-2.5">
            <LineChart 
              data={[65, 59, 80, 81, 56, 55, 40]} 
              labels={lang === 'bn' ? ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} 
              color="#e8001e" 
              gradientId="gRed" 
            />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
            </h3>
          </div>
          <div className="p-4.5">
            <QuickActions onAction={(id) => { if (id === 'write') onNavigate?.('news-write'); }} showToast={showToast} lang={lang} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4.5 mb-5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8b5cf6]" />
              {lang === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
            </h3>
          </div>
          <div className="p-4 pt-1.5">
            <ActivityFeed items={[]} />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#10b981]" />
              {lang === 'bn' ? 'কাজের তালিকা' : 'Todo List'}
            </h3>
          </div>
          <div className="p-4 pt-1.5">
            <TodoList items={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
