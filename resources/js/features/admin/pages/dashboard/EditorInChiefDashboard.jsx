import { Newspaper, Users, MessageSquare, TrendingUp, PenLine, FileText, AlertTriangle, BarChart3, Clock, Award, CalendarDays, Calendar, Globe, Megaphone, Shield, Crown, FolderTree, Activity } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { CategoryBar } from '../../components/widgets/CategoryBar';
import { QuickActions } from '../../components/widgets/QuickActions';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { ReporterCard } from '../../components/widgets/ReporterCard';
import { ScheduleList } from '../../components/widgets/ScheduleList';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import { PERMISSIONS } from '../../api/permissions';

export default function EditorInChiefDashboard({ 
  stats = {}, 
  miniStats = {}, 
  contentStatus = {}, 
  categoryBreakdown = [], 
  recentArticles = [], 
  traffic = {}, 
  activities = [], 
  serverHealth = {}, 
  schedule = [] 
}) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermission();
  const { onNavigate } = useAdminNavigation();

  const cs = contentStatus || { total: 0, published: {count:0, pct:0}, draft:{count:0, pct:0}, pending:{count:0, pct:0}, archived:{count:0, pct:0} };
  const s = stats || {};
  const ms = miniStats || {};

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Crown className="w-5 h-5 text-[#f59e0b]" />
            {lang === 'bn' ? 'প্রধান সম্পাদক ড্যাশবোর্ড' : 'Editor-in-Chief Dashboard'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'সম্পাদকীয় নিয়ন্ত্রণ ও চূড়ান্ত অনুমোদন' : 'Editorial oversight and final approval authority'}</p>
        </div>
        <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> <span>{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={FileText} label={lang === 'bn' ? 'মুলতুবি অনুমোদন' : 'Pending Approvals'} value={String(ms.pendingApproval || 0)} change={lang === 'bn' ? 'জরুরি' : 'Urgent'} changeUp={false} linkText={lang === 'bn' ? 'অনুমোদন করুন →' : 'Approve →'} onLinkClick={() => onNavigate?.('news-pending')} color="red" />
        <StatCard icon={Newspaper} label={lang === 'bn' ? 'আজ প্রকাশিত' : 'Published Today'} value="24" change="12.4%" changeUp={true} linkText={t('viewAll')} onLinkClick={() => onNavigate?.('news')} color="green" />
        <StatCard icon={Users} label={lang === 'bn' ? 'সক্রিয় সাংবাদিক' : 'Active Reporters'} value={String(ms.reportersCount || 0)} change={lang === 'bn' ? '৩ জন অনলাইন' : '3 online'} changeUp={true} linkText={lang === 'bn' ? 'টিম দেখুন →' : 'View team →'} onLinkClick={() => onNavigate?.('dashboard')} color="blue" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'আজকের ভিজিটর' : "Today's Visitors"} value={s.todayVisitors || '0'} change="8.7%" changeUp={true} linkText={lang === 'bn' ? 'বিশ্লেষণ →' : 'Analyze →'} onLinkClick={() => onNavigate?.('traffic')} color="orange" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={MessageSquare} value="47" label={lang === 'bn' ? 'মন্তব্য অপেক্ষায়' : 'Comments Pending'} change={lang === 'bn' ? '▲ ১২ নতুন' : '▲ 12 new'} changeColor="red" iconBg="bg-[#eff6ff]" />
        <MiniStat icon={AlertTriangle} value="3" label={lang === 'bn' ? 'আইনি পর্যালোচনা' : 'Legal Review'} change={lang === 'bn' ? '▲ জরুরি' : '▲ Urgent'} changeColor="red" iconBg="bg-[#fffbeb]" />
        <MiniStat icon={BarChart3} value="89K" label={lang === 'bn' ? 'শীর্ষ পাঠক সংখ্যা' : 'Top Article Views'} change={lang === 'bn' ? '▲ ক্রিকেট' : '▲ Cricket'} changeColor="green" iconBg="bg-[#ecfdf5]" />
        <MiniStat icon={Globe} value="62%" label={lang === 'bn' ? 'সোশ্যাল শেয়ার' : 'Social Shares'} change={lang === 'bn' ? '▲ ৫.২%' : '▲ 5.2%'} changeColor="green" iconBg="bg-[#f5f3ff]" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'রিয়েল-টাইম ট্র্যাফিক' : 'Real-Time Traffic'}
            </h3>
          </div>
          <div className="px-5 pt-2.5">
            <LineChart data={traffic.pageViews || []} labels={lang === 'bn' ? (traffic.labels || []) : (traffic.labelsEn || [])} color="#e8001e" gradientId="gRed" />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold">{t('quickActions')}</h3>
          </div>
          <div className="p-4.5">
            <QuickActions onAction={(id) => { if (id === 'write') onNavigate?.('news-write'); }} showToast={showToast} lang={lang} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_320px] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'বিভাগ অনুযায়ী সংবাদ' : 'News by Category'}
            </h3>
          </div>
          <div className="p-5">
            <CategoryBar items={categoryBreakdown} lang={lang} />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
              {lang === 'bn' ? 'কন্টেন্ট অবস্থা' : 'Content Status'}
            </h3>
          </div>
          <div className="p-5">
            <DonutChart
              segments={[
                { name: lang === 'bn' ? 'প্রকাশিত' : 'Published', value: cs.published.count, pct: cs.published.pct, color: '#10b981' },
                { name: lang === 'bn' ? 'ড্রাফট' : 'Draft', value: cs.draft.count, pct: cs.draft.pct, color: '#f59e0b' },
                { name: lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending', value: cs.pending.count, pct: cs.pending.pct, color: '#e8001e' },
                { name: lang === 'bn' ? 'আর্কাইভড' : 'Archived', value: cs.archived.count, pct: cs.archived.pct, color: '#3b82f6' },
              ]}
              centerValue={cs.total}
              centerLabel={lang === 'bn' ? 'মোট সংবাদ' : 'Total Articles'}
            />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#f59e0b]" />
              {lang === 'bn' ? 'শীর্ষ সাংবাদিক' : 'Top Reporters'}
            </h3>
          </div>
          <div className="p-4 pt-1.5">
            <ReporterCard data={[]} lang={lang} />
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
            <ActivityFeed items={activities} lang={lang} />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#e8001e]" />
            <h3 className="text-sm font-bold">{lang === 'bn' ? 'আজকের শিডিউল' : 'Today\'s Schedule'}</h3>
          </div>
          <div className="p-4 pt-1.5">
            <ScheduleList items={schedule} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
