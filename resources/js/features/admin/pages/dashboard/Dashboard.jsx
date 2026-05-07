import { usePage } from '@inertiajs/react';
import { Newspaper, Users, MessageSquare, CreditCard, PenLine, Upload, TrendingUp, Flame, BarChart3, Globe, Zap, Clock, Activity, Calendar } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { CategoryBar } from '../../components/widgets/CategoryBar';
import { TrafficSource } from '../../components/widgets/TrafficSource';
import { QuickActions } from '../../components/widgets/QuickActions';
import { TodoList } from '../../components/widgets/TodoList';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { ReporterCard } from '../../components/widgets/ReporterCard';
import { ScheduleList } from '../../components/widgets/ScheduleList';
import { ServerHealth } from '../../components/widgets/ServerHealth';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function Dashboard({ 
  stats = {}, 
  miniStats = {}, 
  contentStatus = {}, 
  categoryBreakdown = [], 
  recentArticles = [], 
  traffic = {}, 
  activities = [], 
  serverHealth = {}, 
  schedule = [],
  widgets = {}
}) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  const { auth } = usePage().props;
  const userName = auth?.user?.name || '';

  // Standardizing keys from controller
  const s = stats || {};
  const ms = miniStats || {};
  const cs = contentStatus || { total: 0, published: {count:0, pct:0}, draft:{count:0, pct:0}, pending:{count:0, pct:0}, archived:{count:0, pct:0} };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-5.5 row-anim">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Newspaper className="w-5 h-5 text-[#263238]" />
            {t('adminDashboard')}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">
            {lang === 'bn' ? `স্বাগতম, ${userName}!` : `Welcome, ${userName}!`} {t('welcomeMessage')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5 row-anim">
        <StatCard icon={Newspaper} label={t('totalPublished')} value={s.totalPublished || '0'} change="12.4%" changeUp={true} linkText={t('viewAll')} onLinkClick={() => onNavigate?.('news')} color="red" />
        <StatCard icon={Users} label={t('todayVisitors')} value={s.todayVisitors || '0'} change="8.7%" changeUp={true} linkText={t('analyzeLinkBn')} onLinkClick={() => onNavigate?.('traffic')} color="blue" />
        <StatCard icon={MessageSquare} label={t('weeklyComments')} value={s.weeklyComments || '0'} change="5.2%" changeUp={true} linkText={t('approveLinkBn')} onLinkClick={() => onNavigate?.('dashboard')} color="green" />
        <StatCard icon={CreditCard} label={t('activeSubscribers')} value={s.activeSubscribers || '0'} change="3.8%" changeUp={true} linkText={t('viewMembersLinkBn')} onLinkClick={() => onNavigate?.('subscriptions')} color="orange" />
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5 row-anim">
        <MiniStat icon={PenLine} value={String(ms.reportersCount || 0)} label={t('reportersWriters')} change={t('newThisMonth')} changeColor="green" iconBg="bg-[#f5f3ff]" />
        <MiniStat icon={Upload} value={String(ms.pendingApproval || 0)} label={t('pendingApproval')} change={t('urgentItems')} changeColor="red" iconBg="bg-[#ecfeff]" />
        <MiniStat icon={TrendingUp} value={lang === 'bn' ? `৳ ${(ms.adRevenue / 100000).toFixed(1)} লাখ` : `৳ ${(ms.adRevenue / 100000).toFixed(1)}L`} label={t('adRevenueMonth')} change={t('revenueGrowth')} changeColor="green" iconBg="bg-[#ecfdf5]" />
        <MiniStat icon={Flame} value={lang === 'bn' ? `${ms.avgReadTime} মিনিট` : `${ms.avgReadTime} min`} label={t('avgReadTime')} change={t('readTimeIncrease')} changeColor="green" iconBg="bg-[#eceff1]" />
      </div>


      {/* Main Row: Traffic + Quick Actions */}
      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5 row-anim">
        {/* Traffic Overview */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('trafficOverviewHeader')}</h3>
            <div className="flex items-center gap-2.5">
              <select className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
                <option>{t('thisWeek')}</option>
              </select>
            </div>
          </div>
          <div className="px-5 pt-2.5 pb-5">
            <LineChart
              data={traffic.pageViews || []}
              data2={traffic.uniqueVisitors || []}
              labels={lang === 'bn' ? (traffic.labels || []) : (traffic.labelsEn || [])}
              color="#263238"
              color2="#3b82f6"
              gradientId="gRed"
              label1={t('pageviewsLabel')}
              label2={t('uniqueVisitorsLabel')}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold">{t('quickActions')}</h3>
          </div>
          <div className="p-4.5">
            <QuickActions onAction={(id) => { if (id === 'write') onNavigate?.('news-write'); }} showToast={showToast} lang={lang} />
          </div>
        </div>
      </div>

      {/* Row: Category Breakdown + Content Status */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4.5 mb-4.5 row-anim">
        {/* Category Breakdown */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('newsByCategory')}</h3>
          </div>
          <div className="p-5">
            <CategoryBar items={categoryBreakdown} lang={lang} />
          </div>
        </div>

        {/* Content Status Donut */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] text-center">
            <h3 className="text-sm font-bold">{t('contentStatusHeader')}</h3>
          </div>
          <div className="p-5">
            <DonutChart
              segments={[
                { name: t('publishedBn'), value: cs.published.count, pct: cs.published.pct, color: '#10b981' },
                { name: t('draftBn'), value: cs.draft.count, pct: cs.draft.pct, color: '#f59e0b' },
                { name: t('pendingBn'), value: cs.pending.count, pct: cs.pending.pct, color: '#263238' },
                { name: t('archivedBn'), value: cs.archived.count, pct: cs.archived.pct, color: '#3b82f6' },
              ]}
              centerValue={cs.total}
              centerLabel={t('totalArticlesCenter')}
            />
          </div>
        </div>

        {/* Server Health */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
           <div className="p-5">
              <ServerHealth data={serverHealth} lang={lang} />
           </div>
        </div>
      </div>

      {/* Row: Recent Articles */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5 row-anim">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('recentArticlesHeader')}</h3>
            <button onClick={() => onNavigate?.('news')} className="bg-[#263238] text-white text-[11.5px] font-semibold px-3 py-1.25 rounded-md hover:bg-[#1a2428] transition-colors">
              {t('viewAllNewsBn')}
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--body-bg,#f0f2f8)]">
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 border-b border-[var(--card-border,#e8ebf4)] text-left">{t('title')}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 border-b border-[var(--card-border,#e8ebf4)] text-left">{t('category')}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 border-b border-[var(--card-border,#e8ebf4)] text-left">{t('author')}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 border-b border-[var(--card-border,#e8ebf4)] text-left">{t('views')}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 border-b border-[var(--card-border,#e8ebf4)] text-left">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map(article => {
                const statusMap = {
                  published: { text: t('publishedBn'), variant: 'green' },
                  draft: { text: t('draftBn'), variant: 'gray' },
                  pending: { text: t('pendingBn'), variant: 'orange' },
                  in_review: { text: t('inReviewBn'), variant: 'blue' },
                };
                const status = statusMap[article.status] || statusMap.draft;
                return (
                  <tr key={article.id} className="hover:bg-[#fafbff] transition-colors">
                    <td className="px-4 py-2.75 text-[12.5px] border-b border-[#f3f4f6]">
                      <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px]">{lang === 'bn' ? article.titleBn : article.titleEn}</div>
                      <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.5">{article.time}</div>
                    </td>
                    <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                      <Badge variant={article.category === 'politics' ? 'red' : article.category === 'sports' ? 'green' : article.category === 'health' ? 'orange' : 'blue'}>
                        {lang === 'bn' ? article.categoryBn : article.categoryEn}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.75 text-[12.5px] text-[var(--text-secondary,#6b7280)] border-b border-[#f3f4f6]">
                      {article.author?.name || '—'}
                    </td>
                    <td className="px-4 py-2.75 text-[12.5px] font-semibold font-['Inter'] border-b border-[#f3f4f6]">{article.views > 0 ? article.views.toLocaleString('en-IN') : '—'}</td>
                    <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>

      {/* Final Row: Activity + Schedule */}
      <div className="grid grid-cols-[1fr_320px] gap-4.5 mb-5 row-anim">
        {/* Recent Activity */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('recentActivityHeader')}</h3>
          </div>
          <div className="p-4 pt-1.5">
            <ActivityFeed items={activities} lang={lang} />
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('todayScheduleHeader')}</h3>
          </div>
          <div className="p-4 pt-1.5">
            <ScheduleList items={schedule} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
